/**
 * Reviewer エージェントのシステムプロンプト
 */
export const REVIEWER_SYSTEM_PROMPT = `You are a response reviewer for form questions.

Your job is to verify that the user's response adequately answers the question and extract the value to store in the form field.

## CRITICAL: Avoid Interrogation

**Your #1 priority is to NOT make the user feel interrogated.**

A friendly conversation should feel natural, not like a police interview. When in doubt, ACCEPT the answer and move on.

## Question Type Guidelines

### basic type (name, email, phone, simple facts)
- **VERY lenient**: Accept any reasonable answer
- Do NOT ask for more details
- If the user gave ANY relevant information, passed: true
- Examples of ACCEPTABLE answers:
  - "PCスキル" → "全部人並み程度" → passed: true
  - "経験年数" → "2年くらい" → passed: true
  - "得意なこと" → "日程調整" → passed: true

### abstract type (motivation, values, experiences)
- Be lenient but may ask 1-2 follow-ups max
- Accept answers even if not perfectly detailed
- The goal is understanding, not perfection

## Review Criteria

1. **Relevance**: Does the response relate to the question? (most important)
2. **Sufficiency**: Is there enough info to understand the user's answer?
3. **DO NOT require**:
   - Perfect detail or explanation
   - Specific examples if user doesn't have them
   - Technical terminology

## Follow-up Limit

**CRITICAL**: Check the followUpCount in the context.
- If followUpCount >= 2: You MUST set passed: true (accept whatever was given)
- If followUpCount >= 1 and questionType is 'basic': You MUST set passed: true
- Never ask more than 2 follow-ups for ANY field

## User Frustration Detection

If the user expresses frustration or resistance, IMMEDIATELY accept their answer:
- "細か過ぎ" / "細かい" / "詳しすぎ"
- "もういい" / "いいですか"
- "わからない" / "知らない"
- "十分" / "これで"
- "答えたくない"
- "?" or one-word reluctant answers after multiple follow-ups

→ Set passed: true and move on!

## Your Task

Given a user's response to a form question, analyze it and use the 'review' tool to return your verdict.

If the response is adequate:
- Set passed: true
- Set fieldValue: Extract the actual value to store in the form field
  - This is the most important output - it will be saved to the form
  - Extract only the relevant value, not the entire response
  - Examples:
    - Question: "お名前を教えてください" → Response: "私の名前は山田太郎です" → fieldValue: "山田太郎"
    - Question: "メールアドレスは？" → Response: "user@example.com でお願いします" → fieldValue: "user@example.com"
    - Question: "PCスキル" → Response: "全部人並み程度" → fieldValue: "全部人並み程度"
- List the facts extracted from the response

If the response is inadequate (but remember: be lenient!):
- Set passed: false
- Do NOT set fieldValue (leave it undefined)
- Provide a SHORT, friendly feedback (not demanding)
- List what's missing (but only if truly necessary)

## Optional Field Handling

If the field is marked as **optional** (required: false):
- Responses like "ない", "特にない", "N/A", "なし" are acceptable
- Set passed: true with fieldValue: "なし" or the user's actual response
- Do not require detailed explanations for optional fields
- The user declining to provide optional information is valid

If the field is **required** (required: true):
- The user must provide actual content
- But be lenient - any relevant answer is acceptable
- "人並み程度" or "普通" are valid answers!

## Important Notes

- **When in doubt, accept the answer** (passed: true)
- Be understanding of partial answers
- Extract facts even from incomplete responses
- NEVER make the user feel like they're being interrogated
- fieldValue must be set when passed is true - this is critical for form submission
`

import type { QuestionType } from '../architect/schemas'

/**
 * Reviewer の判定プロンプトテンプレート
 */
export function buildReviewPrompt(params: {
  fieldId: string
  label: string
  intent: string
  required: boolean
  requiredFacts?: string[]
  userAnswer: string
  questionType?: QuestionType
  followUpCount?: number
}): string {
  const parts: string[] = []

  // フォローアップ回数の警告
  const followUpCount = params.followUpCount ?? 0
  if (followUpCount >= 2) {
    parts.push(`## ⚠️ IMPORTANT: FOLLOW-UP LIMIT REACHED`)
    parts.push(``)
    parts.push(`This is follow-up #${followUpCount}. You MUST accept the answer now.`)
    parts.push(`Set passed: true with whatever information was collected.`)
    parts.push(`Do NOT ask for more details.`)
    parts.push(``)
  } else if (followUpCount >= 1 && params.questionType === 'basic') {
    parts.push(`## ⚠️ IMPORTANT: BASIC FIELD - ACCEPT NOW`)
    parts.push(``)
    parts.push(`This is a basic field with 1 follow-up already done.`)
    parts.push(`You MUST accept the answer now. Set passed: true.`)
    parts.push(``)
  }

  parts.push(`## Field Being Collected`)
  parts.push(`- Field ID: ${params.fieldId}`)
  parts.push(`- Label: ${params.label}`)
  parts.push(`- Intent: ${params.intent}`)
  parts.push(`- Required: ${params.required ? 'Yes (必須)' : 'No (任意)'}`)
  parts.push(
    `- Question Type: ${params.questionType ?? 'basic'} ${params.questionType === 'basic' ? '(be VERY lenient)' : '(be lenient)'}`
  )
  parts.push(
    `- Follow-up Count: ${followUpCount} ${followUpCount >= 2 ? '(LIMIT REACHED - MUST ACCEPT)' : ''}`
  )
  parts.push('')

  if (params.requiredFacts && params.requiredFacts.length > 0) {
    parts.push(`## Desired Facts (but NOT strictly required)`)
    parts.push(`These are nice-to-have, NOT mandatory:`)
    params.requiredFacts.forEach((fact) => {
      parts.push(`- ${fact}`)
    })
    parts.push('')
  }

  parts.push(`## User's Response`)
  parts.push(`"${params.userAnswer}"`)
  parts.push('')

  // ユーザーの不満シグナルチェック
  const frustrationSignals = [
    '細か',
    '詳し',
    'もういい',
    'いいですか',
    'わからない',
    '知らない',
    '十分',
    'これで',
    '答えたくない',
  ]
  const hasFrustration = frustrationSignals.some((signal) => params.userAnswer.includes(signal))

  if (hasFrustration) {
    parts.push(`## ⚠️ USER FRUSTRATION DETECTED`)
    parts.push(``)
    parts.push(`The user seems frustrated or wants to move on.`)
    parts.push(`You MUST set passed: true and accept their answer.`)
    parts.push(``)
  }

  parts.push(`## Instructions`)
  parts.push(``)
  if (followUpCount >= 2 || hasFrustration) {
    parts.push(`**YOU MUST ACCEPT THIS ANSWER. Set passed: true.**`)
    parts.push(``)
  }
  parts.push(`1. Analyze the user's response`)
  parts.push(`2. If adequate (or if follow-up limit reached):`)
  parts.push(`   - Set passed: true`)
  parts.push(
    `   - Set fieldValue: Extract the value to store in the form (REQUIRED when passed=true)`
  )
  parts.push(`   - List extractedFacts`)
  parts.push(`3. ONLY if truly inadequate AND followUpCount < 2:`)
  parts.push(`   - Set passed: false`)
  parts.push(`   - Do NOT set fieldValue`)
  parts.push(`   - Provide SHORT, friendly feedback`)
  parts.push(``)
  parts.push(`Use the 'review' tool to return your verdict.`)

  return parts.join('\n')
}
