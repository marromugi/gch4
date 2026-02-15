import { NoOpLogger } from '../../logger'
import { LLMProviderError } from '../../provider'
import { toolToLLMDefinition, executeTool } from '../../tools'
import { AgentError } from '../errors'
import type { ILogger } from '../../logger'
import type { ILLMProvider, LLMMessage, LLMToolDefinition, TokenUsage } from '../../provider'
import type { IKVStore } from '../../store/IKVStore'
import type { Tool } from '../../tools'
import type { AgentLanguageState } from '../typed/types'
import type {
  AgentConfig,
  AgentTurnResult,
  BaseAgentContext,
  IAgent,
  AgentType,
  ToolCallResult,
} from '../types'

/**
 * 言語別の会話指示（全エージェント共通）
 */
const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  ja: 'あなたは日本語で会話してください。',
  en: 'Please communicate in English.',
  zh: '请用中文交流。',
  ko: '한국어로 대화해 주세요.',
}

/**
 * 言語別のトーン指示（全エージェント共通）
 * 温かく親しみやすい会話スタイルを促す
 */
const TONE_INSTRUCTIONS: Record<string, string> = {
  ja: `## 会話トーン
- 温かく親しみやすい話し方をする
- 相槌を打つ（「なるほど！」「そうなんですね」「いいですね！」）
- 共感を示す（「大変でしたね」「それはすごい！」）
- 質問は1つずつ、シンプルに聞く
- 堅苦しい面接口調は禁止（「具体的に述べてください」など）
- 答えやすい質問を心がける`,
  en: `## Conversation Tone
- Be warm and friendly
- Use acknowledgments ("I see!", "That's great!", "Got it!")
- Show empathy ("That sounds challenging", "That's impressive!")
- Ask one simple question at a time
- Avoid formal interview-style language
- Make questions easy to answer`,
  zh: `## 对话语气
- 保持温暖友好的说话方式
- 使用回应词（"原来如此！"、"是这样啊"、"太棒了！"）
- 表达共情（"那一定很辛苦"、"真厉害！"）
- 每次只问一个简单的问题
- 避免正式的面试语气
- 让问题容易回答`,
  ko: `## 대화 톤
- 따뜻하고 친근한 말투 사용
- 맞장구 치기（"그렇군요!", "네네", "좋네요!"）
- 공감 표현（"힘드셨겠네요", "대단하시네요!"）
- 질문은 하나씩, 간단하게
- 딱딱한 면접 말투 금지
- 대답하기 쉬운 질문하기`,
}

/**
 * エージェントループの結果
 */
export interface AgentLoopResult {
  /** ユーザーへのレスポンステキスト */
  responseText: string
  /** 実行されたツール呼び出しの結果 */
  toolCalls: ToolCallResult[]
  /** ユーザーの応答を待っているか */
  awaitingUserResponse: boolean
  /** 更新後の状態 */
  state: AgentLanguageState
  /** トークン使用量 */
  usage?: TokenUsage
}

/**
 * BaseAgent の依存関係
 */
export interface BaseAgentDependencies {
  /** LLM プロバイダー */
  provider: ILLMProvider
  /** Logger（オプション） */
  logger?: ILogger
  /** KVStore（オプション、状態を永続化するエージェント用） */
  store?: IKVStore
}

/**
 * エージェント基底クラス
 *
 * 全てのエージェントはこのクラスを継承する。
 * 共通の LLM 呼び出しやツール実行のロジックを提供。
 */
export abstract class BaseAgent<
  TContext extends BaseAgentContext = BaseAgentContext,
  TResult extends AgentTurnResult = AgentTurnResult,
> implements IAgent<TContext, TResult> {
  abstract readonly type: AgentType
  abstract readonly tools: Tool[]
  protected abstract readonly config: AgentConfig

  protected readonly provider: ILLMProvider
  protected readonly logger: ILogger
  protected readonly store?: IKVStore

  constructor(deps: BaseAgentDependencies) {
    this.provider = deps.provider
    this.logger = deps.logger ?? new NoOpLogger()
    this.store = deps.store
  }

  /**
   * 1ターンの実行（サブクラスで実装）
   */
  abstract executeTurn(context: TContext, userMessage: string): Promise<TResult>

  /**
   * 会話履歴にユーザーメッセージを追加してメッセージ配列を構築
   */
  protected buildMessages(context: TContext, userMessage: string): LLMMessage[] {
    if (!userMessage) {
      return [...context.chatHistory]
    }
    return [...context.chatHistory, { role: 'user', content: userMessage }]
  }

  /**
   * ツール定義を LLM 用の形式に変換
   */
  protected getToolDefinitions(): LLMToolDefinition[] {
    return this.tools.map(toolToLLMDefinition)
  }

  /**
   * ツール名からツールを取得
   */
  protected getTool(name: string): Tool | undefined {
    return this.tools.find((t) => t.name === name)
  }

  /**
   * ツールを実行
   */
  protected async executeToolCall(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<ToolCallResult> {
    const tool = this.getTool(toolName)
    if (!tool) {
      this.logger.error(`Tool not found: ${toolName}`, { agent: this.type, tool: toolName })
      throw AgentError.toolNotFound(toolName)
    }

    this.logger.debug(`Executing tool: ${toolName}`, { agent: this.type, tool: toolName, args })

    const result = await executeTool(tool, args)
    if (!result.success) {
      this.logger.error(`Tool execution failed: ${toolName}`, {
        agent: this.type,
        tool: toolName,
        error: result.error,
      })
      throw AgentError.toolExecutionFailed(toolName, new Error(result.error))
    }

    this.logger.debug(`Tool executed successfully: ${toolName}`, {
      agent: this.type,
      tool: toolName,
      result: result.data,
    })

    return {
      toolName,
      args,
      result: result.data,
    }
  }

  /**
   * システムプロンプトを構築
   * state.language が設定されていれば、その言語で会話する指示とトーン指示を追加
   */
  protected buildSystemPrompt(state?: AgentLanguageState): string {
    let prompt = this.config.systemPrompt

    if (state?.language) {
      const langInstruction = LANGUAGE_INSTRUCTIONS[state.language] ?? LANGUAGE_INSTRUCTIONS['en']
      const toneInstruction = TONE_INSTRUCTIONS[state.language] ?? TONE_INSTRUCTIONS['en']
      prompt = `${langInstruction}\n\n${toneInstruction}\n\n${prompt}`
    }

    return prompt
  }

  /**
   * ツール付きチャットを実行
   */
  protected async chatWithTools(messages: LLMMessage[], state?: AgentLanguageState) {
    this.logger.debug('Calling LLM with tools', {
      agent: this.type,
      messageCount: messages.length,
      toolCount: this.tools.length,
    })

    try {
      const response = await this.provider.chatWithTools(messages, this.getToolDefinitions(), {
        systemPrompt: this.buildSystemPrompt(state),
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxOutputTokens,
        model: this.config.model,
        forceToolCall: this.config.forceToolCall,
      })

      this.logger.debug('LLM response received', {
        agent: this.type,
        hasText: !!response.text,
        toolCallCount: response.toolCalls.length,
        usage: response.usage,
      })

      return response
    } catch (error) {
      this.logger.error('LLM call failed', {
        agent: this.type,
        error: error instanceof Error ? error.message : String(error),
      })
      if (error instanceof LLMProviderError) {
        throw AgentError.llmError(error.message, error)
      }
      throw error
    }
  }

  /**
   * 通常チャットを実行
   */
  protected async chat(messages: LLMMessage[], state?: AgentLanguageState) {
    try {
      return await this.provider.chat(messages, {
        systemPrompt: this.buildSystemPrompt(state),
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxOutputTokens,
        model: this.config.model,
      })
    } catch (error) {
      if (error instanceof LLMProviderError) {
        throw AgentError.llmError(error.message, error)
      }
      throw error
    }
  }

  /** 最大ループ回数 */
  protected readonly maxLoopIterations = 10

  /**
   * 現在の state から残タスクを取得（サブクラスで実装）
   */
  protected abstract getRemainingTasks(state: AgentLanguageState): string[]

  /**
   * ツール結果から state を更新（サブクラスでオーバーライド可能）
   */
  protected updateStateFromToolResult(
    state: AgentLanguageState,
    _toolName: string,
    _result: unknown
  ): AgentLanguageState {
    return state
  }

  /**
   * エージェントループを実行
   * ask ツールが呼ばれるまでループする
   */
  protected async runAgentLoop(
    initialMessages: LLMMessage[],
    state: AgentLanguageState
  ): Promise<AgentLoopResult> {
    this.logger.info('Starting agent loop', {
      agent: this.type,
      initialMessageCount: initialMessages.length,
      maxIterations: this.maxLoopIterations,
    })

    let messages = [...initialMessages]
    const allToolCalls: ToolCallResult[] = []
    let totalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    let currentState = { ...state }

    for (let i = 0; i < this.maxLoopIterations; i++) {
      this.logger.debug(`Loop iteration ${i + 1}/${this.maxLoopIterations}`, {
        agent: this.type,
        iteration: i + 1,
      })

      // LLM 呼び出し（state を渡して言語指示を適用）
      const response = await this.chatWithTools(messages, currentState)

      if (response.usage) {
        totalUsage = {
          promptTokens: (totalUsage.promptTokens ?? 0) + (response.usage.promptTokens ?? 0),
          completionTokens:
            (totalUsage.completionTokens ?? 0) + (response.usage.completionTokens ?? 0),
          totalTokens: (totalUsage.totalTokens ?? 0) + (response.usage.totalTokens ?? 0),
        }
      }

      // ツール呼び出しがない場合 → 残タスクを確認
      if (response.toolCalls.length === 0) {
        const remainingTasks = this.getRemainingTasks(currentState)

        if (remainingTasks.length === 0) {
          this.logger.info('All tasks completed, ending loop', {
            agent: this.type,
            totalToolCalls: allToolCalls.length,
          })
          // 全タスク完了
          return {
            responseText: response.text ?? '',
            toolCalls: allToolCalls,
            awaitingUserResponse: false,
            state: currentState,
            usage: totalUsage,
          }
        }

        this.logger.debug('No tool calls, injecting remaining tasks', {
          agent: this.type,
          remainingTasks,
        })

        // 残タスクを注入して再度 LLM 呼び出し
        messages = [
          ...messages,
          { role: 'assistant' as const, content: response.text ?? '' },
          {
            role: 'user' as const,
            content: `You still need to complete the following tasks:\n${remainingTasks.map((t) => `- ${t}`).join('\n')}\n\nIf you don't have the required information from the user, use the 'ask' tool to ask them. Do not just respond with text - you MUST call a tool.`,
          },
        ]
        continue
      }

      // ask ツールが呼ばれたらループ終了
      const askCall = response.toolCalls.find((tc) => tc.name === 'ask')
      if (askCall) {
        this.logger.info('Ask tool called, awaiting user response', {
          agent: this.type,
          message: (askCall.args as { message: string }).message,
        })
        const askResult = await this.executeToolCall('ask', askCall.args as Record<string, unknown>)
        allToolCalls.push(askResult)
        return {
          responseText: (askCall.args as { message: string }).message,
          toolCalls: allToolCalls,
          awaitingUserResponse: true,
          state: currentState,
          usage: totalUsage,
        }
      }

      // 他のツールを実行
      const toolResults: Array<{ name: string; result: unknown; error?: string }> = []
      for (const toolCall of response.toolCalls) {
        try {
          const result = await this.executeToolCall(
            toolCall.name,
            toolCall.args as Record<string, unknown>
          )
          allToolCalls.push(result)
          toolResults.push({ name: toolCall.name, result: result.result })

          // state を更新
          currentState = this.updateStateFromToolResult(currentState, toolCall.name, result.result)
        } catch (error) {
          // エラーも LLM にフィードバック
          toolResults.push({
            name: toolCall.name,
            result: null,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      // ツール実行後に残タスクを確認 → 完了していたらループ終了
      const remainingTasksAfterTools = this.getRemainingTasks(currentState)
      if (remainingTasksAfterTools.length === 0) {
        this.logger.info('All tasks completed after tool execution, ending loop', {
          agent: this.type,
          totalToolCalls: allToolCalls.length,
        })
        return {
          responseText: response.text ?? '',
          toolCalls: allToolCalls,
          awaitingUserResponse: false,
          state: currentState,
          usage: totalUsage,
        }
      }

      // ツール結果を履歴に追加
      messages = [
        ...messages,
        { role: 'assistant' as const, content: JSON.stringify(response.toolCalls) },
        { role: 'user' as const, content: `Tool results: ${JSON.stringify(toolResults)}` },
      ]
    }

    // 最大ループ回数に達した
    this.logger.error('Max loop iterations reached', {
      agent: this.type,
      maxIterations: this.maxLoopIterations,
      totalToolCalls: allToolCalls.length,
    })
    throw AgentError.maxLoopIterationsReached(this.maxLoopIterations)
  }
}
