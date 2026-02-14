import { z } from 'zod'
import { InterviewerAgent } from './InterviewerAgent'
import { INTERVIEWER_SYSTEM_PROMPT, buildInterviewerPrompt } from './prompts'
import { deriveInterviewerStage } from './types'
import type { Plan } from './types'
import type { AgentDefinition } from '../../registry/types'

/**
 * Interviewer の引数スキーマ
 * 引数なし（状態は state から取得）
 */
export const interviewerArgsSchema = z.object({})

/**
 * Interviewer の結果スキーマ
 * Interviewer は subtask を呼び出すか ask を呼び出すだけなので、
 * 明示的な結果スキーマは不要。interview_complete で終了。
 */
export const interviewerResultSchema = z.object({
  allFieldsCompleted: z.boolean().describe('すべてのフィールドが完了したか'),
})

export type InterviewerArgs = z.infer<typeof interviewerArgsSchema>
export type InterviewerResult = z.infer<typeof interviewerResultSchema>

/**
 * Interviewer エージェント定義
 */
export const interviewerDefinition: AgentDefinition<
  typeof interviewerArgsSchema,
  typeof interviewerResultSchema
> = {
  type: 'interviewer',
  argsSchema: interviewerArgsSchema,
  resultSchema: interviewerResultSchema,

  buildSystemPrompt: (_, state) => {
    const plan = state.plan as Plan | undefined
    if (!plan) {
      return INTERVIEWER_SYSTEM_PROMPT
    }

    const stage = deriveInterviewerStage({
      plan,
      fieldIndex: state.currentFieldIndex ?? 0,
      quickCheckPassed: state.quickCheckPassed,
      quickCheckFeedback: state.quickCheckFeedback,
      reviewerFeedback: state.reviewerFeedback,
      hasUserResponse: state.awaitingReview,
    })

    const contextPrompt = buildInterviewerPrompt({
      stage,
      plan,
      currentFieldIndex: state.currentFieldIndex ?? 0,
      collectedFields: state.collectedFields ?? {},
      quickCheckPassed: state.quickCheckPassed,
    })

    return `${INTERVIEWER_SYSTEM_PROMPT}\n\n${contextPrompt}`
  },

  buildInitialMessage: () => ({
    role: 'user',
    content: 'Please start the interview by asking the first question from the plan.',
  }),

  createAgent: (deps) => new InterviewerAgent(deps),

  isSubtaskable: false,
}
