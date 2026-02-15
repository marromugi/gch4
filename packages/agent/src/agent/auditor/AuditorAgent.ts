import { BaseAgent } from '../base'
import { AUDITOR_SYSTEM_PROMPT, buildAuditPrompt } from './prompts'
import { auditorResultTool } from './tools'
import type { AuditorArgs, AuditorResult } from './definition'
import type { AuditorContext, AuditorTurnResult, AuditResult } from './types'
import type { Tool } from '../../tools'
import type { BaseAgentDependencies } from '../base'
import type {
  AgentBaseInput,
  AgentLanguageState,
  ITypedAgent,
  TypedTurnResult,
} from '../typed/types'
import type { AgentConfig } from '../types'

/**
 * Auditor エージェント
 *
 * 全フィールド完了後の最終監査を行う。
 * - 過剰な情報収集がないか
 * - 失礼な表現がないか
 * - 会話全体の一貫性
 * - 禁止トピックへの抵触がないか
 */
export class AuditorAgent
  extends BaseAgent<AuditorContext, AuditorTurnResult>
  implements ITypedAgent<AuditorArgs, AuditorResult>
{
  readonly type = 'auditor' as const
  readonly tools: Tool[] = [auditorResultTool]

  protected readonly config: AgentConfig = {
    type: 'auditor',
    systemPrompt: AUDITOR_SYSTEM_PROMPT,
    temperature: 0.3,
    maxOutputTokens: 4000, // サマリー生成のためやや多め（issues配列が長くなる場合に備えて増加）
    forceToolCall: true, // 必ず result ツールを呼び出す
  }

  constructor(deps: BaseAgentDependencies) {
    super(deps)
  }

  /**
   * 残タスクを取得（Auditor は result を返すまで完了しない）
   */
  protected getRemainingTasks(_state: AgentLanguageState): string[] {
    return ['Use the result tool to return your audit verdict and summary']
  }

  /**
   * 型安全な実行メソッド（ITypedAgent インターフェース）
   *
   * @param args AuditorArgs - 型安全な引数
   * @param base AgentBaseInput - 共通の基本入力
   * @param _userMessage ユーザーメッセージ（未使用）
   */
  async execute(
    args: AuditorArgs,
    base: AgentBaseInput,
    _userMessage: string
  ): Promise<TypedTurnResult<AuditorResult>> {
    this.logger.info('Starting Auditor', {
      fieldCount: args.collectedFields.length,
      conversationLength: args.conversationLength,
    })

    // 監査用プロンプトを構築
    const auditPrompt = buildAuditPrompt({
      collectedFields: args.collectedFields,
      conversationLength: args.conversationLength,
      prohibitedTopics: args.prohibitedTopics,
    })

    // メッセージを構築（会話履歴 + 監査プロンプト）
    const messages = [...base.chatHistory, { role: 'user' as const, content: auditPrompt }]

    // LLM を呼び出して監査
    const response = await this.chatWithTools(messages, base.state)

    // result ツールの呼び出しを探す
    const resultCall = response.toolCalls.find((tc) => tc.name === 'audit_result')

    if (resultCall) {
      const result = await this.executeToolCall(
        'audit_result',
        resultCall.args as Record<string, unknown>
      )
      const auditResult = result.result as AuditorResult

      this.logger.info('Auditor completed', {
        passed: auditResult.passed,
        issueCount: auditResult.issues?.length ?? 0,
        summaryLength: auditResult.summary.length,
      })

      return {
        responseText: auditResult.summary,
        toolCalls: [result],
        completion: { context: auditResult },
        usage: response.usage,
      }
    }

    // result ツールが呼ばれなかった場合はエラー
    this.logger.error('Auditor did not call result tool')
    throw new Error('Auditor agent must call the result tool')
  }

  /**
   * 1ターンの実行（互換性のため残す）
   * @deprecated execute メソッドを使用してください
   */
  async executeTurn(context: AuditorContext, userMessage: string): Promise<AuditorTurnResult> {
    // execute メソッドに委譲
    const result = await this.execute(
      {
        collectedFields: context.allCollectedFields.map((f) => ({
          fieldId: f.fieldId,
          label: f.label,
          value: f.value,
        })),
        conversationLength: context.fullConversationHistory.length,
        prohibitedTopics: context.prohibitedTopics,
      },
      {
        sessionId: context.sessionId,
        chatHistory: context.fullConversationHistory,
        state: context.state,
      },
      userMessage
    )

    // AuditorTurnResult 形式に変換
    return {
      ...result,
      auditResult: result.completion?.context as AuditResult | undefined,
    }
  }
}
