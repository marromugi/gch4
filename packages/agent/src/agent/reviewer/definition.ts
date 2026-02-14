import { z } from 'zod'
import { REVIEWER_SYSTEM_PROMPT, buildReviewPrompt } from './prompts'
import { ReviewerAgent } from './ReviewerAgent'
import { QuestionTypeSchema } from '../architect/schemas'
import type { AgentDefinition } from '../../registry/types'
import type { Plan } from '../architect/schemas'

/**
 * Reviewer の引数スキーマ
 */
export const reviewerArgsSchema = z.object({
  fieldId: z.string().describe('対象フィールドID'),
  label: z.string().describe('フィールドのラベル'),
  intent: z.string().describe('フィールドの意図'),
  required: z.boolean().describe('必須フィールドかどうか'),
  requiredFacts: z.array(z.string()).optional().describe('必要なファクト'),
  userAnswer: z.string().describe('ユーザーの回答'),
  questionType: QuestionTypeSchema.optional().describe('質問タイプ (basic/abstract)'),
  followUpCount: z.number().optional().describe('このフィールドに対するフォローアップ回数'),
})

/**
 * Reviewer の結果スキーマ
 */
export const reviewerResultSchema = z.object({
  passed: z.boolean().describe('レビュー通過フラグ'),
  feedback: z.string().optional().describe('フィードバック（不合格の場合）'),
  missingFacts: z.array(z.string()).optional().describe('不足しているファクト'),
  extractedFacts: z.array(z.string()).optional().describe('抽出されたファクト'),
})

export type ReviewerArgs = z.infer<typeof reviewerArgsSchema>
export type ReviewerResult = z.infer<typeof reviewerResultSchema>

/**
 * Reviewer エージェント定義
 */
export const reviewerDefinition: AgentDefinition<
  typeof reviewerArgsSchema,
  typeof reviewerResultSchema
> = {
  type: 'reviewer',
  argsSchema: reviewerArgsSchema,
  resultSchema: reviewerResultSchema,

  buildSystemPrompt: (args) => {
    const contextPrompt = buildReviewPrompt({
      fieldId: args.fieldId,
      label: args.label,
      intent: args.intent,
      required: args.required,
      requiredFacts: args.requiredFacts,
      userAnswer: args.userAnswer,
      questionType: args.questionType,
      followUpCount: args.followUpCount,
    })

    return `${REVIEWER_SYSTEM_PROMPT}\n\n${contextPrompt}`
  },

  buildInitialMessage: (args) => ({
    role: 'user',
    content: `Please review the user's answer:
"${args.userAnswer}"

For field: ${args.label} (${args.fieldId})
Intent: ${args.intent}

Use the 'review' tool to return your verdict.`,
  }),

  createAgent: (deps) => new ReviewerAgent(deps),

  isSubtaskable: true,

  initArgs: (mainSession, _context) => {
    const plan = mainSession.plan as Plan | undefined
    const field = plan?.fields[mainSession.currentFieldIndex]

    if (!field) {
      throw new Error('Cannot start reviewer without current field')
    }

    // 最後のユーザーメッセージを取得
    const userMessages = mainSession.messages.filter((m) => m.role === 'user')
    const lastUserMessage = userMessages[userMessages.length - 1]
    const userAnswer = lastUserMessage?.content ?? ''

    return {
      fieldId: field.fieldId,
      label: field.label,
      intent: field.intent,
      required: field.required,
      requiredFacts: field.requiredFacts,
      userAnswer,
      questionType: field.questionType,
      followUpCount: mainSession.followUpCount ?? 0,
    }
  },
}
