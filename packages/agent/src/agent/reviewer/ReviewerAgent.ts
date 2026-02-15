import { BaseAgent } from '../base'
import { REVIEWER_SYSTEM_PROMPT, buildReviewPrompt } from './prompts'
import { reviewTool } from './tools'
import type { ReviewerArgs, ReviewerResult } from './definition'
import type { ReviewerContext, ReviewerTurnResult, ReviewResult } from './types'
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
 * Reviewer エージェント
 *
 * ユーザーの回答が十分かどうかをレビューする。
 * - 回答の完全性
 * - 必要なファクトの有無
 * - 情報の明確性
 */
export class ReviewerAgent
  extends BaseAgent<ReviewerContext, ReviewerTurnResult>
  implements ITypedAgent<ReviewerArgs, ReviewerResult>
{
  readonly type = 'reviewer' as const
  readonly tools: Tool[] = [reviewTool]

  protected readonly config: AgentConfig = {
    type: 'reviewer',
    systemPrompt: REVIEWER_SYSTEM_PROMPT,
    temperature: 1.0, // 判定は一貫性が重要なので低め
    maxOutputTokens: 800,
    model: 'gemini-3-flash-preview', // lite モデルは forceToolCall 非対応のため flash を使用
    forceToolCall: true, // 必ず review ツールを呼び出す
  }

  constructor(deps: BaseAgentDependencies) {
    super(deps)
  }

  /**
   * 残タスクを取得（Reviewer は review を返すまで完了しない）
   */
  protected getRemainingTasks(_state: AgentLanguageState): string[] {
    return ['Use the review tool to return your review verdict']
  }

  /**
   * 型安全な実行メソッド（ITypedAgent インターフェース）
   *
   * @param args ReviewerArgs - 型安全な引数
   * @param base AgentBaseInput - 共通の基本入力
   * @param _userMessage ユーザーメッセージ（未使用）
   */
  async execute(
    args: ReviewerArgs,
    base: AgentBaseInput,
    _userMessage: string
  ): Promise<TypedTurnResult<ReviewerResult>> {
    this.logger.info('Starting Reviewer', {
      fieldId: args.fieldId,
      answerLength: args.userAnswer.length,
    })

    // レビュー用プロンプトを構築
    const reviewPrompt = buildReviewPrompt({
      fieldId: args.fieldId,
      label: args.label,
      intent: args.intent,
      required: args.required,
      requiredFacts: args.requiredFacts,
      userAnswer: args.userAnswer,
      questionType: args.questionType,
      followUpCount: args.followUpCount,
    })

    // メッセージを構築（ユーザーメッセージとしてレビュー対象を送信）
    const messages = [...base.chatHistory, { role: 'user' as const, content: reviewPrompt }]

    // リトライ設定
    const maxRetries = 2
    let lastResponse: Awaited<ReturnType<typeof this.chatWithTools>> | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // リトライの場合は前回のアシスタント応答とリマインダーを追加
      if (attempt > 0 && lastResponse) {
        this.logger.debug('Retrying review tool call', { attempt, maxRetries })

        // 前回のアシスタントの応答を追加
        if (lastResponse.text) {
          messages.push({ role: 'assistant' as const, content: lastResponse.text })
        }

        // リトライ用のリマインダーメッセージを追加
        messages.push({
          role: 'user' as const,
          content: this.buildRetryPrompt(attempt, args.userAnswer),
        })
      }

      // LLM を呼び出してレビュー
      const response = await this.chatWithTools(messages, base.state)
      lastResponse = response

      // review ツールの呼び出しを探す
      const reviewCall = response.toolCalls.find((tc) => tc.name === 'review')

      if (reviewCall) {
        const result = await this.executeToolCall(
          'review',
          reviewCall.args as Record<string, unknown>
        )
        const reviewResult = result.result as ReviewerResult

        this.logger.info('Reviewer completed', {
          passed: reviewResult.passed,
          missingFactCount: reviewResult.missingFacts?.length ?? 0,
          extractedFactCount: reviewResult.extractedFacts?.length ?? 0,
          retryAttempt: attempt,
        })

        return {
          responseText: reviewResult.feedback ?? '',
          toolCalls: [result],
          completion: { context: reviewResult },
          usage: response.usage,
        }
      }

      // 最終試行でなければリトライ
      if (attempt < maxRetries) {
        this.logger.warn('Reviewer did not call review tool, retrying', {
          attempt: attempt + 1,
          maxRetries,
          hasText: !!response.text,
        })
      }
    }

    // すべてのリトライが失敗
    this.logger.error('Reviewer did not call review tool after retries', { maxRetries })
    throw new Error('Reviewer agent must call the review tool')
  }

  /**
   * 1ターンの実行（互換性のため残す）
   * @deprecated execute メソッドを使用してください
   */
  async executeTurn(context: ReviewerContext, userMessage: string): Promise<ReviewerTurnResult> {
    // execute メソッドに委譲
    const result = await this.execute(
      {
        fieldId: context.currentField.fieldId,
        label: context.currentField.label,
        intent: context.currentField.intent,
        required: context.currentField.required,
        requiredFacts: context.currentField.requiredFacts,
        userAnswer: context.collectedAnswer,
        questionType: context.currentField.questionType,
        followUpCount: context.currentField.followUpCount,
      },
      {
        sessionId: context.sessionId,
        chatHistory: context.chatHistory,
        state: context.state,
      },
      userMessage
    )

    // ReviewerTurnResult 形式に変換
    return {
      ...result,
      reviewResult: result.completion?.context as ReviewResult | undefined,
    }
  }

  /**
   * リトライ用のプロンプトを構築
   */
  private buildRetryPrompt(attempt: number, userAnswer: string): string {
    const parts: string[] = []

    parts.push(`## Important Reminder`)
    parts.push(``)
    parts.push(
      `You MUST use the 'review' tool to return your verdict. Do not respond with text only.`
    )
    parts.push(``)

    if (attempt === 1) {
      // 1回目のリトライ: ユーザーの回答に質問が含まれている場合への対応を促す
      parts.push(`## Handling Non-Standard Responses`)
      parts.push(``)
      parts.push(`The user's response was: "${userAnswer}"`)
      parts.push(``)
      parts.push(`Even if the user's response is:`)
      parts.push(`- A question instead of an answer (e.g., "ポートフォリオないんだけど大丈夫？")`)
      parts.push(`- An expression of uncertainty (e.g., "わからない", "特にない")`)
      parts.push(`- A refusal to answer (e.g., "答えたくない")`)
      parts.push(`- Incomplete or unclear`)
      parts.push(``)
      parts.push(`You MUST still use the 'review' tool with:`)
      parts.push(`- passed: false`)
      parts.push(
        `- feedback: A helpful message explaining what is needed or acknowledging their concern`
      )
      parts.push(`- missingFacts: List what information is still needed`)
      parts.push(``)
    } else {
      // 2回目のリトライ: より強く指示
      parts.push(`## CRITICAL: Tool Call Required`)
      parts.push(``)
      parts.push(`This is your final attempt. You MUST call the 'review' tool now.`)
      parts.push(``)
      parts.push(`If you cannot make a determination, use:`)
      parts.push(`{`)
      parts.push(`  "passed": false,`)
      parts.push(
        `  "feedback": "申し訳ございません。ご回答を確認させてください。もう少し詳しく教えていただけますか？",`
      )
      parts.push(`  "missingFacts": ["回答内容の確認"]`)
      parts.push(`}`)
      parts.push(``)
    }

    parts.push(`Call the 'review' tool now.`)

    return parts.join('\n')
  }
}
