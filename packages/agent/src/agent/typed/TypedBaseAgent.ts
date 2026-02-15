import { NoOpLogger } from '../../logger'
import { LLMProviderError } from '../../provider'
import { toolToLLMDefinition, executeTool } from '../../tools'
import { AgentError } from '../errors'
import type { ILogger } from '../../logger'
import type { ILLMProvider, LLMMessage, LLMToolDefinition } from '../../provider'
import type { Tool } from '../../tools'
import type { AgentConfig, AgentType, ToolCallResult } from '../types'
import type { AgentBaseInput, AgentLanguageState, ITypedAgent, TypedTurnResult } from './types'

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
 * TypedBaseAgent の依存関係
 */
export interface TypedBaseAgentDependencies {
  /** LLM プロバイダー */
  provider: ILLMProvider
  /** Logger（オプション） */
  logger?: ILogger
}

/**
 * 型付きエージェント基底クラス
 *
 * BaseAgent と同様の機能を提供しつつ、execute メソッドで型安全性を向上。
 * TArgs: エージェント固有の引数型
 * TResult: エージェントの結果型
 */
export abstract class TypedBaseAgent<TArgs, TResult> implements ITypedAgent<TArgs, TResult> {
  abstract readonly type: AgentType
  abstract readonly tools: Tool[]
  protected abstract readonly config: AgentConfig

  protected readonly provider: ILLMProvider
  protected readonly logger: ILogger

  constructor(deps: TypedBaseAgentDependencies) {
    this.provider = deps.provider
    this.logger = deps.logger ?? new NoOpLogger()
  }

  /**
   * 型安全な実行メソッド（サブクラスで実装）
   */
  abstract execute(
    args: TArgs,
    base: AgentBaseInput,
    userMessage: string
  ): Promise<TypedTurnResult<TResult>>

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
}
