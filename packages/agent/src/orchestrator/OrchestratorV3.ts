import { NoOpLogger } from '../logger'
import { toFieldId } from '../store/types'
import { buildContextPrompt } from './v3/prompts/context'
import { buildSystemPrompt } from './v3/prompts/system'
import {
  askToolDefinition,
  validateAskArgs,
  askOptionsToolDefinition,
  validateAskOptionsArgs,
  setLanguageToolDefinition,
  validateSetLanguageArgs,
  type AskArgs,
} from './v3/tools'
import {
  createInitialV3Session,
  V3_SESSION_TTL,
  type OrchestratorV3SessionState,
  type OrchestratorV3Config,
  type ProcessResultV3,
  type AuditorFeedback,
  type AskOptionsData,
  type Plan,
  type PlanField,
} from './v3/types'
import type { QuickCheckResult } from '../agent/quickCheck/definition'
import type { ILogger } from '../logger'
import type { ILLMProvider, LLMMessage, TokenUsage } from '../provider/types'
import type { AgentRegistry } from '../registry/AgentRegistry'
import type { IKVStore } from '../store/IKVStore'
import type { SessionForm } from '../store/types'

/**
 * 対応言語リスト（CONTINUE_LABELS準拠: 14言語）
 */
const SUPPORTED_LANGUAGES = [
  'ja',
  'en',
  'zh',
  'ko',
  'es',
  'fr',
  'de',
  'pt',
  'it',
  'ru',
  'ar',
  'hi',
  'th',
  'vi',
] as const
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/**
 * 対応言語かどうかを判定
 */
function isSupportedLanguage(lang: string | undefined): lang is SupportedLanguage {
  return !!lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
}

/**
 * デフォルトの完了メッセージ
 */
const DEFAULT_COMPLETION_MESSAGE = 'Interview completed. Thank you!'

/**
 * セッション開始オプション
 */
export interface StartOptions {
  /** ブラウザの言語設定（Accept-Language や navigator.language から取得） */
  browserLanguage?: string
}

/**
 * OrchestratorV3 の依存関係
 */
export interface OrchestratorV3Deps {
  kvStore: IKVStore
  registry: AgentRegistry
  provider: ILLMProvider
  logger?: ILogger
  config?: OrchestratorV3Config
}

/**
 * KV キー生成
 */
const V3KVKeys = {
  session: (sessionId: string) => `v3:session:${sessionId}`,
}

/**
 * OrchestratorV3
 *
 * LLM エージェントとして動作するオーケストレーター。
 * - ask ツールのみを LLM に公開
 * - QuickCheck/Reviewer/Auditor はバックグラウンドで実行
 * - 状態に応じてプロンプトを動的に構築
 */
export class OrchestratorV3 {
  private readonly kvStore: IKVStore
  private readonly registry: AgentRegistry
  private readonly provider: ILLMProvider
  private readonly logger: ILogger
  private readonly config: Required<OrchestratorV3Config>

  constructor(deps: OrchestratorV3Deps) {
    this.kvStore = deps.kvStore
    this.registry = deps.registry
    this.provider = deps.provider
    this.logger = deps.logger ?? new NoOpLogger()
    this.config = {
      maxQuickCheckRetries: deps.config?.maxQuickCheckRetries ?? 3,
      maxFollowUpCount: deps.config?.maxFollowUpCount ?? 3,
      debug: deps.config?.debug ?? false,
    }
  }

  /**
   * セッションを開始
   */
  async start(
    sessionId: string,
    form: SessionForm,
    options?: StartOptions
  ): Promise<ProcessResultV3> {
    this.logger.info('OrchestratorV3: Starting session', {
      sessionId,
      browserLanguage: options?.browserLanguage,
      debug: this.config.debug,
    })

    // セッション状態を初期化
    const session = createInitialV3Session(sessionId, form)

    // プランを構築（FieldCompletionCriteria から）
    session.plan = this.buildPlanFromForm(form)

    // ブラウザ言語の処理
    const browserLang = options?.browserLanguage?.toLowerCase()
    if (isSupportedLanguage(browserLang)) {
      // 対応言語の場合、その言語を設定（確認待ち状態）
      session.bootstrap.language = browserLang
      session.bootstrap.languageConfirmed = false
      this.logger.info('OrchestratorV3: Browser language set', {
        language: browserLang,
      })
    } else if (browserLang) {
      // 非対応言語の場合、英語をデフォルトとして設定
      session.bootstrap.language = 'en'
      session.bootstrap.languageConfirmed = false
      this.logger.info('OrchestratorV3: Unsupported language, defaulting to English', {
        requestedLanguage: browserLang,
      })
    }
    // browserLang が未指定の場合は従来通り言語を問う（languageConfirmed も undefined のまま）

    await this.saveSession(session)

    // 初回ターンを実行
    return this.runTurn(session)
  }

  /**
   * ユーザーメッセージを処理
   */
  async process(sessionId: string, userMessage: string): Promise<ProcessResultV3> {
    this.logger.info('OrchestratorV3: Processing message', { sessionId })

    const session = await this.getSession(sessionId)
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    // ユーザーメッセージを記録
    session.messages.push({ role: 'user', content: userMessage })
    session.orchestratorMessages.push({ role: 'user', content: userMessage })
    session.updatedAt = Date.now()

    // BOOTSTRAP ステージの場合、ブートストラップ情報を抽出
    if (session.stage === 'BOOTSTRAP') {
      await this.extractBootstrapInfo(session, userMessage)
    }

    // INTERVIEW_LOOP ステージで質問待ちの場合、Reviewer を実行
    if (session.stage === 'INTERVIEW_LOOP' && session.pendingQuestion) {
      await this.runReviewer(session, userMessage)
    }

    // ターンを実行
    return this.runTurn(session)
  }

  /**
   * 1ターンを実行
   */
  private async runTurn(session: OrchestratorV3SessionState): Promise<ProcessResultV3> {
    // ステージ遷移をチェック
    this.checkStageTransition(session)

    // 完了している場合
    if (session.stage === 'COMPLETED') {
      await this.saveSession(session)
      return {
        responseText: session.form.completionMessage ?? DEFAULT_COMPLETION_MESSAGE,
        isComplete: true,
        awaitingUserResponse: false,
        currentStage: session.stage,
        collectedFields: session.collectedFields,
      }
    }

    // FINAL_AUDIT ステージの場合
    if (session.stage === 'FINAL_AUDIT') {
      // 前回 Auditor が失格した場合、ユーザーからの新しい入力があれば結果をクリアして再実行
      if (session.lastAuditorResult && !session.lastAuditorResult.passed) {
        session.lastAuditorResult = undefined
      }

      // Auditor を実行
      if (!session.lastAuditorResult) {
        const auditorResult = await this.runAuditor(session)

        // Auditor が通過した場合は完了
        if (auditorResult?.passed) {
          session.stage = 'COMPLETED'
          await this.saveSession(session)
          return {
            responseText: session.form.completionMessage ?? DEFAULT_COMPLETION_MESSAGE,
            isComplete: true,
            awaitingUserResponse: false,
            currentStage: session.stage,
            collectedFields: session.collectedFields,
          }
        }
      }
    }

    // プロンプトを構築
    const systemPrompt = buildSystemPrompt(session.bootstrap.language)
    const contextPrompt = buildContextPrompt(session)

    // メッセージを構築
    const messages: LLMMessage[] = [
      ...session.orchestratorMessages,
      { role: 'user', content: contextPrompt },
    ]

    this.logger.debug('OrchestratorV3: Running turn', {
      stage: session.stage,
      contextPrompt: contextPrompt.substring(0, 200),
    })

    // ステージに応じてツールを動的に選択
    // BOOTSTRAP かつ言語入力待ち → set_language ツールを使用
    const tools =
      session.stage === 'BOOTSTRAP' && session.bootstrap.waitingForLanguageInput
        ? [setLanguageToolDefinition]
        : [askToolDefinition, askOptionsToolDefinition]

    // LLM を呼び出し
    const response = await this.provider.chatWithTools(messages, tools, {
      systemPrompt,
      temperature: 0.7,
      maxOutputTokens: 800,
      forceToolCall: true,
    })

    // set_language ツールが呼ばれた場合
    const setLanguageCall = response.toolCalls.find((tc) => tc.name === 'set_language')
    if (setLanguageCall) {
      return this.handleSetLanguageTool(session, setLanguageCall.args, response.usage)
    }

    // ask ツールが呼ばれた場合
    const askCall = response.toolCalls.find((tc) => tc.name === 'ask')
    if (askCall) {
      return this.handleAskTool(session, askCall.args as AskArgs, response.usage)
    }

    // ask_options ツールが呼ばれた場合
    const askOptionsCall = response.toolCalls.find((tc) => tc.name === 'ask_options')
    if (askOptionsCall) {
      return this.handleAskOptionsTool(session, askOptionsCall.args, response.usage)
    }

    // ツールが呼ばれなかった場合（テキスト応答）
    if (response.text) {
      session.orchestratorMessages.push({ role: 'assistant', content: response.text })
      await this.saveSession(session)
      return {
        responseText: response.text,
        isComplete: false,
        awaitingUserResponse: true,
        currentStage: session.stage,
        usage: response.usage,
      }
    }

    // 予期しない状態
    throw new Error('Unexpected LLM response: no tool calls and no text')
  }

  /**
   * ask ツールを処理
   */
  private async handleAskTool(
    session: OrchestratorV3SessionState,
    rawArgs: unknown,
    usage?: TokenUsage
  ): Promise<ProcessResultV3> {
    const args = validateAskArgs(rawArgs)
    const question = args.message

    this.logger.debug('OrchestratorV3: Handling ask tool', {
      question: question.substring(0, 100),
    })

    // BOOTSTRAP ステージの場合は QuickCheck をスキップ
    if (session.stage === 'BOOTSTRAP') {
      session.pendingQuestion = question
      session.orchestratorMessages.push({ role: 'assistant', content: question })
      session.messages.push({ role: 'assistant', content: question })
      await this.saveSession(session)

      return {
        responseText: question,
        isComplete: false,
        awaitingUserResponse: true,
        currentStage: session.stage,
        usage,
      }
    }

    // QuickCheck をバックグラウンドで実行
    const quickCheckResult = await this.runQuickCheck(session, question)

    if (!quickCheckResult.passed) {
      // 質問がNGの場合、フィードバックを追加して再度 LLM を呼び出す
      session.lastQuickCheckResult = {
        passed: false,
        issues: quickCheckResult.issues,
        suggestion: quickCheckResult.suggestion,
      }
      await this.saveSession(session)

      // リトライ
      return this.runTurn(session)
    }

    // 質問がOKの場合、ユーザーに送信
    session.pendingQuestion = question
    session.lastQuickCheckResult = undefined
    session.orchestratorMessages.push({ role: 'assistant', content: question })
    session.messages.push({ role: 'assistant', content: question })
    await this.saveSession(session)

    return {
      responseText: question,
      isComplete: false,
      awaitingUserResponse: true,
      currentStage: session.stage,
      usage,
    }
  }

  /**
   * ask_options ツールを処理
   */
  private async handleAskOptionsTool(
    session: OrchestratorV3SessionState,
    rawArgs: unknown,
    usage?: TokenUsage
  ): Promise<ProcessResultV3> {
    const args = validateAskOptionsArgs(rawArgs)
    const question = args.message

    this.logger.debug('OrchestratorV3: Handling ask_options tool', {
      question: question.substring(0, 100),
      optionsCount: args.options.length,
      selectionType: args.selectionType,
    })

    const askOptions: AskOptionsData = {
      options: args.options,
      selectionType: args.selectionType,
    }

    // BOOTSTRAP ステージの場合は QuickCheck をスキップ
    if (session.stage === 'BOOTSTRAP') {
      session.pendingQuestion = question
      session.orchestratorMessages.push({ role: 'assistant', content: question })
      session.messages.push({ role: 'assistant', content: question })
      await this.saveSession(session)

      return {
        responseText: question,
        isComplete: false,
        awaitingUserResponse: true,
        currentStage: session.stage,
        usage,
        askOptions,
      }
    }

    // QuickCheck をバックグラウンドで実行
    const quickCheckResult = await this.runQuickCheck(session, question)

    if (!quickCheckResult.passed) {
      // 質問がNGの場合、フィードバックを追加して再度 LLM を呼び出す
      session.lastQuickCheckResult = {
        passed: false,
        issues: quickCheckResult.issues,
        suggestion: quickCheckResult.suggestion,
      }
      await this.saveSession(session)

      // リトライ
      return this.runTurn(session)
    }

    // 質問がOKの場合、ユーザーに送信
    session.pendingQuestion = question
    session.lastQuickCheckResult = undefined
    session.orchestratorMessages.push({ role: 'assistant', content: question })
    session.messages.push({ role: 'assistant', content: question })
    await this.saveSession(session)

    return {
      responseText: question,
      isComplete: false,
      awaitingUserResponse: true,
      currentStage: session.stage,
      usage,
      askOptions,
    }
  }

  /**
   * set_language ツールを処理
   */
  private async handleSetLanguageTool(
    session: OrchestratorV3SessionState,
    rawArgs: unknown,
    _usage?: TokenUsage
  ): Promise<ProcessResultV3> {
    const args = validateSetLanguageArgs(rawArgs)

    this.logger.debug('OrchestratorV3: Handling set_language tool', {
      languageCode: args.languageCode,
      isSupported: args.isSupported,
    })

    if (args.isSupported && isSupportedLanguage(args.languageCode)) {
      // サポート言語を設定
      session.bootstrap.language = args.languageCode
      this.logger.info('OrchestratorV3: Language set from user input', {
        language: args.languageCode,
      })
    } else {
      // サポート外 → ブラウザ言語を維持（既に設定済み）
      this.logger.info('OrchestratorV3: Unsupported language, keeping browser language', {
        requestedCode: args.languageCode,
        fallbackLanguage: session.bootstrap.language,
      })
    }

    // 言語確認完了
    session.bootstrap.languageConfirmed = true
    session.bootstrap.waitingForLanguageInput = false
    await this.saveSession(session)

    // 次のターンでインタビュー開始
    return this.runTurn(session)
  }

  /**
   * QuickCheck を実行（型安全な実装）
   */
  private async runQuickCheck(
    session: OrchestratorV3SessionState,
    question: string
  ): Promise<QuickCheckResult> {
    const plan = session.plan as Plan | undefined
    const field = plan?.fields[session.currentFieldIndex]

    if (!field || !field.fieldId) {
      // フィールドがない場合は通過させる
      this.logger.warn('OrchestratorV3: runQuickCheck - field or fieldId is missing', {
        currentFieldIndex: session.currentFieldIndex,
        fieldExists: !!field,
        fieldId: field?.fieldId,
      })
      return { passed: true }
    }

    // 型安全な args を構築
    const args = {
      pendingQuestion: question,
      fieldId: field.fieldId,
      intent: field.intent,
      prohibitedTopics: plan?.prohibitedTopics,
    }

    // 型安全なエージェント作成
    const agent = this.registry.createTypedAgent('quick_check', {
      provider: this.provider,
      logger: this.logger,
    })

    // 初期メッセージを構築
    const definition = this.registry.getOrThrow('quick_check')
    const initialMessage = definition.buildInitialMessage(args)
    const messages: LLMMessage[] = initialMessage ? [initialMessage] : []

    // 型安全な呼び出し: execute(args, base, userMessage)
    const result = await agent.execute(
      args,
      {
        sessionId: session.sessionId,
        chatHistory: messages,
      },
      ''
    )

    // completion から結果を抽出（型安全）
    if (result.completion?.context) {
      return result.completion.context
    }

    // 結果がない場合は通過させる
    return { passed: true }
  }

  /**
   * Reviewer を実行（型安全な実装）
   */
  private async runReviewer(
    session: OrchestratorV3SessionState,
    userAnswer: string
  ): Promise<void> {
    const plan = session.plan as Plan | undefined
    const field = plan?.fields[session.currentFieldIndex]

    if (!field || !field.fieldId) {
      this.logger.warn('OrchestratorV3: runReviewer - field or fieldId is missing', {
        currentFieldIndex: session.currentFieldIndex,
        fieldExists: !!field,
        fieldId: field?.fieldId,
      })
      return
    }

    // 型安全な args を構築
    const args = {
      fieldId: field.fieldId,
      label: field.label,
      intent: field.intent,
      required: field.required,
      requiredFacts: field.requiredFacts,
      userAnswer,
      questionType: field.questionType,
      followUpCount: session.followUpCount,
    }

    // 型安全なエージェント作成
    const agent = this.registry.createTypedAgent('reviewer', {
      provider: this.provider,
      logger: this.logger,
    })

    // 初期メッセージを構築
    const definition = this.registry.getOrThrow('reviewer')
    const initialMessage = definition.buildInitialMessage(args)
    const messages: LLMMessage[] = initialMessage ? [initialMessage] : []

    // 型安全な呼び出し: execute(args, base, userMessage)
    const result = await agent.execute(
      args,
      {
        sessionId: session.sessionId,
        chatHistory: messages,
      },
      ''
    )

    // completion から結果を抽出（型安全）
    if (result.completion?.context) {
      const reviewResult = result.completion.context

      if (reviewResult.passed) {
        // フィールド完了
        session.collectedFields[toFieldId(field.fieldId)] = userAnswer
        session.currentFieldIndex++
        session.followUpCount = 0
        session.pendingQuestion = undefined
        session.lastReviewerResult = undefined
      } else {
        // フォローアップが必要
        session.lastReviewerResult = {
          passed: false,
          feedback: reviewResult.feedback,
          missingFacts: reviewResult.missingFacts,
        }
        session.followUpCount++
        session.pendingQuestion = undefined
      }
    }
  }

  /**
   * Auditor を実行
   */
  /**
   * Auditor を実行（型安全な実装）
   */
  private async runAuditor(
    session: OrchestratorV3SessionState
  ): Promise<AuditorFeedback | undefined> {
    const plan = session.plan as Plan | undefined

    // 型安全な args を構築
    const collectedFields = Object.entries(session.collectedFields).map(([fieldId, value]) => {
      const field = plan?.fields.find((f) => f.fieldId === fieldId)
      return {
        fieldId,
        label: field?.label ?? fieldId,
        value,
      }
    })

    const args = {
      collectedFields,
      conversationLength: session.messages.length,
      prohibitedTopics: plan?.prohibitedTopics,
    }

    // 型安全なエージェント作成
    const agent = this.registry.createTypedAgent('auditor', {
      provider: this.provider,
      logger: this.logger,
    })

    // 初期メッセージを構築
    const definition = this.registry.getOrThrow('auditor')
    const initialMessage = definition.buildInitialMessage(args)
    const messages: LLMMessage[] = initialMessage ? [initialMessage] : []

    // 型安全な呼び出し: execute(args, base, userMessage)
    const result = await agent.execute(
      args,
      {
        sessionId: session.sessionId,
        chatHistory: messages,
      },
      ''
    )

    // completion から結果を抽出（型安全）
    if (result.completion?.context) {
      const auditResult = result.completion.context
      const feedback: AuditorFeedback = {
        passed: auditResult.passed,
        issues: auditResult.issues,
        recommendations: auditResult.recommendations,
        summary: auditResult.summary,
      }
      session.lastAuditorResult = feedback
      return feedback
    }

    return undefined
  }

  /**
   * ステージ遷移をチェック
   */
  private checkStageTransition(session: OrchestratorV3SessionState): void {
    const plan = session.plan as Plan | undefined
    const totalFields = plan?.fields.length ?? 0

    switch (session.stage) {
      case 'BOOTSTRAP':
        // ブートストラップ完了チェック
        // - languageConfirmed が true の場合（ブラウザ言語確認済み）
        // - languageConfirmed が undefined で language が設定されている場合（従来のフロー）
        if (
          session.bootstrap.language &&
          (session.bootstrap.languageConfirmed === true ||
            session.bootstrap.languageConfirmed === undefined)
        ) {
          session.stage = 'INTERVIEW_LOOP'
          this.logger.info('OrchestratorV3: Transitioning to INTERVIEW_LOOP')
        }
        break

      case 'INTERVIEW_LOOP':
        // 全フィールド完了チェック
        if (session.currentFieldIndex >= totalFields) {
          session.stage = 'FINAL_AUDIT'
          this.logger.info('OrchestratorV3: Transitioning to FINAL_AUDIT')
        }
        break

      case 'FINAL_AUDIT':
        // Auditor 通過チェック
        if (session.lastAuditorResult?.passed) {
          session.stage = 'COMPLETED'
          this.logger.info('OrchestratorV3: Transitioning to COMPLETED')
        }
        break
    }
  }

  /**
   * ブートストラップ情報を抽出
   *
   * ユーザーの選択に基づいてブートストラップ状態を更新する。
   * 言語の実際の設定は LLM が set_language ツールを呼ぶことで行われる。
   */
  private async extractBootstrapInfo(
    session: OrchestratorV3SessionState,
    userMessage: string
  ): Promise<void> {
    const message = userMessage.toLowerCase().trim()

    // 「〇〇語のまま進める」を選択した場合
    // メッセージには「日本語のまま進める」「Continue in English」などのラベルが含まれる
    if (
      message.includes('のまま進める') ||
      message.includes('continue in') ||
      message.includes('继续使用') ||
      message.includes('로 계속')
    ) {
      session.bootstrap.languageConfirmed = true
      session.bootstrap.waitingForLanguageInput = false
      this.logger.info('OrchestratorV3: Language confirmed', {
        language: session.bootstrap.language,
      })
      return
    }

    // 「他の言語で話す」を選択した場合
    if (
      message.includes('他の言語') ||
      message.includes('another language') ||
      message.includes('other language') ||
      message.includes('其他语言') ||
      message.includes('다른 언어')
    ) {
      // 言語入力待ちフラグを設定 → 次のターンで set_language ツールが使われる
      session.bootstrap.waitingForLanguageInput = true
      this.logger.info('OrchestratorV3: User requested different language, waiting for input')
      return
    }

    // 言語入力待ち状態の場合、LLM が set_language ツールで処理するので何もしない
    // （ユーザーの入力は orchestratorMessages に記録済み）
  }

  /**
   * フォームからプランを構築
   */
  private buildPlanFromForm(form: SessionForm): Plan {
    this.logger.debug('OrchestratorV3: buildPlanFromForm', {
      fieldsCount: form.fields.length,
      fields: form.fields.map((f) => ({ id: f.id, fieldId: f.fieldId, label: f.label })),
    })

    const fields: PlanField[] = form.fields.map((field) => {
      if (!field.fieldId) {
        this.logger.warn('OrchestratorV3: buildPlanFromForm - field.fieldId is missing', {
          fieldId: field.id,
          label: field.label,
        })
      }

      const facts = form.facts.filter((f) => f.formFieldId === field.id)
      const hasIntent = !!field.intent

      return {
        fieldId: field.fieldId,
        label: field.label,
        intent: field.intent ?? '',
        required: field.required,
        questionType: hasIntent ? 'abstract' : 'basic',
        questionTypeReason: hasIntent
          ? 'Field has intent, requires deeper exploration'
          : 'Basic information field',
        requiredFacts: facts.map((f) => f.fact),
      }
    })

    return {
      fields,
      summary: 'Interview plan generated from form definition',
    }
  }

  /**
   * セッションを保存
   */
  private async saveSession(session: OrchestratorV3SessionState): Promise<void> {
    session.updatedAt = Date.now()
    await this.kvStore.set(V3KVKeys.session(session.sessionId), session, {
      expirationTtl: V3_SESSION_TTL,
    })
  }

  /**
   * セッションを取得
   */
  private async getSession(sessionId: string): Promise<OrchestratorV3SessionState | null> {
    return this.kvStore.get<OrchestratorV3SessionState>(V3KVKeys.session(sessionId))
  }

  /**
   * セッション状態を取得（外部公開用）
   * フォールバック処理などでセッション状態にアクセスする場合に使用
   */
  async getSessionState(sessionId: string): Promise<OrchestratorV3SessionState | null> {
    return this.getSession(sessionId)
  }
}
