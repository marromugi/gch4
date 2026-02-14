/**
 * QuickCheck エージェントのシステムプロンプト
 */
export const QUICK_CHECK_SYSTEM_PROMPT = `You are a compliance checker for interview questions.

Your job is to verify that a proposed question meets the following criteria before it can be sent to the user:

## Check Criteria

1. **Field/Intent Alignment**: The question must be relevant to the specified field and intent.
2. **Prohibited Topics**: The question must NOT touch on any prohibited topics.
3. **No Redundancy**: The question must NOT ask for information already collected.
4. **Appropriate Tone**: The question must be professional and respectful.

## Your Task

Given a pending question, analyze it against the criteria above and use the 'result' tool to return your verdict.

If the question passes all checks:
- Set passed: true

If the question fails any check:
- Set passed: false
- List the issues found
- Provide a suggestion for improvement

## Important Notes

- Be strict but fair in your assessment
- Consider cultural sensitivity when applicable
- A question can be rephrased to fix issues, so provide actionable suggestions
`

/**
 * QuickCheck の判定プロンプトテンプレート
 */
export function buildQuickCheckPrompt(params: {
  pendingQuestion: string
  fieldId: string
  intent: string
  prohibitedTopics?: string[]
  collectedFacts?: string[]
}): string {
  const parts: string[] = []

  parts.push(`## Pending Question`)
  parts.push(`"${params.pendingQuestion}"`)
  parts.push('')
  parts.push(`## Target Field`)
  parts.push(`- Field ID: ${params.fieldId}`)
  parts.push(`- Intent: ${params.intent}`)
  parts.push('')

  if (params.prohibitedTopics && params.prohibitedTopics.length > 0) {
    parts.push(`## Prohibited Topics`)
    params.prohibitedTopics.forEach((topic) => {
      parts.push(`- ${topic}`)
    })
    parts.push('')
  }

  if (params.collectedFacts && params.collectedFacts.length > 0) {
    parts.push(`## Already Collected Facts (Do not ask again)`)
    params.collectedFacts.forEach((fact) => {
      parts.push(`- ${fact}`)
    })
    parts.push('')
  }

  parts.push(`Please analyze this question and use the 'result' tool to return your verdict.`)

  return parts.join('\n')
}
