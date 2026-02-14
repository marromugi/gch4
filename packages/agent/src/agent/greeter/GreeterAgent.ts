import {
  askTool,
  setLanguageTool,
  setCountryTool,
  setTimezoneTool,
  getAvailableLanguagesTool,
} from '../../tools'
import { BaseAgent } from '../base'
import {
  buildGreeterSystemPrompt,
  COMPLETION_MESSAGES,
  GREETER_LANGUAGE_INSTRUCTIONS,
  GREETER_TONE_INSTRUCTIONS,
} from './prompts'
import { getSection } from './types'
import type { State } from '../../orchestrator/types'
import type { Tool } from '../../tools'
import type { BaseAgentDependencies } from '../base'
import type { AgentConfig } from '../types'
import type { GreeterContext, GreeterTurnResult } from './types'

/**
 * Greeter エージェント
 *
 * 応募チャット開始時に挨拶・言語・居住国・タイムゾーンを取得する。
 * State から現在のセクションを導出し、適切な処理を行う。
 */
export class GreeterAgent extends BaseAgent<GreeterContext, GreeterTurnResult> {
  readonly type = 'greeter' as const
  readonly tools: Tool[] = [
    askTool,
    getAvailableLanguagesTool,
    setLanguageTool,
    setCountryTool,
    setTimezoneTool,
  ]

  protected readonly config: AgentConfig = {
    type: 'greeter',
    systemPrompt: '', // buildSystemPrompt でオーバーライドするため未使用
    temperature: 0.7,
    maxOutputTokens: 500,
  }

  constructor(deps: BaseAgentDependencies) {
    super(deps)
  }

  /**
   * システムプロンプトを動的に構築
   * 現在の state に基づいて、完了済みセクションを省略したプロンプトを生成
   */
  protected buildSystemPrompt(state?: State): string {
    // 動的にプロンプトを生成
    const basePrompt = buildGreeterSystemPrompt(state ?? {})

    // 言語が設定されている場合は、言語・トーン指示を追加
    if (state?.language) {
      const langInstruction =
        GREETER_LANGUAGE_INSTRUCTIONS[state.language] ?? GREETER_LANGUAGE_INSTRUCTIONS['en']
      const toneInstruction =
        GREETER_TONE_INSTRUCTIONS[state.language] ?? GREETER_TONE_INSTRUCTIONS['en']
      return `${langInstruction}\n\n${toneInstruction}\n\n${basePrompt}`
    }

    return basePrompt
  }

  /**
   * 現在の state から残タスクを取得
   */
  protected getRemainingTasks(state: State): string[] {
    const tasks: string[] = []
    if (!state.language) tasks.push('Set the user language using set_language')
    if (!state.country) tasks.push('Set the user country using set_country')
    if (!state.timezone) tasks.push('Set the timezone using set_timezone')
    return tasks
  }

  /**
   * ツール結果から state を更新
   */
  protected updateStateFromToolResult(state: State, toolName: string, result: unknown): State {
    const r = result as Record<string, unknown>
    switch (toolName) {
      case 'set_language':
        return { ...state, language: r.language as string }
      case 'set_country':
        return { ...state, country: r.country as string }
      case 'set_timezone':
        return { ...state, timezone: r.timezone as string }
      default:
        return state
    }
  }

  /**
   * 1ターンの実行
   */
  async executeTurn(context: GreeterContext, userMessage: string): Promise<GreeterTurnResult> {
    const section = getSection(context.state)

    // 既に完了している場合
    if (section === 'completed') {
      return this.handleCompleted(context)
    }

    // 初回（ユーザーメッセージなし）の場合、挨拶を促すメッセージを追加
    let messages = this.buildMessages(context, userMessage)
    if (!userMessage) {
      messages = [
        ...messages,
        {
          role: 'user' as const,
          content: 'Please greet the user and ask about their preferred language.',
        },
      ]
    }

    // エージェントループを実行
    const loopResult = await this.runAgentLoop(messages, context.state)

    // 全タスク完了かどうかを判定
    const allTasksCompleted = this.getRemainingTasks(loopResult.state).length === 0
    const currentSection = getSection(loopResult.state)

    // 完了した場合は completion を設定して返す
    if (allTasksCompleted && !loopResult.awaitingUserResponse) {
      const language = loopResult.state.language ?? 'en'
      const completionMessage = COMPLETION_MESSAGES[language] ?? COMPLETION_MESSAGES['en']

      return {
        responseText: completionMessage,
        toolCalls: loopResult.toolCalls,
        completion: {
          context: {
            language: loopResult.state.language,
            country: loopResult.state.country,
            timezone: loopResult.state.timezone,
          },
        },
        section: 'completed',
        usage: loopResult.usage,
      }
    }

    // 継続の場合は completion なし、更新された state を返す
    return {
      responseText: loopResult.responseText,
      toolCalls: loopResult.toolCalls,
      awaitingUserResponse: loopResult.awaitingUserResponse,
      section: currentSection,
      usage: loopResult.usage,
      updatedState: {
        language: loopResult.state.language,
        country: loopResult.state.country,
        timezone: loopResult.state.timezone,
      },
    }
  }

  /**
   * 完了セクションの処理
   */
  private handleCompleted(context: GreeterContext): GreeterTurnResult {
    const language = context.state.language ?? 'en'
    const completionMessage = COMPLETION_MESSAGES[language] ?? COMPLETION_MESSAGES['en']

    return {
      responseText: completionMessage,
      completion: {
        context: {
          language: context.state.language,
          country: context.state.country,
          timezone: context.state.timezone,
        },
      },
      section: 'completed',
    }
  }
}
