import { BaseAgent } from '../base'
import { ARCHITECT_SYSTEM_PROMPT } from './prompts'
import { PlanSchema } from './schemas'
import { createPlanTool } from './tools'
import type { Plan } from './schemas'
import type {
  ArchitectContext,
  ArchitectTurnResult,
  JobFormFieldInput,
  FieldFactDefinitionInput,
} from './types'
import type { State } from '../../orchestrator/types'
import type { LLMMessage } from '../../provider'
import type { Tool } from '../../tools'
import type { BaseAgentDependencies } from '../base'
import type { AgentConfig } from '../types'

/**
 * Architect エージェント
 *
 * フォーム定義を分析し、インタビューの質問順序と質問タイプを決定する。
 * create_plan ツールでプランを出力したら完了。
 */
export class ArchitectAgent extends BaseAgent<ArchitectContext, ArchitectTurnResult> {
  readonly type = 'architect' as const
  readonly tools: Tool[] = [createPlanTool]

  protected readonly config: AgentConfig = {
    type: 'architect',
    systemPrompt: ARCHITECT_SYSTEM_PROMPT,
    temperature: 0.3, // 判断の一貫性を重視
    maxOutputTokens: 2000,
    model: 'gemini-2.5-flash-lite', // 軽量モデルで高速化
    forceToolCall: true, // 必ずツールを呼び出す
  }

  constructor(deps: BaseAgentDependencies) {
    super(deps)
  }

  /**
   * 現在の state から残タスクを取得
   */
  protected getRemainingTasks(state: State): string[] {
    const tasks: string[] = []
    if (!state.plan) {
      tasks.push('Create the interview plan using create_plan tool')
    }
    return tasks
  }

  /**
   * ツール結果から state を更新
   */
  protected updateStateFromToolResult(state: State, toolName: string, result: unknown): State {
    if (toolName === 'create_plan') {
      const r = result as { success: boolean; plan: Plan }
      if (r.success) {
        return { ...state, plan: r.plan }
      }
    }
    return state
  }

  /**
   * 1ターンの実行
   */
  async executeTurn(context: ArchitectContext, userMessage: string): Promise<ArchitectTurnResult> {
    // 既にプランが作成されている場合は完了
    if (context.state.plan) {
      return this.handleCompleted(context)
    }

    // フィールド定義をコンテキストとして含めたメッセージを構築
    const messages = this.buildMessagesWithFieldContext(context, userMessage)

    // エージェントループを実行
    const loopResult = await this.runAgentLoop(messages, context.state)

    // プランが作成されたかを確認
    const plan = this.extractPlanFromState(loopResult.state)

    // 完了時は completion を設定
    if (plan) {
      return {
        responseText: loopResult.responseText,
        toolCalls: loopResult.toolCalls,
        completion: { context: { plan } },
        plan,
        usage: loopResult.usage,
      }
    }

    // 継続の場合は completion なし
    return {
      responseText: loopResult.responseText,
      toolCalls: loopResult.toolCalls,
      awaitingUserResponse: loopResult.awaitingUserResponse,
      plan,
      usage: loopResult.usage,
    }
  }

  /**
   * フィールド定義を含めたメッセージを構築
   *
   * メインエージェント遷移時（greeter → architect）に、
   * greeter の会話履歴が含まれている場合でも、
   * architect としての初回呼び出し時にはフィールドコンテキストを含む
   * 初期メッセージを生成する。
   */
  private buildMessagesWithFieldContext(
    context: ArchitectContext,
    userMessage: string
  ): LLMMessage[] {
    const fieldContext = this.formatFieldsForPrompt(
      context.jobFormFields,
      context.fieldFactDefinitions
    )

    // プランがまだない場合は、architect としての初回呼び出し
    // greeter からの会話履歴があっても、フィールドコンテキストを含む
    // 初期メッセージで開始する
    if (!context.state.plan) {
      const initialMessage: LLMMessage = {
        role: 'user' as const,
        content: `以下のフィールド定義を分析し、create_plan ツールを使ってインタビュープランを作成してください。\n\n${fieldContext}`,
      }
      return [initialMessage]
    }

    // プランが既にある場合は通常の処理（継続時）
    const messages = this.buildMessages(context, userMessage)
    return messages
  }

  /**
   * フィールド情報をプロンプト用にフォーマット
   */
  private formatFieldsForPrompt(
    fields: JobFormFieldInput[],
    definitions: FieldFactDefinitionInput[]
  ): string {
    // 防御的チェック
    if (!fields || fields.length === 0) {
      this.logger.warn('No form fields provided to architect')
      return 'フィールド定義が提供されていません。'
    }

    // sortOrder でソート
    const sortedFields = [...fields].sort((a, b) => a.sortOrder - b.sortOrder)

    return sortedFields
      .map((field) => {
        const fieldDefs = definitions.filter((d) => d.jobFormFieldId === field.id)
        const factsSection =
          fieldDefs.length > 0
            ? `\n### 収集すべきFact:\n${fieldDefs.map((d) => `- ${d.fact} (完了条件: ${d.doneCriteria})`).join('\n')}`
            : ''

        return `
## フィールド: ${field.label}
- fieldId: ${field.fieldId}
- intent: ${field.intent ?? '未設定'}
- required: ${field.required}
- sortOrder: ${field.sortOrder}${factsSection}
      `.trim()
      })
      .join('\n\n---\n\n')
  }

  /**
   * State からプランを抽出
   */
  private extractPlanFromState(state: State): Plan | undefined {
    if (!state.plan) return undefined

    // Zodでバリデーション
    const result = PlanSchema.safeParse(state.plan)
    if (result.success) {
      return result.data
    }

    this.logger.warn('Invalid plan in state', { error: result.error.message })
    return undefined
  }

  /**
   * 完了セクションの処理
   */
  private handleCompleted(context: ArchitectContext): ArchitectTurnResult {
    const plan = this.extractPlanFromState(context.state)

    return {
      responseText: '',
      completion: plan ? { context: { plan } } : undefined,
      plan,
    }
  }
}
