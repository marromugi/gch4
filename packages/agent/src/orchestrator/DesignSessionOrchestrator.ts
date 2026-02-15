import { FormDesignerAgent } from '../agent/formDesigner/FormDesignerAgent'
import { NoOpLogger } from '../logger'
import type { GeneratedField, Question } from '../agent/formDesigner/tools'
import type {
  CollectedAnswer,
  FormDesignerContext,
  FormDesignerState,
  FormDesignerTurnResult,
  UserAnswerInput,
} from '../agent/formDesigner/types'
import type { ILogger } from '../logger'
import type { ILLMProvider, LLMMessage, TokenUsage } from '../provider'
import type { IKVStore } from '../store/IKVStore'

/**
 * デザインセッションの TTL（24時間）
 */
export const DESIGN_SESSION_TTL = 60 * 60 * 24

/**
 * KV キー生成
 */
export const DesignSessionKVKeys = {
  session: (sessionId: string) => `design-session:${sessionId}`,
} as const

/**
 * デザインセッションの処理結果
 */
export interface DesignSessionResult {
  /** セッションID */
  sessionId: string
  /** セッション状態 */
  status: 'asking' | 'completed'
  /** 質問（asking の場合） */
  questions?: Question[]
  /** 生成されたフィールド（completed の場合） */
  fields?: GeneratedField[]
  /** トークン使用量 */
  usage?: TokenUsage
}

/**
 * デザインセッションのストレージ形式
 */
export interface DesignSessionStorage {
  sessionId: string
  purpose: string
  status: 'asking' | 'generating' | 'completed'
  collectedAnswers: CollectedAnswer[]
  pendingQuestions: Question[]
  generatedFields?: GeneratedField[]
  messages: LLMMessage[]
  createdAt: number
  updatedAt: number
}

/**
 * DesignSessionOrchestrator の依存関係
 */
export interface DesignSessionOrchestratorDeps {
  kvStore: IKVStore
  provider: ILLMProvider
  logger?: ILogger
}

/**
 * DesignSessionOrchestrator
 *
 * FormDesigner エージェントを使用してフォーム設計セッションを管理する。
 */
export class DesignSessionOrchestrator {
  private readonly kvStore: IKVStore
  private readonly provider: ILLMProvider
  private readonly logger: ILogger

  constructor(deps: DesignSessionOrchestratorDeps) {
    this.kvStore = deps.kvStore
    this.provider = deps.provider
    this.logger = deps.logger ?? new NoOpLogger()
  }

  /**
   * セッションを開始
   */
  async start(sessionId: string, purpose: string): Promise<DesignSessionResult> {
    this.logger.info('Starting design session', { sessionId, purpose })

    // 初期セッション状態を作成
    const session: DesignSessionStorage = {
      sessionId,
      purpose,
      status: 'asking',
      collectedAnswers: [],
      pendingQuestions: [],
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await this.saveSession(sessionId, session)

    // FormDesigner を実行
    const agent = this.createAgent()
    const context = this.buildContext(session)
    const result = await agent.executeTurn(context, '')

    // 結果を処理
    return this.handleAgentResult(sessionId, session, result)
  }

  /**
   * ユーザーの回答を処理
   */
  async answer(sessionId: string, answers: UserAnswerInput[]): Promise<DesignSessionResult> {
    this.logger.info('Processing answers', { sessionId, answerCount: answers.length })

    // セッションを取得
    const session = await this.getSession(sessionId)
    if (!session) {
      throw new Error(`Design session not found: ${sessionId}`)
    }

    if (session.status === 'completed') {
      throw new Error(`Session already completed: ${sessionId}`)
    }

    // 回答を収集済みリストに追加
    for (const answer of answers) {
      const question = session.pendingQuestions.find((q) => q.id === answer.questionId)
      if (question) {
        const selectedLabels = answer.selectedOptionIds
          .map((id) => question.options.find((o) => o.id === id)?.label)
          .filter((label): label is string => !!label)

        session.collectedAnswers.push({
          questionId: answer.questionId,
          question: question.question,
          selectedOptionIds: answer.selectedOptionIds,
          selectedLabels,
          freeText: answer.freeText,
        })
      }
    }

    // 回答をユーザーメッセージとして追加
    const answerText = answers
      .map((a) => {
        const question = session.pendingQuestions.find((q) => q.id === a.questionId)
        if (!question) return null
        const selectedLabels = a.selectedOptionIds
          .map((id) => question.options.find((o) => o.id === id)?.label)
          .filter((label): label is string => !!label)

        // 選択肢と自由テキストを組み合わせた回答を構築
        const answerParts: string[] = []
        if (selectedLabels.length > 0) {
          answerParts.push(selectedLabels.join(', '))
        }
        if (a.freeText && a.freeText.trim()) {
          answerParts.push(`（補足: ${a.freeText.trim()}）`)
        }

        const answerContent = answerParts.length > 0 ? answerParts.join(' ') : '（回答なし）'
        return `Q: ${question.question}\nA: ${answerContent}`
      })
      .filter(Boolean)
      .join('\n\n')

    session.messages.push({ role: 'user', content: answerText })
    session.pendingQuestions = []
    session.updatedAt = Date.now()

    await this.saveSession(sessionId, session)

    // FormDesigner を実行
    const agent = this.createAgent()
    const context = this.buildContext(session)
    const result = await agent.executeTurn(context, answerText)

    // 結果を処理
    return this.handleAgentResult(sessionId, session, result)
  }

  /**
   * 早期離脱（現在の情報でフィールド生成）
   */
  async generateNow(sessionId: string): Promise<DesignSessionResult> {
    this.logger.info('Generating fields now (early exit)', { sessionId })

    // セッションを取得
    const session = await this.getSession(sessionId)
    if (!session) {
      throw new Error(`Design session not found: ${sessionId}`)
    }

    if (session.status === 'completed') {
      return {
        sessionId,
        status: 'completed',
        fields: session.generatedFields,
      }
    }

    // 早期離脱を実行
    const agent = this.createAgent()
    const context = this.buildContext(session)
    const result = await agent.executeEarlyExit(context)

    // 結果を処理
    return this.handleAgentResult(sessionId, session, result)
  }

  /**
   * セッションを取得
   */
  async getSessionState(sessionId: string): Promise<DesignSessionStorage | null> {
    return this.getSession(sessionId)
  }

  // =====================================
  // プライベートメソッド
  // =====================================

  /**
   * エージェントを作成
   */
  private createAgent(): FormDesignerAgent {
    return new FormDesignerAgent({
      provider: this.provider,
      logger: this.logger,
    })
  }

  /**
   * コンテキストを構築
   */
  private buildContext(session: DesignSessionStorage): FormDesignerContext {
    const state: FormDesignerState = {
      sessionId: session.sessionId,
      purpose: session.purpose,
      status: session.status,
      collectedAnswers: session.collectedAnswers,
      generatedFields: session.generatedFields,
    }

    return {
      type: 'form_designer',
      sessionId: session.sessionId,
      purpose: session.purpose,
      chatHistory: session.messages,
      formDesignerState: state,
      pendingQuestions: session.pendingQuestions,
    }
  }

  /**
   * エージェント結果を処理
   */
  private async handleAgentResult(
    sessionId: string,
    session: DesignSessionStorage,
    result: FormDesignerTurnResult
  ): Promise<DesignSessionResult> {
    // 質問が返された場合
    if (result.questions && result.questions.length > 0) {
      session.pendingQuestions = result.questions
      session.status = 'asking'
      session.updatedAt = Date.now()
      await this.saveSession(sessionId, session)

      return {
        sessionId,
        status: 'asking',
        questions: result.questions,
        usage: result.usage,
      }
    }

    // フィールドが生成された場合
    if (result.generatedFields && result.generatedFields.length > 0) {
      session.generatedFields = result.generatedFields
      session.status = 'completed'
      session.updatedAt = Date.now()
      await this.saveSession(sessionId, session)

      return {
        sessionId,
        status: 'completed',
        fields: result.generatedFields,
        usage: result.usage,
      }
    }

    // 予期しない結果
    this.logger.warn('Unexpected agent result', { sessionId, result })
    throw new Error('Unexpected agent result: neither questions nor fields were returned')
  }

  // =====================================
  // KV 操作
  // =====================================

  private async getSession(sessionId: string): Promise<DesignSessionStorage | null> {
    return this.kvStore.get<DesignSessionStorage>(DesignSessionKVKeys.session(sessionId))
  }

  private async saveSession(sessionId: string, session: DesignSessionStorage): Promise<void> {
    await this.kvStore.set(DesignSessionKVKeys.session(sessionId), session, {
      expirationTtl: DESIGN_SESSION_TTL,
    })
  }
}
