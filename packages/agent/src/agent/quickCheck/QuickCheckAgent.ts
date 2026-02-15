import { BaseAgent } from '../base'
import { QUICK_CHECK_SYSTEM_PROMPT, buildQuickCheckPrompt } from './prompts'
import { quickCheckResultTool } from './tools'
import type { QuickCheckArgs } from './definition'
import type { QuickCheckContext, QuickCheckTurnResult, QuickCheckResult } from './types'
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
 * QuickCheck エージェント
 *
 * 質問を送信する前にコンプライアンスチェックを行う。
 * - フィールド/意図との整合性
 * - 禁止トピックへの抵触
 * - 既回答の再質問
 * - トーン違反
 */
export class QuickCheckAgent
  extends BaseAgent<QuickCheckContext, QuickCheckTurnResult>
  implements ITypedAgent<QuickCheckArgs, QuickCheckResult>
{
  readonly type = 'quick_check' as const
  readonly tools: Tool[] = [quickCheckResultTool]

  protected readonly config: AgentConfig = {
    type: 'quick_check',
    systemPrompt: QUICK_CHECK_SYSTEM_PROMPT,
    temperature: 0.3, // 判定は一貫性が重要なので低め
    maxOutputTokens: 500,
    model: 'gemini-2.5-flash-lite', // 軽量モデルで高速化
    forceToolCall: true, // 必ず result ツールを呼び出す
  }

  constructor(deps: BaseAgentDependencies) {
    super(deps)
  }

  /**
   * 残タスクを取得（QuickCheck は result を返すまで完了しない）
   */
  protected getRemainingTasks(_state: AgentLanguageState): string[] {
    return ['Use the result tool to return your compliance check verdict']
  }

  private static readonly MAX_RETRIES = 3
  private static readonly RESULT_TOOL_REMINDER =
    'result ツールを使用してコンプライアンスチェックの結果を返してください。passed（boolean）と必要に応じて issues（問題点の配列）を指定してください。'

  /**
   * 型安全な実行メソッド（ITypedAgent インターフェース）
   *
   * @param args QuickCheckArgs - 型安全な引数
   * @param base AgentBaseInput - 共通の基本入力
   * @param _userMessage ユーザーメッセージ（未使用）
   */
  async execute(
    args: QuickCheckArgs,
    base: AgentBaseInput,
    _userMessage: string
  ): Promise<TypedTurnResult<QuickCheckResult>> {
    this.logger.info('Starting QuickCheck', {
      fieldId: args.fieldId,
      questionLength: args.pendingQuestion.length,
    })

    // チェック用プロンプトを構築
    const checkPrompt = buildQuickCheckPrompt({
      pendingQuestion: args.pendingQuestion,
      fieldId: args.fieldId,
      intent: args.intent,
      prohibitedTopics: args.prohibitedTopics,
      collectedFacts: args.collectedFacts,
    })

    // メッセージを構築（ユーザーメッセージとしてチェック対象を送信）
    const messages = [...base.chatHistory, { role: 'user' as const, content: checkPrompt }]

    // リトライループ
    for (let attempt = 0; attempt < QuickCheckAgent.MAX_RETRIES; attempt++) {
      // LLM を呼び出してチェック
      const response = await this.chatWithTools(messages, base.state)

      // result ツールの呼び出しを探す
      const resultCall = response.toolCalls.find((tc) => tc.name === 'result')

      if (resultCall) {
        const result = await this.executeToolCall(
          'result',
          resultCall.args as Record<string, unknown>
        )
        const checkResult = result.result as QuickCheckResult

        this.logger.info('QuickCheck completed', {
          passed: checkResult.passed,
          issueCount: checkResult.issues?.length ?? 0,
        })

        return {
          responseText: response.text ?? '',
          toolCalls: [result],
          completion: { context: checkResult },
          usage: response.usage,
        }
      }

      // result ツールが呼ばれなかった場合、リマインダーを追加してリトライ
      this.logger.warn('QuickCheck did not call result tool, retrying', {
        attempt: attempt + 1,
        maxRetries: QuickCheckAgent.MAX_RETRIES,
      })

      // アシスタントの応答とリマインダーをメッセージに追加
      if (response.text) {
        messages.push({ role: 'assistant' as const, content: response.text })
      }
      messages.push({ role: 'user' as const, content: QuickCheckAgent.RESULT_TOOL_REMINDER })
    }

    // 最大リトライ回数を超えた場合はエラー
    this.logger.error('QuickCheck exceeded max retries without calling result tool')
    throw new Error('QuickCheck agent must call the result tool')
  }

  /**
   * 1ターンの実行（互換性のため残す）
   * @deprecated execute メソッドを使用してください
   */
  async executeTurn(
    context: QuickCheckContext,
    userMessage: string
  ): Promise<QuickCheckTurnResult> {
    // execute メソッドに委譲
    const result = await this.execute(
      {
        pendingQuestion: context.pendingQuestion.content,
        fieldId: context.pendingQuestion.fieldId,
        intent: context.pendingQuestion.intent,
        prohibitedTopics: context.prohibitedTopics,
        collectedFacts: context.collectedFacts,
      },
      {
        sessionId: context.sessionId,
        chatHistory: context.chatHistory,
        state: context.state,
      },
      userMessage
    )

    // QuickCheckTurnResult 形式に変換
    return {
      ...result,
      checkResult: result.completion?.context,
    }
  }
}
