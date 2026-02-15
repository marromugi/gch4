import { BaseAgent } from '../base/BaseAgent'
import { FORM_DESIGNER_SYSTEM_PROMPT, buildInitialMessage, formatUserAnswers } from './prompts'
import { askWithOptionsTool, generateFieldsTool } from './tools'
import type { AskWithOptionsArgs, GeneratedField } from './tools'
import type { FormDesignerContext, FormDesignerState, FormDesignerTurnResult } from './types'
import type { LLMMessage } from '../../provider'
import type { Tool } from '../../tools'
import type { BaseAgentDependencies } from '../base/BaseAgent'
import type { AgentLanguageState } from '../typed/types'
import type { AgentConfig, AgentType } from '../types'

/**
 * FormDesigner エージェント
 *
 * ユーザーの purpose（フォームの目的）をもとに、
 * 選択肢付き質問で情報を収集し、フォームフィールドを生成する。
 */
export class FormDesignerAgent extends BaseAgent<FormDesignerContext, FormDesignerTurnResult> {
  readonly type: AgentType = 'form_designer'
  readonly tools: Tool[] = [askWithOptionsTool, generateFieldsTool]

  protected readonly config: AgentConfig = {
    type: 'form_designer',
    systemPrompt: FORM_DESIGNER_SYSTEM_PROMPT,
    temperature: 0.7,
    maxOutputTokens: 6000,
    model: 'gemini-2.5-flash',
    forceToolCall: true,
  }

  constructor(deps: BaseAgentDependencies) {
    super(deps)
  }

  /**
   * 残タスクを取得
   */
  protected getRemainingTasks(_state: AgentLanguageState): string[] {
    // FormDesigner は独自の状態管理を使用するため、
    // State からは判断できない。常に空を返す。
    return []
  }

  /**
   * ツール結果から state を更新
   */
  protected updateStateFromToolResult(
    state: AgentLanguageState,
    _toolName: string,
    _result: unknown
  ): AgentLanguageState {
    // FormDesigner は独自の状態管理を使用
    return state
  }

  /**
   * 1ターンの実行
   */
  async executeTurn(
    context: FormDesignerContext,
    userMessage: string
  ): Promise<FormDesignerTurnResult> {
    this.logger.info('FormDesigner executeTurn', {
      agent: this.type,
      sessionId: context.sessionId,
      status: context.formDesignerState.status,
      hasUserMessage: !!userMessage,
    })

    // メッセージを構築
    const messages = this.buildMessagesForDesigner(context, userMessage)

    // エージェントループを実行
    const loopResult = await this.runAgentLoop(messages, context.state ?? {})

    // ask_with_options が呼ばれた場合
    const askCall = loopResult.toolCalls.find((tc) => tc.toolName === 'ask_with_options')
    if (askCall) {
      const args = askCall.args as AskWithOptionsArgs
      const updatedState: FormDesignerState = {
        ...context.formDesignerState,
        status: 'asking',
      }

      return {
        responseText: '',
        toolCalls: loopResult.toolCalls,
        awaitingUserResponse: true,
        questions: args.questions,
        sessionState: updatedState,
        usage: loopResult.usage,
      }
    }

    // generate_fields が呼ばれた場合
    const generateCall = loopResult.toolCalls.find((tc) => tc.toolName === 'generate_fields')
    if (generateCall) {
      const result = generateCall.result as { fields: GeneratedField[] }
      const updatedState: FormDesignerState = {
        ...context.formDesignerState,
        status: 'completed',
        generatedFields: result.fields,
      }

      return {
        responseText: '',
        toolCalls: loopResult.toolCalls,
        completion: { context: { fields: result.fields } },
        generatedFields: result.fields,
        sessionState: updatedState,
        usage: loopResult.usage,
      }
    }

    // ツールが呼ばれなかった場合（通常は発生しない）
    return {
      responseText: loopResult.responseText,
      toolCalls: loopResult.toolCalls,
      sessionState: context.formDesignerState,
      usage: loopResult.usage,
    }
  }

  /**
   * FormDesigner 用のメッセージを構築
   */
  private buildMessagesForDesigner(
    context: FormDesignerContext,
    userMessage: string
  ): LLMMessage[] {
    const messages: LLMMessage[] = []

    // 既存の会話履歴があればそのまま使用
    if (context.chatHistory.length > 0) {
      messages.push(...context.chatHistory)

      // ユーザーメッセージがあれば追加
      if (userMessage) {
        messages.push({ role: 'user', content: userMessage })
      }

      return messages
    }

    // 初回: purpose と回答履歴を含む初期メッセージを構築
    let initialContent = buildInitialMessage(context.purpose)

    // 既に回答がある場合は追加
    if (context.formDesignerState.collectedAnswers.length > 0) {
      const answersText = formatUserAnswers(context.formDesignerState.collectedAnswers)
      initialContent = `${initialContent}\n\n${answersText}`
    }

    messages.push({ role: 'user', content: initialContent })

    return messages
  }

  /**
   * 早期離脱（現在の情報でフィールド生成）用のターン実行
   */
  async executeEarlyExit(context: FormDesignerContext): Promise<FormDesignerTurnResult> {
    this.logger.info('FormDesigner executeEarlyExit', {
      agent: this.type,
      sessionId: context.sessionId,
      collectedAnswerCount: context.formDesignerState.collectedAnswers.length,
    })

    // 早期離脱メッセージを追加して実行
    const messages = this.buildMessagesForDesigner(context, '')
    messages.push({
      role: 'user',
      content: `ユーザーはこれ以上の質問を希望していません。
現在収集した情報をもとに、フォームフィールドを生成してください。
generate_fields ツールを使用してフィールドを出力してください。`,
    })

    // forceToolCall を有効にして generate_fields を強制
    const originalForceToolCall = this.config.forceToolCall
    this.config.forceToolCall = true

    try {
      const loopResult = await this.runAgentLoop(messages, context.state ?? {})

      const generateCall = loopResult.toolCalls.find((tc) => tc.toolName === 'generate_fields')
      if (generateCall) {
        const result = generateCall.result as { fields: GeneratedField[] }
        const updatedState: FormDesignerState = {
          ...context.formDesignerState,
          status: 'completed',
          generatedFields: result.fields,
        }

        return {
          responseText: '',
          toolCalls: loopResult.toolCalls,
          completion: { context: { fields: result.fields } },
          generatedFields: result.fields,
          sessionState: updatedState,
          usage: loopResult.usage,
        }
      }

      // generate_fields が呼ばれなかった場合（エラーケース）
      throw new Error('generate_fields was not called during early exit')
    } finally {
      this.config.forceToolCall = originalForceToolCall
    }
  }
}
