import { askTool, subtaskTool } from '../../tools'
import { BaseAgent } from '../base'
import { INTERVIEWER_SYSTEM_PROMPT, buildInterviewerPrompt } from './prompts'
import type { State } from '../../orchestrator/types'
import type { Tool } from '../../tools'
import type { BaseAgentDependencies } from '../base'
import type { AgentConfig } from '../types'
import type { InterviewerContext, InterviewerTurnResult, PlanField } from './types'

/**
 * Interviewer エージェント
 *
 * インタビューのオーケストレーター。
 * - Plan を基に現在のフィールドを取得
 * - quick_check → ask → reviewer のフローで情報を収集
 * - 全フィールド完了後は auditor を呼び出す
 */
export class InterviewerAgent extends BaseAgent<InterviewerContext, InterviewerTurnResult> {
  readonly type = 'interviewer' as const
  readonly tools: Tool[] = [askTool, subtaskTool]

  protected readonly config: AgentConfig = {
    type: 'interviewer',
    systemPrompt: INTERVIEWER_SYSTEM_PROMPT,
    temperature: 0.7,
    maxOutputTokens: 800,
    forceToolCall: true, // 必ずツールを呼び出す
  }

  constructor(deps: BaseAgentDependencies) {
    super(deps)
  }

  /**
   * 現在のフィールドを取得
   */
  private getCurrentField(context: InterviewerContext): PlanField | undefined {
    return context.plan.fields[context.fieldIndex]
  }

  /**
   * 残タスクを取得
   */
  protected getRemainingTasks(_state: State): string[] {
    // Interviewer は subtask または ask を呼ぶ必要がある
    return ['Use subtask or ask tool to proceed with the interview']
  }

  /**
   * 1ターンの実行
   */
  async executeTurn(
    context: InterviewerContext,
    userMessage: string
  ): Promise<InterviewerTurnResult> {
    const currentField = this.getCurrentField(context)

    this.logger.info('Starting Interviewer turn', {
      stage: context.stage,
      fieldIndex: context.fieldIndex,
      fieldId: currentField?.fieldId ?? 'completed',
      questionType: currentField?.questionType,
      hasUserMessage: !!userMessage,
      quickCheckPassed: context.quickCheckPassed,
    })

    // AUDIT_COMPLETED の場合は即座に completion を返す
    if (context.stage === 'AUDIT_COMPLETED') {
      this.logger.info('Audit completed, finishing interview')
      return {
        responseText: '',
        toolCalls: [],
        currentFieldIndex: context.fieldIndex,
        completion: { context: { completed: true } },
      }
    }

    // インタビュープロンプトを構築
    const interviewPrompt = buildInterviewerPrompt({
      stage: context.stage,
      plan: context.plan,
      currentFieldIndex: context.fieldIndex,
      collectedFields: context.collectedFields,
      quickCheckPassed: context.quickCheckPassed,
      approvedQuestion: context.approvedQuestion,
      quickCheckFeedback: context.quickCheckFeedback,
      reviewerFeedback: context.reviewerFeedback,
    })

    // メッセージを構築
    let messages = this.buildMessages(context, userMessage)

    // ユーザーメッセージがない場合（初回または継続）、プロンプトを追加
    if (!userMessage) {
      messages = [...messages, { role: 'user' as const, content: interviewPrompt }]
    } else {
      // ユーザーの回答がある場合、レビューを促す
      messages = [
        ...messages,
        {
          role: 'user' as const,
          content: `${interviewPrompt}\n\nThe user has responded. Please call subtask(reviewer) to verify if the answer is sufficient.`,
        },
      ]
    }

    // LLM を呼び出し
    const response = await this.chatWithTools(messages, context.state)

    // subtask ツールの呼び出しを探す
    const subtaskCall = response.toolCalls.find((tc) => tc.name === 'subtask')
    if (subtaskCall) {
      const args = subtaskCall.args as { agent: string; context?: string }

      const result = await this.executeToolCall('subtask', args)
      const subtaskResult = result.result as { started: boolean; agent: string }

      this.logger.info('Interviewer started subtask', {
        agent: subtaskResult.agent,
        fieldIndex: context.fieldIndex,
        contextLength: args.context?.length ?? 0,
      })

      // subtask 呼び出し時は completion なし（Orchestrator が subtask ツールを検出してサブセッション開始）
      return {
        responseText: response.text ?? '',
        toolCalls: [result],
        currentFieldIndex: context.fieldIndex,
        startedSubtask: {
          agent: subtaskResult.agent as 'reviewer' | 'quick_check' | 'auditor',
          context: args.context,
        },
        usage: response.usage,
      }
    }

    // ask ツールの呼び出しを探す
    const askCall = response.toolCalls.find((tc) => tc.name === 'ask')
    if (askCall) {
      // QuickCheck を通していない場合は警告（本来は Orchestrator がブロックするべき）
      if (!context.quickCheckPassed) {
        this.logger.warn('Ask called without QuickCheck', {
          fieldIndex: context.fieldIndex,
        })
      }

      const result = await this.executeToolCall('ask', askCall.args as Record<string, unknown>)

      this.logger.info('Interviewer sent question to user', {
        fieldIndex: context.fieldIndex,
        messageLength: (askCall.args as { message: string }).message.length,
      })

      return {
        responseText: (askCall.args as { message: string }).message,
        toolCalls: [result],
        awaitingUserResponse: true,
        currentFieldIndex: context.fieldIndex,
        usage: response.usage,
      }
    }

    // ツールが呼ばれなかった場合は、プロンプトを再注入してリトライ
    return this.retryUntilToolCall(context, messages, response)
  }

  /**
   * ツールが呼ばれるまでリトライ
   */
  private async retryUntilToolCall(
    context: InterviewerContext,
    originalMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    lastResponse: {
      text?: string | null
      toolCalls: Array<{ name: string; args: unknown }>
      usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
    }
  ): Promise<InterviewerTurnResult> {
    const maxRetries = 3
    let currentMessages = originalMessages
    let currentResponse = lastResponse

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      this.logger.warn(
        `Interviewer did not call any tool, retrying (attempt ${attempt}/${maxRetries})`
      )

      const currentField = context.plan.fields[context.fieldIndex]
      const fieldInfo = currentField
        ? `You are currently on the "${currentField.label}" section (${currentField.questionType} type).`
        : 'All fields have been collected.'

      const toolGuidance = this.getToolGuidance(context, currentField)

      currentMessages = [
        ...currentMessages,
        { role: 'assistant' as const, content: currentResponse.text ?? '' },
        {
          role: 'user' as const,
          content: `You did not call any tool. You MUST call a tool to proceed.

${fieldInfo}

${toolGuidance}

**Do not respond with text only.** Call the appropriate tool now.`,
        },
      ]

      const retryResponse = await this.chatWithTools(currentMessages, context.state)

      // ツールが呼ばれたら処理
      if (retryResponse.toolCalls.length > 0) {
        return this.processToolCalls(context, retryResponse)
      }

      currentResponse = retryResponse
    }

    // 最大リトライ回数を超えた場合、デフォルトのアクションを実行
    this.logger.error(
      `Interviewer failed to call tool after ${maxRetries} retries, forcing default action`
    )
    return this.forceDefaultAction(context)
  }

  /**
   * 状況に応じたツールガイダンスを取得
   */
  private getToolGuidance(
    context: InterviewerContext,
    currentField: PlanField | undefined
  ): string {
    if (!currentField) {
      return `All fields are collected. Call subtask({ agent: 'auditor' }) for final review.`
    }

    if (context.quickCheckPassed && context.approvedQuestion) {
      return `QuickCheck has passed. Call ask({ message: "${context.approvedQuestion}" }) to ask the user.`
    }

    return `Call subtask({ agent: 'quick_check' }) to verify the question first.`
  }

  /**
   * リトライ失敗時にデフォルトのアクションを強制実行
   */
  private async forceDefaultAction(context: InterviewerContext): Promise<InterviewerTurnResult> {
    const currentField = context.plan.fields[context.fieldIndex]

    // 全フィールド完了 → auditor
    if (!currentField) {
      const result = await this.executeToolCall('subtask', { agent: 'auditor' })
      return {
        responseText: 'Starting final audit...',
        toolCalls: [result],
        currentFieldIndex: context.fieldIndex,
        startedSubtask: { agent: 'auditor' },
      }
    }

    // QuickCheck 通過済み → ask（approvedQuestion を使用、なければフォールバック）
    if (context.quickCheckPassed) {
      const question = context.approvedQuestion ?? `${currentField.label}について教えてください。`
      const result = await this.executeToolCall('ask', {
        message: question,
      })
      return {
        responseText: question,
        toolCalls: [result],
        awaitingUserResponse: true,
        currentFieldIndex: context.fieldIndex,
      }
    }

    // すべての質問で quick_check を呼ぶ
    const result = await this.executeToolCall('subtask', {
      agent: 'quick_check',
    })

    return {
      responseText: 'Verifying question...',
      toolCalls: [result],
      currentFieldIndex: context.fieldIndex,
      startedSubtask: { agent: 'quick_check' },
    }
  }

  /**
   * ツール呼び出しを処理
   */
  private async processToolCalls(
    context: InterviewerContext,
    response: {
      text?: string | null
      toolCalls: Array<{ name: string; args: unknown }>
      usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
    }
  ): Promise<InterviewerTurnResult> {
    const subtaskCall = response.toolCalls.find((tc) => tc.name === 'subtask')
    if (subtaskCall) {
      const args = subtaskCall.args as { agent: string; context?: string }

      const result = await this.executeToolCall('subtask', args)
      const subtaskResult = result.result as { started: boolean; agent: string }

      return {
        responseText: response.text ?? '',
        toolCalls: [result],
        currentFieldIndex: context.fieldIndex,
        startedSubtask: {
          agent: subtaskResult.agent as 'reviewer' | 'quick_check' | 'auditor',
          context: args.context,
        },
        usage: response.usage,
      }
    }

    const askCall = response.toolCalls.find((tc) => tc.name === 'ask')
    if (askCall) {
      const result = await this.executeToolCall('ask', askCall.args as Record<string, unknown>)

      return {
        responseText: (askCall.args as { message: string }).message,
        toolCalls: [result],
        awaitingUserResponse: true,
        currentFieldIndex: context.fieldIndex,
        usage: response.usage,
      }
    }

    // 想定外のツールが呼ばれた場合はデフォルトアクションを実行
    this.logger.warn('Interviewer called unexpected tool, forcing default action', {
      toolCalls: response.toolCalls.map((tc) => tc.name),
    })
    return this.forceDefaultAction(context)
  }
}
