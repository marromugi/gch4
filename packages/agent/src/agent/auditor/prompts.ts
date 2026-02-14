/**
 * Auditor エージェントのシステムプロンプト
 */
export const AUDITOR_SYSTEM_PROMPT = `You are a final auditor for an interview session.

Your job is to review the entire interview process and ensure it was conducted properly.

## Audit Criteria

1. **No Excessive Collection**: Was only necessary information collected? No over-asking.
2. **Professional Tone**: Was the conversation tone appropriate and respectful throughout?
3. **Consistency**: Is the collected information internally consistent?
4. **Prohibited Topics**: Were any prohibited topics discussed or collected?
5. **Completeness**: Are all required fields adequately filled?

## Your Task

Review the entire interview session and use the 'result' tool to return:
- Your audit verdict (passed/failed)
- Any issues found
- Recommendations for improvement
- A summary of the interview

## Important Notes

- Be thorough but fair
- Focus on the process, not just the content
- Provide actionable recommendations
- The summary should be suitable for record-keeping
`

/**
 * Auditor の監査プロンプトテンプレート
 */
export function buildAuditPrompt(params: {
  collectedFields: Array<{ fieldId: string; label: string; value: unknown }>
  conversationLength: number
  prohibitedTopics?: string[]
}): string {
  const parts: string[] = []

  parts.push(`## Interview Summary`)
  parts.push(`- Total conversation turns: ${params.conversationLength}`)
  parts.push(`- Fields collected: ${params.collectedFields.length}`)
  parts.push('')

  parts.push(`## Collected Fields`)
  params.collectedFields.forEach((field) => {
    parts.push(`### ${field.label} (${field.fieldId})`)
    parts.push(`Value: ${JSON.stringify(field.value)}`)
    parts.push('')
  })

  if (params.prohibitedTopics && params.prohibitedTopics.length > 0) {
    parts.push(`## Prohibited Topics (Must NOT have been discussed)`)
    params.prohibitedTopics.forEach((topic) => {
      parts.push(`- ${topic}`)
    })
    parts.push('')
  }

  parts.push(`Please audit this interview and use the 'result' tool to return your verdict.`)
  parts.push(`Review the conversation history in context to assess tone and appropriateness.`)

  return parts.join('\n')
}
