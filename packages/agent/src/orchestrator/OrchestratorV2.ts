import { deriveInterviewerStage } from '../agent/interviewer/types'
import { NoOpLogger } from '../logger'
import {
  KVKeys,
  SESSION_TTL,
  createInitialMainSession,
  createInitialSubSession,
  isToolResultMessage,
} from '../store'
import type { ProcessResultV2, OrchestratorV2Config, SubSessionStartInfo } from './types.v2'
import type { Plan } from '../agent/interviewer/types'
import type { AgentType, ToolCallResult, BaseAgentContext, AgentCompletion } from '../agent/types'
import type { ILogger } from '../logger'
import type { ILLMProvider } from '../provider'
import type { AgentRegistry } from '../registry/AgentRegistry'
import type { AgentState } from '../registry/types'
import type { IKVStore } from '../store/IKVStore'
import type {
  MainSessionState,
  SubSessionState,
  AgentStackEntry,
  LLMMessage,
  SessionForm,
  AgentArgsMap,
  SubSessionCompletionPayload,
  ToolResultMessage,
} from '../store/types'

/**
 * OrchestratorV2 の依存関係
 */
export interface OrchestratorV2Deps {
  /** KVStore */
  kvStore: IKVStore

  /** エージェントレジストリ */
  registry: AgentRegistry

  /** LLM プロバイダー */
  provider: ILLMProvider

  /** ロガー */
  logger?: ILogger

  /** 設定 */
  config?: OrchestratorV2Config
}

/**
 * OrchestratorV2
 *
 * KV ベースのセッション管理と AgentRegistry を使用した新しい Orchestrator。
 * - サブセッションは独立した KV エントリで管理
 * - 完了ツールは AgentRegistry から動的に解決
 * - メインセッションには ask の中身とユーザーメッセージのみ保存
 */
export class OrchestratorV2 {
  private readonly kvStore: IKVStore
  private readonly registry: AgentRegistry
  private readonly provider: ILLMProvider
  private readonly logger: ILogger
  private readonly maxStackDepth: number

  constructor(deps: OrchestratorV2Deps) {
    this.kvStore = deps.kvStore
    this.registry = deps.registry
    this.provider = deps.provider
    this.logger = deps.logger ?? new NoOpLogger()
    this.maxStackDepth = deps.config?.maxStackDepth ?? 10
  }

  /**
   * セッションを開始
   */
  async start(sessionId: string, form: SessionForm): Promise<ProcessResultV2> {
    this.logger.info('Starting session', { sessionId })

    // メインセッションを初期化
    const mainSession = createInitialMainSession(sessionId, form)
    await this.saveMainSession(sessionId, mainSession)

    // Greeter で開始
    return this.runMainAgent(sessionId, mainSession, 'greeter', '')
  }

  /**
   * ユーザーメッセージを処理
   */
  async process(sessionId: string, userMessage: string): Promise<ProcessResultV2> {
    this.logger.info('Processing message', { sessionId, userMessage })

    // メインセッションを取得
    const mainSession = await this.getMainSession(sessionId)
    if (!mainSession) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    // ユーザーメッセージをメインセッションに追加
    mainSession.messages.push({ role: 'user', content: userMessage })
    mainSession.updatedAt = Date.now()

    // 現在アクティブなコンテキストを特定
    const stackDepth = mainSession.agentStack.length

    if (stackDepth === 0) {
      // メインセッション
      const currentAgent = this.deriveCurrentMainAgent(mainSession)
      return this.runMainAgent(sessionId, mainSession, currentAgent, userMessage)
    }

    // サブセッションがある場合
    const stackIndex = stackDepth - 1
    const subSession = await this.getSubSession(sessionId, stackIndex)
    if (!subSession) {
      throw new Error(`SubSession not found: ${sessionId}:${stackIndex}`)
    }

    return this.runSubSession(sessionId, mainSession, subSession, stackIndex, userMessage)
  }

  // =====================================
  // メインセッション処理
  // =====================================

  /**
   * メインエージェントを実行
   */
  private async runMainAgent(
    sessionId: string,
    mainSession: MainSessionState,
    agentType: AgentType,
    _userMessage: string
  ): Promise<ProcessResultV2> {
    this.logger.debug('Running main agent', { sessionId, agentType })

    // エージェントを実行
    const result = await this.executeAgent(
      sessionId,
      mainSession,
      agentType,
      {},
      mainSession.messages,
      this.buildAgentState(mainSession)
    )

    // ツール呼び出しを処理
    return this.handleToolCalls(sessionId, mainSession, null, -1, agentType, result)
  }

  // =====================================
  // サブセッション処理
  // =====================================

  /**
   * サブセッションを実行
   */
  private async runSubSession(
    sessionId: string,
    mainSession: MainSessionState,
    subSession: SubSessionState,
    stackIndex: number,
    userMessage: string
  ): Promise<ProcessResultV2> {
    this.logger.debug('Running sub session', { sessionId, stackIndex, agent: subSession.agent })

    // ユーザーメッセージをサブセッションに追加
    if (userMessage) {
      subSession.messages.push({ role: 'user', content: userMessage })
      subSession.status = 'active'
      subSession.updatedAt = Date.now()
    }

    // エージェントを実行（userMessage を渡す）
    // LLM に送信するメッセージから tool_result をフィルタリング
    // (tool_result は状態復元用にローカルで保持しているだけ)
    const llmMessages = subSession.messages.filter(
      (msg): msg is LLMMessage => !isToolResultMessage(msg)
    )
    const result = await this.executeAgent(
      sessionId,
      mainSession,
      subSession.agent,
      subSession.args,
      llmMessages,
      this.buildAgentState(mainSession),
      userMessage
    )

    // ツール呼び出しを処理
    return this.handleToolCalls(
      sessionId,
      mainSession,
      subSession,
      stackIndex,
      subSession.agent,
      result
    )
  }

  /**
   * サブセッションを開始
   */
  private async startSubSession(
    sessionId: string,
    mainSession: MainSessionState,
    info: SubSessionStartInfo
  ): Promise<ProcessResultV2> {
    this.logger.info('Starting sub session', { sessionId, agent: info.agent })

    // スタック深度チェック
    if (mainSession.agentStack.length >= this.maxStackDepth) {
      throw new Error(`Max stack depth exceeded: ${this.maxStackDepth}`)
    }

    // エージェント定義を取得
    const definition = this.registry.get(info.agent)
    if (!definition) {
      throw new Error(`Agent not found: ${info.agent}`)
    }

    // initArgs があれば mainSession から引数を構築、なければ subtask の引数をそのまま使用
    const args = (definition.initArgs?.(mainSession, info.context) ?? info.args) as Record<
      string,
      unknown
    >

    // args をバリデーション
    const validation = this.registry.validateArgs(info.agent, args)
    if (!validation.success) {
      throw new Error(`Invalid args for ${info.agent}: ${validation.error.message}`)
    }

    // スタックにエントリを追加
    const callerAgent =
      mainSession.agentStack.length > 0
        ? mainSession.agentStack[mainSession.agentStack.length - 1].calledAgent
        : this.deriveCurrentMainAgent(mainSession)

    const stackIndex = mainSession.agentStack.length
    const resultKey = `${info.agent}:${stackIndex}:${Date.now()}`

    const agentType = info.agent
    const stackEntry: AgentStackEntry<typeof agentType> = {
      callerAgent,
      calledAgent: agentType,
      args: args as AgentArgsMap[typeof agentType],
      resultKey,
    }
    mainSession.agentStack.push(stackEntry)
    await this.saveMainSession(sessionId, mainSession)

    // サブセッションを作成
    const subSession = createInitialSubSession(info.agent, args)

    // 初期メッセージを追加
    const initialMessage = definition.buildInitialMessage(args)
    if (initialMessage) {
      subSession.messages.push(initialMessage)
    }

    await this.saveSubSession(sessionId, stackIndex, subSession)

    // サブエージェントを実行
    return this.runSubSession(sessionId, mainSession, subSession, stackIndex, '')
  }

  /**
   * サブセッションを完了
   */
  private async completeSubSession(
    sessionId: string,
    mainSession: MainSessionState,
    subSession: SubSessionState,
    stackIndex: number,
    result: unknown
  ): Promise<ProcessResultV2> {
    this.logger.info('Completing sub session', { sessionId, stackIndex, agent: subSession.agent })

    // 結果をバリデーション
    const validation = this.registry.validateResult(subSession.agent, result)
    if (!validation.success) {
      this.logger.warn('Invalid result from agent', {
        agent: subSession.agent,
        error: validation.error.message,
      })
    }

    // サブセッションを完了状態に
    subSession.status = 'completed'
    subSession.result = result
    subSession.updatedAt = Date.now()

    // スタックからポップ
    const stackEntry = mainSession.agentStack.pop()!

    // 結果をメインセッションに記録
    mainSession.subSessionResults[stackEntry.resultKey] = result
    mainSession.updatedAt = Date.now()

    // サブセッションを削除
    await this.kvStore.delete(KVKeys.subSession(sessionId, stackIndex))
    await this.saveMainSession(sessionId, mainSession)

    // 特定のエージェント結果に基づく状態更新
    // Discriminated Union を使って型安全に処理
    this.updateMainSessionFromResult(mainSession, {
      agentType: subSession.agent,
      result,
      stackEntry,
    } as SubSessionCompletionPayload)
    await this.saveMainSession(sessionId, mainSession)

    // まだスタックにエントリがある場合、呼び出し元サブセッションに戻る
    if (mainSession.agentStack.length > 0) {
      const parentIndex = mainSession.agentStack.length - 1
      const parentSession = await this.getSubSession(sessionId, parentIndex)
      if (parentSession) {
        // 結果を親セッションに通知
        parentSession.messages.push({
          role: 'user',
          content: `Subtask completed with result: ${JSON.stringify(result)}`,
        })
        return this.runSubSession(sessionId, mainSession, parentSession, parentIndex, '')
      }
    }

    // メインエージェントに戻る
    const callerAgent = stackEntry.callerAgent
    return this.runMainAgent(sessionId, mainSession, callerAgent, '')
  }

  // =====================================
  // ツール呼び出し処理
  // =====================================

  /**
   * ツール呼び出しを処理
   */
  private async handleToolCalls(
    sessionId: string,
    mainSession: MainSessionState,
    subSession: SubSessionState | null,
    stackIndex: number,
    agentType: AgentType,
    result: {
      toolCalls: ToolCallResult[]
      responseText: string
      usage?: unknown
      completion?: AgentCompletion
      updatedState?: Partial<AgentState>
    }
  ): Promise<ProcessResultV2> {
    const { toolCalls, responseText, completion } = result

    // ask ツールが呼ばれた場合
    const askCall = toolCalls.find((tc) => tc.toolName === 'ask')
    if (askCall) {
      return this.handleAskTool(sessionId, mainSession, subSession, stackIndex, askCall, result)
    }

    // subtask ツールが呼ばれた場合
    const subtaskCall = toolCalls.find((tc) => tc.toolName === 'subtask')
    if (subtaskCall) {
      const args = subtaskCall.args as { agent: AgentType; context?: string }
      return this.startSubSession(sessionId, mainSession, {
        agent: args.agent,
        args: subtaskCall.args,
        context: args.context,
      })
    }

    // completion がある場合（エージェント完了）
    if (completion) {
      // resultSchema でバリデーション
      const validation = this.registry.validateResult(agentType, completion.context)

      if (!validation.success) {
        // バリデーション失敗 → エラーをフィードバックしてリトライ
        this.logger.warn('Completion validation failed, retrying', {
          agent: agentType,
          error: validation.error.message,
        })

        // TODO: リトライロジックを実装（現在は警告のみ）
        // 今は警告を出してそのまま続行
      }

      if (subSession) {
        // サブセッション完了
        return this.completeSubSession(
          sessionId,
          mainSession,
          subSession,
          stackIndex,
          completion.context
        )
      }
      // メインエージェント完了
      return this.handleMainAgentComplete(sessionId, mainSession, agentType, completion.context)
    }

    // その他の場合（継続）
    if (subSession) {
      // サブセッションのメッセージを更新
      if (responseText) {
        subSession.messages.push({ role: 'assistant', content: responseText })
      }
      // ツール呼び出し結果を保存
      for (const tc of toolCalls) {
        const toolResultMessage: ToolResultMessage = {
          role: 'tool_result',
          toolName: tc.toolName,
          args: tc.args,
          result: tc.result,
        }
        subSession.messages.push(toolResultMessage)
      }
      await this.saveSubSession(sessionId, stackIndex, subSession)
    }

    await this.saveMainSession(sessionId, mainSession)

    return {
      responseText,
      isComplete: false,
      awaitingUserResponse: false,
      toolCalls,
      currentAgent: agentType,
    }
  }

  /**
   * ask ツールを処理
   */
  private async handleAskTool(
    sessionId: string,
    mainSession: MainSessionState,
    subSession: SubSessionState | null,
    stackIndex: number,
    askCall: ToolCallResult,
    result: {
      toolCalls: ToolCallResult[]
      responseText: string
      usage?: unknown
      updatedState?: Partial<AgentState>
    }
  ): Promise<ProcessResultV2> {
    const message = (askCall.args as { message: string }).message

    // メインセッションに ask の内容を追加
    mainSession.messages.push({ role: 'assistant', content: message })
    mainSession.awaitingReview = true // ユーザー回答後に reviewer を呼ぶ必要がある

    // updatedState があれば bootstrap を更新（greeter の途中状態を保持）
    if (result.updatedState) {
      if (result.updatedState.language !== undefined) {
        mainSession.bootstrap.language = result.updatedState.language
      }
      if (result.updatedState.country !== undefined) {
        mainSession.bootstrap.country = result.updatedState.country
      }
      if (result.updatedState.timezone !== undefined) {
        mainSession.bootstrap.timezone = result.updatedState.timezone
      }
      this.logger.debug('Updated bootstrap from updatedState', {
        bootstrap: mainSession.bootstrap,
      })
    }

    mainSession.updatedAt = Date.now()
    await this.saveMainSession(sessionId, mainSession)

    if (subSession) {
      // サブセッションも更新
      subSession.messages.push({ role: 'assistant', content: message })
      // ツール呼び出し結果を保存
      for (const tc of result.toolCalls) {
        const toolResultMessage: ToolResultMessage = {
          role: 'tool_result',
          toolName: tc.toolName,
          args: tc.args,
          result: tc.result,
        }
        subSession.messages.push(toolResultMessage)
      }
      subSession.status = 'waiting_user'
      subSession.updatedAt = Date.now()
      await this.saveSubSession(sessionId, stackIndex, subSession)
    }

    return {
      responseText: message,
      isComplete: false,
      awaitingUserResponse: true,
      toolCalls: result.toolCalls,
      currentAgent: subSession?.agent ?? this.deriveCurrentMainAgent(mainSession),
    }
  }

  /**
   * メインエージェントの完了を処理
   */
  private async handleMainAgentComplete(
    sessionId: string,
    mainSession: MainSessionState,
    agentType: AgentType,
    context: unknown
  ): Promise<ProcessResultV2> {
    this.logger.info('Main agent completed', { sessionId, agentType })

    switch (agentType) {
      case 'greeter': {
        // ブートストラップ情報を保存
        const greeterResult = context as {
          language?: string
          country?: string
          timezone?: string
        }
        mainSession.bootstrap = {
          language: greeterResult.language,
          country: greeterResult.country,
          timezone: greeterResult.timezone,
        }
        mainSession.updatedAt = Date.now()
        await this.saveMainSession(sessionId, mainSession)

        // Architect に遷移
        return this.runMainAgent(sessionId, mainSession, 'architect', '')
      }

      case 'architect': {
        // プランを保存
        const architectResult = context as { plan?: unknown }
        mainSession.plan = architectResult.plan
        // Interviewer 開始時のステートをリセット
        mainSession.awaitingReview = false
        mainSession.quickCheckResult = undefined
        mainSession.reviewerFeedback = undefined
        mainSession.currentFieldIndex = 0
        mainSession.updatedAt = Date.now()
        await this.saveMainSession(sessionId, mainSession)

        // Interviewer に遷移
        return this.runMainAgent(sessionId, mainSession, 'interviewer', '')
      }

      case 'interviewer': {
        // インタビュー完了 - collectedFields を KV に保存
        const formData = {
          sessionId,
          collectedFields: mainSession.collectedFields,
          completedAt: Date.now(),
        }
        await this.kvStore.set(KVKeys.formData(sessionId), formData, {
          expirationTtl: SESSION_TTL,
        })

        this.logger.info('Interview completed, form data saved to KV', {
          sessionId,
          fieldCount: Object.keys(mainSession.collectedFields).length,
        })

        return {
          responseText: 'Interview completed.',
          isComplete: true,
          awaitingUserResponse: false,
          toolCalls: [],
          currentAgent: 'interviewer',
        }
      }

      default:
        throw new Error(`Unexpected main agent completion: ${agentType}`)
    }
  }

  // =====================================
  // エージェント実行
  // =====================================

  /**
   * エージェントを実行
   */
  private async executeAgent(
    sessionId: string,
    mainSession: MainSessionState,
    agentType: AgentType,
    _args: Record<string, unknown>,
    messages: LLMMessage[],
    state: AgentState,
    userMessage: string = ''
  ): Promise<{
    toolCalls: ToolCallResult[]
    responseText: string
    usage?: unknown
    completion?: AgentCompletion
    updatedState?: Partial<AgentState>
  }> {
    const definition = this.registry.get(agentType)
    if (!definition) {
      throw new Error(`Agent not found: ${agentType}`)
    }

    // エージェントインスタンスを作成
    const agent = definition.createAgent({
      provider: this.provider,
      logger: this.logger,
    })

    // コンテキストを構築（エージェント固有のフィールドを追加）
    const context = this.buildAgentContext(
      sessionId,
      mainSession,
      agentType,
      messages,
      state,
      _args
    )

    this.logger.debug('Built agent context', {
      agentType,
      contextKeys: Object.keys(context),
      args: _args,
    })

    // エージェントを実行
    const result = await agent.executeTurn(context, userMessage)

    return {
      toolCalls: result.toolCalls ?? [],
      responseText: result.responseText,
      usage: result.usage,
      completion: result.completion,
      updatedState: result.updatedState,
    }
  }

  /**
   * エージェント固有のコンテキストを構築
   */
  private buildAgentContext(
    sessionId: string,
    mainSession: MainSessionState,
    agentType: AgentType,
    messages: LLMMessage[],
    state: AgentState,
    subSessionArgs?: Record<string, unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    const baseContext: BaseAgentContext = {
      type: agentType,
      sessionId,
      chatHistory: messages,
      state,
    }

    switch (agentType) {
      case 'architect':
        // Architect には form データを渡す
        return {
          ...baseContext,
          jobFormFields: mainSession.form.fields,
          fieldFactDefinitions: mainSession.form.facts,
        }
      case 'interviewer': {
        // Interviewer には plan とフィールドインデックスを渡す
        if (!mainSession.plan) {
          throw new Error('Cannot start interviewer without a plan')
        }
        const plan = mainSession.plan as Plan
        // quickCheckResult から状態を取得
        const qcResult = mainSession.quickCheckResult
        const quickCheckFeedback =
          qcResult?.passed === false
            ? { issues: qcResult.issues, suggestion: qcResult.suggestion }
            : undefined

        // ステージを導出
        const stage = deriveInterviewerStage({
          plan,
          fieldIndex: mainSession.currentFieldIndex,
          quickCheckPassed: qcResult?.passed ?? false,
          quickCheckFeedback,
          reviewerFeedback: mainSession.reviewerFeedback,
          hasUserResponse: mainSession.awaitingReview ?? false,
          auditCompleted: mainSession.auditCompleted,
        })

        return {
          ...baseContext,
          stage,
          plan,
          fieldIndex: mainSession.currentFieldIndex,
          collectedFields: mainSession.collectedFields,
          quickCheckPassed: qcResult?.passed ?? false,
          approvedQuestion: qcResult?.approvedQuestion,
          quickCheckFeedback,
          reviewerFeedback: mainSession.reviewerFeedback,
        }
      }
      case 'quick_check': {
        // QuickCheck にはサブセッション引数からコンテキストを構築
        const args = subSessionArgs as {
          pendingQuestion: string
          fieldId: string
          intent: string
          prohibitedTopics?: string[]
          collectedFacts?: string[]
        }
        this.logger.debug('Building quick_check context', { args })
        return {
          ...baseContext,
          pendingQuestion: {
            content: args.pendingQuestion,
            fieldId: args.fieldId,
            intent: args.intent,
          },
          prohibitedTopics: args.prohibitedTopics,
          collectedFacts: args.collectedFacts,
        }
      }
      case 'reviewer': {
        // Reviewer にはサブセッション引数からコンテキストを構築
        const args = subSessionArgs as {
          fieldId: string
          label: string
          intent: string
          required: boolean
          requiredFacts?: string[]
          userAnswer: string
          questionType?: 'basic' | 'abstract'
          followUpCount?: number
        }
        this.logger.debug('Building reviewer context', { args })
        return {
          ...baseContext,
          currentField: {
            fieldId: args.fieldId,
            label: args.label,
            intent: args.intent,
            required: args.required,
            requiredFacts: args.requiredFacts,
            questionType: args.questionType,
            followUpCount: args.followUpCount,
          },
          collectedAnswer: args.userAnswer,
        }
      }
      case 'auditor': {
        // Auditor にはサブセッション引数からコンテキストを構築
        const args = subSessionArgs as {
          collectedFields: Array<{ fieldId: string; label: string; value: unknown }>
          conversationLength: number
          prohibitedTopics?: string[]
        }
        this.logger.debug('Building auditor context', { args })
        return {
          ...baseContext,
          plan: mainSession.plan,
          allCollectedFields: args.collectedFields,
          fullConversationHistory: messages,
          prohibitedTopics: args.prohibitedTopics ?? [],
        }
      }
      default:
        return baseContext
    }
  }

  // =====================================
  // ユーティリティ
  // =====================================

  /**
   * 現在のメインエージェントを導出
   */
  private deriveCurrentMainAgent(mainSession: MainSessionState): AgentType {
    if (
      !mainSession.bootstrap.language ||
      !mainSession.bootstrap.country ||
      !mainSession.bootstrap.timezone
    ) {
      return 'greeter'
    }
    if (!mainSession.plan) {
      return 'architect'
    }
    return 'interviewer'
  }

  /**
   * AgentState を構築
   */
  private buildAgentState(mainSession: MainSessionState): AgentState {
    const qcResult = mainSession.quickCheckResult
    return {
      language: mainSession.bootstrap.language,
      country: mainSession.bootstrap.country,
      timezone: mainSession.bootstrap.timezone,
      plan: mainSession.plan,
      currentFieldIndex: mainSession.currentFieldIndex,
      collectedFields: mainSession.collectedFields,
      quickCheckPassed: qcResult?.passed,
      quickCheckFeedback:
        qcResult?.passed === false
          ? { issues: qcResult.issues, suggestion: qcResult.suggestion }
          : undefined,
      reviewerFeedback: mainSession.reviewerFeedback,
      awaitingReview: mainSession.awaitingReview,
    }
  }

  /**
   * サブセッション結果に基づいてメインセッションを更新
   *
   * Discriminated Union を使用することで、switch 内で
   * payload.result と payload.stackEntry.args が自動的に型推論される
   */
  private updateMainSessionFromResult(
    mainSession: MainSessionState,
    payload: SubSessionCompletionPayload
  ): void {
    switch (payload.agentType) {
      case 'quick_check': {
        // payload.result は QuickCheckResultType に自動推論
        // payload.stackEntry.args は QuickCheckArgsType に自動推論
        const { result, stackEntry } = payload

        // 現在のフィールドの fieldId を取得
        const plan = mainSession.plan as { fields?: Array<{ id: string }> } | undefined
        const currentField = plan?.fields?.[mainSession.currentFieldIndex]
        const fieldId = currentField?.id ?? ''

        // stackEntry.args から質問文言を取得（型安全にアクセス可能）
        const approvedQuestion = stackEntry.args.pendingQuestion

        mainSession.quickCheckResult = {
          fieldId,
          passed: result.passed ?? false,
          approvedQuestion: result.passed ? approvedQuestion : undefined,
          issues: result.issues,
          suggestion: result.suggestion,
        }

        // quick_check が通ったら reviewerFeedback をクリア
        // （フォローアップ質問が承認されたので、前回のフィードバックは不要）
        if (result.passed) {
          mainSession.reviewerFeedback = undefined
        }
        break
      }
      case 'reviewer': {
        // payload.result は ReviewerResultType に自動推論
        const { result } = payload
        // awaitingReview をクリア
        mainSession.awaitingReview = false

        if (result.passed) {
          // fieldValue を collectedFields に保存
          const plan = mainSession.plan as { fields?: Array<{ fieldId: string }> } | undefined
          const currentField = plan?.fields?.[mainSession.currentFieldIndex]
          if (currentField && result.fieldValue) {
            mainSession.collectedFields[currentField.fieldId] = result.fieldValue
            this.logger.info('Collected field value', {
              fieldId: currentField.fieldId,
              fieldValue: result.fieldValue,
            })
          }
          mainSession.currentFieldIndex++
          // 次のフィールドに移動するので状態をクリア
          mainSession.quickCheckResult = undefined
          mainSession.reviewerFeedback = undefined
          // フォローアップ回数をリセット
          mainSession.followUpCount = 0
        } else {
          // 失敗時はフィードバックを保存（フォローアップ質問用）
          mainSession.reviewerFeedback = result.feedback
          // quickCheckResult もクリア（再度 quick_check を通す必要がある）
          mainSession.quickCheckResult = undefined
          // フォローアップ回数をインクリメント
          mainSession.followUpCount = (mainSession.followUpCount ?? 0) + 1
          this.logger.debug('Incremented follow-up count', {
            followUpCount: mainSession.followUpCount,
          })
        }
        break
      }
      case 'auditor': {
        // 監査完了フラグを設定
        mainSession.auditCompleted = true
        this.logger.info('Auditor completed, setting auditCompleted flag')
        break
      }
      // greeter, architect, interviewer は特別な処理不要
    }
  }

  // =====================================
  // KV 操作
  // =====================================

  private async getMainSession(sessionId: string): Promise<MainSessionState | null> {
    return this.kvStore.get<MainSessionState>(KVKeys.mainSession(sessionId))
  }

  private async saveMainSession(sessionId: string, state: MainSessionState): Promise<void> {
    await this.kvStore.set(KVKeys.mainSession(sessionId), state, { expirationTtl: SESSION_TTL })
  }

  private async getSubSession(
    sessionId: string,
    stackIndex: number
  ): Promise<SubSessionState | null> {
    return this.kvStore.get<SubSessionState>(KVKeys.subSession(sessionId, stackIndex))
  }

  private async saveSubSession(
    sessionId: string,
    stackIndex: number,
    state: SubSessionState
  ): Promise<void> {
    await this.kvStore.set(KVKeys.subSession(sessionId, stackIndex), state, {
      expirationTtl: SESSION_TTL,
    })
  }
}
