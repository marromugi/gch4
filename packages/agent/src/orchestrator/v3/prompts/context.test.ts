import { describe, it, expect } from 'vitest'
import { toFieldId } from '../../../store/types'
import { buildContextPrompt } from './context'
import type { OrchestratorV3SessionState, Plan, PlanField } from '../types'

/**
 * テスト用のセッション状態を作成
 */
function createTestSession(
  overrides: Partial<OrchestratorV3SessionState> = {}
): OrchestratorV3SessionState {
  return {
    sessionId: 'test-session-id',
    agentStack: [],
    messages: [],
    subSessionResults: {},
    bootstrap: {},
    form: {
      fields: [],
      facts: [],
    },
    currentFieldIndex: 0,
    collectedFields: {},
    followUpCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stage: 'BOOTSTRAP',
    orchestratorMessages: [],
    ...overrides,
  }
}

/**
 * テスト用のフィールドを作成
 */
function createTestField(overrides: Partial<PlanField> = {}): PlanField {
  return {
    fieldId: 'field-1',
    label: 'Test Field',
    intent: 'Understand test information',
    required: true,
    questionType: 'basic',
    questionTypeReason: 'Basic field for testing',
    requiredFacts: ['fact-1', 'fact-2'],
    suggestedQuestion: 'What is the test?',
    ...overrides,
  }
}

/**
 * テスト用のプランを作成
 */
function createTestPlan(fields: PlanField[]): Plan {
  return {
    fields,
    summary: 'Test plan for collecting information',
  }
}

describe('context prompt', () => {
  describe('buildContextPrompt', () => {
    describe('BOOTSTRAP ステージ', () => {
      it('言語が未設定の場合、言語確認の指示を含む', () => {
        const state = createTestSession({
          stage: 'BOOTSTRAP',
          bootstrap: {},
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('## Current Context')
        expect(prompt).toContain('language')
        expect(prompt).toContain('Not set')
      })

      it('言語が設定済みの場合、インタビュー準備完了のメッセージを含む', () => {
        const state = createTestSession({
          stage: 'BOOTSTRAP',
          bootstrap: { language: 'ja' },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('bootstrap information collected')
        expect(prompt).toContain('Ready to proceed')
      })
    })

    describe('INTERVIEW_LOOP ステージ', () => {
      it('現在のフィールドに関する情報を含む', () => {
        const field = createTestField({
          fieldId: 'field-experience',
          label: 'Work Experience',
          intent: 'Understand past work history',
        })
        const plan = createTestPlan([field])

        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          plan,
          currentFieldIndex: 0,
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Work Experience')
        expect(prompt).toContain('field-experience')
        expect(prompt).toContain('Understand past work history')
      })

      it('進捗状況を含む', () => {
        const fields = [
          createTestField({ fieldId: 'field-1', label: 'Field 1' }),
          createTestField({ fieldId: 'field-2', label: 'Field 2' }),
          createTestField({ fieldId: 'field-3', label: 'Field 3' }),
        ]
        const plan = createTestPlan(fields)

        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          plan,
          currentFieldIndex: 1,
          collectedFields: { [toFieldId('field-1')]: 'answer-1' },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Completed: 1/3')
        expect(prompt).toContain('Current: "Field 2"')
      })

      it('フォローアップ中の場合、フォローアップ情報を含む', () => {
        const field = createTestField({ label: 'Current Field' })
        const plan = createTestPlan([field])

        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          plan,
          currentFieldIndex: 0,
          followUpCount: 2,
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Following up')
        expect(prompt).toContain('Follow-up count: 2')
      })

      it('suggestedQuestion がある場合、それを含む', () => {
        const field = createTestField({
          suggestedQuestion: 'What is your favorite color?',
        })
        const plan = createTestPlan([field])

        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          plan,
          currentFieldIndex: 0,
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('What is your favorite color?')
      })

      it('requiredFacts がある場合、それを含む', () => {
        const field = createTestField({
          requiredFacts: ['Company name', 'Position held', 'Duration'],
        })
        const plan = createTestPlan([field])

        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          plan,
          currentFieldIndex: 0,
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Company name')
        expect(prompt).toContain('Position held')
        expect(prompt).toContain('Duration')
      })

      it('全フィールド完了時は監査準備メッセージを含む', () => {
        const fields = [createTestField({ fieldId: 'field-1' })]
        const plan = createTestPlan(fields)

        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          plan,
          currentFieldIndex: 1, // インデックスが fields.length を超えている
          collectedFields: { [toFieldId('field-1')]: 'answer' },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('All fields have been collected')
        expect(prompt).toContain('final audit')
      })
    })

    describe('FINAL_AUDIT ステージ', () => {
      it('監査中メッセージを含む', () => {
        const state = createTestSession({
          stage: 'FINAL_AUDIT',
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Final audit')
        expect(prompt).toContain('Wait for audit results')
      })

      it('進捗状況を含む', () => {
        const fields = [
          createTestField({ fieldId: 'field-1' }),
          createTestField({ fieldId: 'field-2' }),
        ]
        const plan = createTestPlan(fields)

        const state = createTestSession({
          stage: 'FINAL_AUDIT',
          plan,
          collectedFields: { [toFieldId('field-1')]: 'a', [toFieldId('field-2')]: 'b' },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Completed: 2/2')
      })
    })

    describe('COMPLETED ステージ', () => {
      it('完了メッセージを含む', () => {
        const state = createTestSession({
          stage: 'COMPLETED',
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Interview completed')
        expect(prompt).toContain('Thank the user')
      })
    })

    describe('QuickCheck フィードバック', () => {
      it('QuickCheck 失敗時、フィードバックを含む', () => {
        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          lastQuickCheckResult: {
            passed: false,
            issues: ['Question is too vague', 'Multiple questions in one'],
            suggestion: 'Please ask about one specific topic.',
          },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Question Revision Required')
        expect(prompt).toContain('Question is too vague')
        expect(prompt).toContain('Multiple questions in one')
        expect(prompt).toContain('Please ask about one specific topic.')
      })

      it('QuickCheck 成功時、フィードバックを含まない', () => {
        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          lastQuickCheckResult: {
            passed: true,
          },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).not.toContain('Question Revision Required')
      })
    })

    describe('Reviewer フィードバック', () => {
      it('Reviewer 失敗時、フィードバックを含む', () => {
        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          lastReviewerResult: {
            passed: false,
            feedback: 'The answer lacks specific details.',
            missingFacts: ['Company name', 'Duration of employment'],
          },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Needs More Information')
        expect(prompt).toContain('The answer lacks specific details.')
        expect(prompt).toContain('Company name')
        expect(prompt).toContain('Duration of employment')
        expect(prompt).toContain('follow-up question')
      })

      it('Reviewer 成功時、フィードバックを含まない', () => {
        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          lastReviewerResult: {
            passed: true,
            fieldValue: 'collected value',
          },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).not.toContain('Needs More Information')
      })
    })

    describe('Auditor フィードバック', () => {
      it('Auditor 失敗時、フィードバックを含む', () => {
        const state = createTestSession({
          stage: 'FINAL_AUDIT',
          lastAuditorResult: {
            passed: false,
            issues: ['Answer for field-1 is inconsistent with field-2'],
            recommendations: ['Please clarify the timeline'],
            summary: 'Some inconsistencies found',
          },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Audit Issues Found')
        expect(prompt).toContain('inconsistent with field-2')
        expect(prompt).toContain('Please clarify the timeline')
        expect(prompt).toContain('address these issues')
      })

      it('Auditor 成功時、フィードバックを含まない', () => {
        const state = createTestSession({
          stage: 'FINAL_AUDIT',
          lastAuditorResult: {
            passed: true,
            summary: 'All good',
          },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).not.toContain('Audit Issues Found')
      })
    })

    describe('複合ケース', () => {
      it('複数のフィードバックが同時に存在する場合、全て含む', () => {
        const state = createTestSession({
          stage: 'INTERVIEW_LOOP',
          lastQuickCheckResult: {
            passed: false,
            issues: ['QuickCheck issue'],
          },
          lastReviewerResult: {
            passed: false,
            feedback: 'Reviewer feedback',
          },
        })

        const prompt = buildContextPrompt(state)

        expect(prompt).toContain('Question Revision Required')
        expect(prompt).toContain('QuickCheck issue')
        expect(prompt).toContain('Needs More Information')
        expect(prompt).toContain('Reviewer feedback')
      })
    })

    describe('ネガティブテスト（設定済み時に未設定メッセージが含まれないこと）', () => {
      describe('BOOTSTRAP ステージ', () => {
        it('言語が設定済みの場合、ブートストラップ進行メッセージを含まない', () => {
          const state = createTestSession({
            stage: 'BOOTSTRAP',
            bootstrap: { language: 'ja' },
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).toContain('All bootstrap information collected')
          expect(prompt).not.toContain('Bootstrap Progress')
          expect(prompt).not.toContain('Language: Not set')
        })

        it('言語設定完了時、"Not set" を一切含まない', () => {
          const state = createTestSession({
            stage: 'BOOTSTRAP',
            bootstrap: {
              language: 'ja',
            },
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Not set')
        })

        it('言語設定完了時、収集指示メッセージを含まない', () => {
          const state = createTestSession({
            stage: 'BOOTSTRAP',
            bootstrap: {
              language: 'en',
            },
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Ask the user what language')
        })
      })

      describe('INTERVIEW_LOOP ステージ', () => {
        it('フォローアップでない場合、"Following up" を含まない', () => {
          const field = createTestField()
          const plan = createTestPlan([field])

          const state = createTestSession({
            stage: 'INTERVIEW_LOOP',
            plan,
            currentFieldIndex: 0,
            followUpCount: 0,
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Following up')
          expect(prompt).toContain('Ready to ask about next field')
        })

        it('suggestedQuestion がない場合、"Suggested question" を含まない', () => {
          const field = createTestField({
            suggestedQuestion: undefined,
          })
          const plan = createTestPlan([field])

          const state = createTestSession({
            stage: 'INTERVIEW_LOOP',
            plan,
            currentFieldIndex: 0,
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Suggested question:')
        })

        it('requiredFacts が空の場合、"Facts to collect" を含まない', () => {
          const field = createTestField({
            requiredFacts: [],
          })
          const plan = createTestPlan([field])

          const state = createTestSession({
            stage: 'INTERVIEW_LOOP',
            plan,
            currentFieldIndex: 0,
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Facts to collect')
        })

        it('未完了フィールドがある場合、"All fields have been collected" を含まない', () => {
          const fields = [
            createTestField({ fieldId: 'field-1' }),
            createTestField({ fieldId: 'field-2' }),
          ]
          const plan = createTestPlan(fields)

          const state = createTestSession({
            stage: 'INTERVIEW_LOOP',
            plan,
            currentFieldIndex: 0,
            collectedFields: {},
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('All fields have been collected')
        })
      })

      describe('ステージ間の排他性', () => {
        it('INTERVIEW_LOOP ステージでは BOOTSTRAP のコンテキストを含まない', () => {
          const field = createTestField()
          const plan = createTestPlan([field])

          const state = createTestSession({
            stage: 'INTERVIEW_LOOP',
            plan,
            bootstrap: { language: 'ja' },
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Collecting initial information')
          expect(prompt).not.toContain('Bootstrap Progress')
        })

        it('FINAL_AUDIT ステージでは INTERVIEW_LOOP の質問指示を含まない', () => {
          const state = createTestSession({
            stage: 'FINAL_AUDIT',
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Ask the user about')
          expect(prompt).not.toContain('Following up')
        })

        it('COMPLETED ステージでは監査指示を含まない', () => {
          const state = createTestSession({
            stage: 'COMPLETED',
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Wait for audit results')
          expect(prompt).not.toContain('Final audit in progress')
        })
      })

      describe('フィードバックの排他性', () => {
        it('lastQuickCheckResult が undefined の場合、QuickCheck フィードバックを含まない', () => {
          const state = createTestSession({
            stage: 'INTERVIEW_LOOP',
            lastQuickCheckResult: undefined,
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Question Revision Required')
          expect(prompt).not.toContain('revise your question')
        })

        it('lastReviewerResult が undefined の場合、Reviewer フィードバックを含まない', () => {
          const state = createTestSession({
            stage: 'INTERVIEW_LOOP',
            lastReviewerResult: undefined,
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Needs More Information')
          expect(prompt).not.toContain('Missing information')
        })

        it('lastAuditorResult が undefined の場合、Auditor フィードバックを含まない', () => {
          const state = createTestSession({
            stage: 'FINAL_AUDIT',
            lastAuditorResult: undefined,
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Audit Issues Found')
          expect(prompt).not.toContain('address these issues')
        })

        it('全フィードバックが passed=true の場合、エラーメッセージを含まない', () => {
          const state = createTestSession({
            stage: 'INTERVIEW_LOOP',
            lastQuickCheckResult: { passed: true },
            lastReviewerResult: { passed: true, fieldValue: 'value' },
            lastAuditorResult: { passed: true, summary: 'OK' },
          })

          const prompt = buildContextPrompt(state)

          expect(prompt).not.toContain('Question Revision Required')
          expect(prompt).not.toContain('Needs More Information')
          expect(prompt).not.toContain('Audit Issues Found')
          expect(prompt).not.toContain('⚠️')
        })
      })
    })
  })
})
