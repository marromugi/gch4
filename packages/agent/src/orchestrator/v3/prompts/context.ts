import type {
  OrchestratorV3SessionState,
  QuickCheckFeedback,
  ReviewerFeedback,
  AuditorFeedback,
  Plan,
  PlanField,
} from '../types'

/**
 * コンテキストプロンプトを構築
 *
 * 現在の状態に応じて、LLM に次のアクションを指示するプロンプトを生成する。
 * これはユーザープロンプトとして送信され、システムプロンプトと組み合わせて使用される。
 */
export function buildContextPrompt(state: OrchestratorV3SessionState): string {
  const parts: string[] = ['## Current Context']

  // ステージ別の指示を追加
  switch (state.stage) {
    case 'BOOTSTRAP':
      parts.push(buildBootstrapContext(state))
      break
    case 'INTERVIEW_LOOP':
      parts.push(buildInterviewContext(state))
      break
    case 'FINAL_AUDIT':
      parts.push(buildAuditContext(state))
      break
    case 'COMPLETED':
      parts.push(buildCompletedContext())
      break
  }

  // QuickCheck のフィードバックがあれば追加
  if (state.lastQuickCheckResult && !state.lastQuickCheckResult.passed) {
    parts.push(buildQuickCheckFeedback(state.lastQuickCheckResult))
  }

  // Reviewer のフィードバックがあれば追加
  if (state.lastReviewerResult && !state.lastReviewerResult.passed) {
    parts.push(buildReviewerFeedback(state.lastReviewerResult))
  }

  // Auditor のフィードバックがあれば追加
  if (state.lastAuditorResult && !state.lastAuditorResult.passed) {
    parts.push(buildAuditorFeedback(state.lastAuditorResult))
  }

  return parts.join('\n\n')
}

/**
 * 言語別の「〇〇語のまま進める」ラベル
 */
const CONTINUE_LABELS: Record<string, string> = {
  ja: '日本語のまま進める',
  en: 'Continue in English',
  zh: '继续使用中文',
  ko: '한국어로 계속하기',
  es: 'Continuar en español',
  fr: 'Continuer en français',
  de: 'Weiter auf Deutsch',
  pt: 'Continuar em português',
  it: 'Continua in italiano',
  ru: 'Продолжить на русском',
  ar: 'المتابعة بالعربية',
  hi: 'हिंदी में जारी रखें',
  th: 'ดำเนินการต่อเป็นภาษาไทย',
  vi: 'Tiếp tục bằng tiếng Việt',
}

/**
 * 言語別の「他の言語で話す」ラベル
 */
const OTHER_LABELS: Record<string, string> = {
  ja: '他の言語で話す',
  en: 'Use another language',
  zh: '使用其他语言',
  ko: '다른 언어 사용하기',
  es: 'Usar otro idioma',
  fr: 'Utiliser une autre langue',
  de: 'Andere Sprache verwenden',
  pt: 'Usar outro idioma',
  it: "Usa un'altra lingua",
  ru: 'Использовать другой язык',
  ar: 'استخدام لغة أخرى',
  hi: 'दूसरी भाषा का उपयोग करें',
  th: 'ใช้ภาษาอื่น',
  vi: 'Sử dụng ngôn ngữ khác',
}

/**
 * BOOTSTRAP ステージのコンテキストを構築
 */
function buildBootstrapContext(state: OrchestratorV3SessionState): string {
  const lang = state.bootstrap.language

  // 言語が設定済みで確認済みの場合 → インタビュー開始準備完了
  if (lang && state.bootstrap.languageConfirmed === true) {
    return `### Status
All bootstrap information collected. Ready to proceed to interview.

### Next Action
Greet the user and let them know you're ready to start the interview.`
  }

  // 言語入力待ち状態（「他の言語で話す」を選択後）→ set_language ツールで言語を設定
  if (state.bootstrap.waitingForLanguageInput) {
    return `### Status
User wants to use a different language. They have provided their language preference in the last message.

### Next Action
Use the 'set_language' tool to set the conversation language based on the user's input.

- Analyze what language the user requested
- If it's a supported language (ja, en, zh, ko, es, fr, de, pt, it, ru, ar, hi, th, vi), set languageCode to that code and isSupported to true
- If it's NOT a supported language, set isSupported to false and choose the closest supported language (default to 'en' if unsure)

Supported languages:
- ja (Japanese), en (English), zh (Chinese), ko (Korean)
- es (Spanish), fr (French), de (German), pt (Portuguese)
- it (Italian), ru (Russian), ar (Arabic), hi (Hindi)
- th (Thai), vi (Vietnamese)`
  }

  // 言語が設定済みだが未確認の場合（ブラウザ言語から自動設定）→ ask_options で確認
  if (lang && state.bootstrap.languageConfirmed === false) {
    const continueLabel = CONTINUE_LABELS[lang] ?? CONTINUE_LABELS.en
    const otherLabel = OTHER_LABELS[lang] ?? OTHER_LABELS.en

    const options = [
      { id: 'continue', label: continueLabel },
      { id: 'other', label: otherLabel },
    ]

    return `### Status
Language detected from browser settings: ${lang}

### Next Action
Use the 'ask_options' tool to confirm the language preference.

Tool parameters:
- options: ${JSON.stringify(options)}
- selectionType: "radio"

Message guidelines:
- Write a brief, friendly greeting in ${lang}
- You may naturally mention that you detected their language preference
- Keep it warm and welcoming
- Generate the message yourself - do NOT use a fixed template`
  }

  // 言語が未設定の場合 → ask_options で言語を問う
  const defaultOptions = [
    { id: 'continue', label: 'English' },
    { id: 'other', label: 'Other language' },
  ]

  return `### Status
Collecting initial information from user.

### Next Action
Use the 'ask_options' tool to ask which language the user prefers.

Tool parameters:
- options: ${JSON.stringify(defaultOptions)}
- selectionType: "radio"

Message guidelines:
- Write a brief, friendly greeting
- Ask which language they prefer to use
- Generate the message yourself - do NOT use a fixed template`
}

/**
 * INTERVIEW_LOOP ステージのコンテキストを構築
 */
function buildInterviewContext(state: OrchestratorV3SessionState): string {
  const plan = state.plan as Plan | undefined
  const fields = plan?.fields ?? []
  const totalFields = fields.length
  const completedCount = Object.keys(state.collectedFields).length
  const currentField = fields[state.currentFieldIndex] as PlanField | undefined

  // 全フィールド完了の場合
  if (!currentField || state.currentFieldIndex >= totalFields) {
    return `### Status
All fields have been collected!

### Progress
- Completed: ${completedCount}/${totalFields} fields

### Next Action
Prepare for final audit. Let the user know you're reviewing their responses.`
  }

  // 現在のフィールドの情報
  const fieldInfo = buildFieldInfo(currentField)

  // フォローアップ中かどうか
  const isFollowUp = state.followUpCount > 0

  // Progressive Questioning セクション（abstract タイプの場合）
  const progressiveSection = buildProgressiveQuestioningSection(currentField, isFollowUp)

  return `### Status
${isFollowUp ? 'Following up on previous question' : 'Ready to ask about next field'}

### Progress
- Completed: ${completedCount}/${totalFields} fields
- Current: "${currentField.label}" (${currentField.fieldId})
- Follow-up count: ${state.followUpCount}

${fieldInfo}
${progressiveSection}

### Next Action
${
  isFollowUp
    ? `The user's previous answer was incomplete. Ask a follow-up question to gather more information about: ${currentField.label}`
    : `Ask the user about: "${currentField.label}"\nIntent: ${currentField.intent}`
}

${currentField.suggestedQuestion ? `Suggested question: "${currentField.suggestedQuestion}"` : ''}

Remember:
- Be conversational and friendly
- Ask only ONE question
- Keep it simple and easy to answer
- Always use 'ask_options' by default (users can still type free-form text)
- Use 'ask' only when you have no options to suggest at all`
}

/**
 * Progressive Questioning セクションを構築（abstract フィールド用）
 */
function buildProgressiveQuestioningSection(field: PlanField, isFollowUp: boolean): string {
  // abstract タイプかつ requiredFacts が2つ以上ある場合のみ適用
  if (
    field.questionType !== 'abstract' ||
    !field.requiredFacts ||
    field.requiredFacts.length <= 1
  ) {
    return ''
  }

  const parts: string[] = ['', '### Progressive Questioning (Abstract Field)']
  parts.push('This field requires collecting multiple facts. Ask about them ONE AT A TIME.')
  parts.push('')
  parts.push('Facts to collect progressively:')
  field.requiredFacts.forEach((fact, index) => {
    parts.push(`  ${index + 1}. ${fact}`)
  })
  parts.push('')
  parts.push('Strategy:')
  if (isFollowUp) {
    parts.push('- You are following up. Focus on the NEXT uncollected fact.')
  } else {
    parts.push('- This is the FIRST question for this field. Ask about fact #1 only.')
  }
  parts.push('- Use natural conversation transitions between facts')
  parts.push('- NEVER ask about all facts in a single question')

  return parts.join('\n')
}

/**
 * フィールド情報を構築
 */
function buildFieldInfo(field: PlanField): string {
  const parts: string[] = ['### Field Details']
  parts.push(`- ID: ${field.fieldId}`)
  parts.push(`- Label: ${field.label}`)
  parts.push(`- Intent: ${field.intent}`)
  parts.push(`- Required: ${field.required ? 'Yes' : 'No'}`)
  parts.push(`- Type: ${field.questionType}`)

  if (field.requiredFacts && field.requiredFacts.length > 0) {
    const hint =
      field.questionType === 'abstract' && field.requiredFacts.length > 1 ? ' (one at a time)' : ''
    parts.push(`- Facts to collect${hint}:`)
    field.requiredFacts.forEach((fact, index) => {
      parts.push(`  ${index + 1}. ${fact}`)
    })
  }

  return parts.join('\n')
}

/**
 * FINAL_AUDIT ステージのコンテキストを構築
 */
function buildAuditContext(state: OrchestratorV3SessionState): string {
  const plan = state.plan as Plan | undefined
  const totalFields = plan?.fields.length ?? 0
  const completedCount = Object.keys(state.collectedFields).length

  // Auditor が失格した場合は、問題解決を促す指示を出す
  if (state.lastAuditorResult && !state.lastAuditorResult.passed) {
    return `### Status
Final audit FAILED. Issues must be resolved before completion.

### Progress
- Completed: ${completedCount}/${totalFields} fields

### Next Action
⚠️ CRITICAL: DO NOT say the interview is complete or thank the user for completing.
The audit has identified issues that MUST be addressed first.

You MUST:
1. Acknowledge the issue found by the auditor (see feedback below)
2. Ask the user a follow-up question to gather missing or clarify information
3. Use 'ask' or 'ask_options' tool to ask the question

You MUST NOT:
- Say "完了しました", "ありがとうございました", or any completion message
- Imply that the interview is finished
- Skip asking a follow-up question`
  }

  return `### Status
Final audit in progress.

### Progress
- Completed: ${completedCount}/${totalFields} fields

### Next Action
Wait for audit results. If the audit passes, thank the user and conclude the interview.
If there are issues, address them as instructed.`
}

/**
 * COMPLETED ステージのコンテキストを構築
 */
function buildCompletedContext(): string {
  return `### Status
Interview completed successfully!

### Next Action
Thank the user for their time and let them know the interview is complete.`
}

/**
 * QuickCheck フィードバックを構築
 */
function buildQuickCheckFeedback(result: QuickCheckFeedback): string {
  const parts: string[] = ['### ⚠️ Question Revision Required']
  parts.push('Your previous question was flagged for the following issues:')

  if (result.issues && result.issues.length > 0) {
    result.issues.forEach((issue) => {
      parts.push(`- ${issue}`)
    })
  }

  if (result.suggestion) {
    parts.push(`\nSuggested revision: "${result.suggestion}"`)
  }

  parts.push('\nPlease revise your question and try again.')

  return parts.join('\n')
}

/**
 * Reviewer フィードバックを構築
 */
function buildReviewerFeedback(result: ReviewerFeedback): string {
  const parts: string[] = ["### ⚠️ User's Answer Needs More Information"]

  if (result.feedback) {
    parts.push(`Feedback: ${result.feedback}`)
  }

  if (result.missingFacts && result.missingFacts.length > 0) {
    parts.push('\nMissing information:')
    result.missingFacts.forEach((fact) => {
      parts.push(`- ${fact}`)
    })
  }

  parts.push('\nPlease ask a follow-up question to gather the missing information.')
  parts.push('Be specific about what you need, but keep the tone friendly.')

  return parts.join('\n')
}

/**
 * Auditor フィードバックを構築
 */
function buildAuditorFeedback(result: AuditorFeedback): string {
  const parts: string[] = ['### ⚠️ Audit Issues Found']

  if (result.issues && result.issues.length > 0) {
    parts.push('Issues:')
    result.issues.forEach((issue) => {
      parts.push(`- ${issue}`)
    })
  }

  if (result.recommendations && result.recommendations.length > 0) {
    parts.push('\nRecommendations:')
    result.recommendations.forEach((rec) => {
      parts.push(`- ${rec}`)
    })
  }

  parts.push('\nPlease address these issues before completing the interview.')

  return parts.join('\n')
}
