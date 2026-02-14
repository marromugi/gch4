import { BaseAgent } from '../base'
import { AUDITOR_SYSTEM_PROMPT, buildAuditPrompt } from './prompts'
import { auditorResultTool } from './tools'
import type { State } from '../../orchestrator/types'
import type { Tool } from '../../tools'
import type { BaseAgentDependencies } from '../base'
import type { AgentConfig } from '../types'
import type { AuditorContext, AuditorTurnResult, AuditResult } from './types'

/**
 * Auditor エージェント
 *
 * 全フィールド完了後の最終監査を行う。
 * - 過剰な情報収集がないか
 * - 失礼な表現がないか
 * - 会話全体の一貫性
 * - 禁止トピックへの抵触がないか
 */
export class AuditorAgent extends BaseAgent<AuditorContext, AuditorTurnResult> {
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
  protected getRemainingTasks(_state: State): string[] {
    return ['Use the result tool to return your audit verdict and summary']
  }

  /**
   * 1ターンの実行
   */
  async executeTurn(context: AuditorContext, _userMessage: string): Promise<AuditorTurnResult> {
    this.logger.info('Starting Auditor', {
      fieldCount: context.allCollectedFields.length,
      conversationLength: context.fullConversationHistory.length,
    })

    // 監査用プロンプトを構築
    const auditPrompt = buildAuditPrompt({
      collectedFields: context.allCollectedFields.map((f) => ({
        fieldId: f.fieldId,
        label: f.label,
        value: f.value,
      })),
      conversationLength: context.fullConversationHistory.length,
      prohibitedTopics: context.prohibitedTopics,
    })

    // メッセージを構築（会話履歴 + 監査プロンプト）
    const messages = [
      ...context.fullConversationHistory,
      { role: 'user' as const, content: auditPrompt },
    ]

    // LLM を呼び出して監査
    const response = await this.chatWithTools(messages, context.state)

    // result ツールの呼び出しを探す
    const resultCall = response.toolCalls.find((tc) => tc.name === 'audit_result')

    if (resultCall) {
      const result = await this.executeToolCall(
        'audit_result',
        resultCall.args as Record<string, unknown>
      )
      const auditResult = result.result as AuditResult

      this.logger.info('Auditor completed', {
        passed: auditResult.passed,
        issueCount: auditResult.issues?.length ?? 0,
        summaryLength: auditResult.summary.length,
      })

      return {
        responseText: auditResult.summary,
        toolCalls: [result],
        completion: { context: auditResult },
        auditResult,
        usage: response.usage,
      }
    }

    // result ツールが呼ばれなかった場合はエラー
    this.logger.error('Auditor did not call result tool')
    throw new Error('Auditor agent must call the result tool')
  }
}
