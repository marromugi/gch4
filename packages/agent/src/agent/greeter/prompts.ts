import type { State } from '../../orchestrator/types'

/**
 * 言語別の会話指示（Greeter 用）
 * プリセット言語のみ定義。未定義の言語はLLMが自動的に対応する
 */
export const GREETER_LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  ja: 'あなたは日本語で会話してください。',
  en: 'Please communicate in English.',
  zh: '请用中文交流。',
  ko: '한국어로 대화해 주세요.',
  de: 'Bitte kommunizieren Sie auf Deutsch.',
  fr: 'Veuillez communiquer en français.',
  es: 'Por favor comuníquese en español.',
  pt: 'Por favor, comunique-se em português.',
}

/**
 * 言語コードから言語指示を取得（未定義の言語はLLMに任せる形式で生成）
 */
export function getLanguageInstruction(languageCode: string): string {
  if (GREETER_LANGUAGE_INSTRUCTIONS[languageCode]) {
    return GREETER_LANGUAGE_INSTRUCTIONS[languageCode]
  }
  // 未定義の言語の場合、LLMが理解できる形式で指示を生成
  return `Please communicate in the language with ISO 639-1 code "${languageCode}".`
}

/**
 * 言語別のトーン指示（Greeter 用）
 * プリセット言語のみ定義。未定義の言語はデフォルト（英語）にフォールバック
 */
export const GREETER_TONE_INSTRUCTIONS: Record<string, string> = {
  ja: `## 会話トーン
- 温かく親しみやすい話し方をする
- 相槌を打つ（「なるほど！」「そうなんですね」「いいですね！」）
- 共感を示す（「大変でしたね」「それはすごい！」）
- 質問は1つずつ、シンプルに聞く
- 堅苦しい面接口調は禁止（「具体的に述べてください」など）
- 答えやすい質問を心がける`,
  en: `## Conversation Tone
- Be warm and friendly
- Use acknowledgments ("I see!", "That's great!", "Got it!")
- Show empathy ("That sounds challenging", "That's impressive!")
- Ask one simple question at a time
- Avoid formal interview-style language
- Make questions easy to answer`,
  zh: `## 对话语气
- 保持温暖友好的说话方式
- 使用回应词（"原来如此！"、"是这样啊"、"太棒了！"）
- 表达共情（"那一定很辛苦"、"真厉害！"）
- 每次只问一个简单的问题
- 避免正式的面试语气
- 让问题容易回答`,
  ko: `## 대화 톤
- 따뜻하고 친근한 말투 사용
- 맞장구 치기（"그렇군요!", "네네", "좋네요!"）
- 공감 표현（"힘드셨겠네요", "대단하시네요!"）
- 질문은 하나씩, 간단하게
- 딱딱한 면접 말투 금지
- 대답하기 쉬운 질문하기`,
}

/**
 * 言語コードからトーン指示を取得（未定義の言語は英語にフォールバック）
 */
export function getToneInstruction(languageCode: string): string {
  return GREETER_TONE_INSTRUCTIONS[languageCode] || GREETER_TONE_INSTRUCTIONS.en
}

/**
 * 共通の注意事項
 */
const COMMON_INSTRUCTIONS = `## ツール使用ルール
- 言語コードが不明な場合は、get_available_languages を呼んでプリセット言語を確認できる
- 任意のISO 639-1言語コードが使用可能（プリセットに無い言語も対応可能）
- 例: ベトナム語なら set_language('vi')、タイ語なら set_language('th')
- 常に正しい ISO コードを使用する（言語: ISO 639-1 | 国: ISO 3166-1 alpha-2）
- 成功するか、ユーザー入力が処理できないと判断するまで再試行を続ける

## 会話トーン
- 丁寧で親しみやすい
- 命令口調や圧迫的な表現は禁止
- 応募者が不安にならないよう、温かみのある対応を心がける

## 注意事項
- 言語・居住国の確認以外の質問には答えない（次のステップで対応すると伝える）
- 個人情報は聞かない
- 応募プロセスの詳細説明は次のステップで行う
- **居住国は言語から推測してはいけない**（例: 日本語を話す人が日本在住とは限らない。必ず応募者に直接確認すること）`

/**
 * 利用可能なツールセクションを構築
 */
function buildToolsSection(state: State): string {
  const tools: string[] = ['- ask: ユーザーに質問やメッセージを送る']

  if (!state.language) {
    tools.push('- get_available_languages: プリセット言語コードの一覧を取得する')
    tools.push('- set_language: 言語を設定する（任意のISO 639-1言語コードが使用可能）')
  }

  if (!state.country) {
    tools.push('- set_country: 居住国を設定する（ISO 3166-1 alpha-2 国コード）')
  }

  if (!state.timezone) {
    tools.push('- set_timezone: 居住国からタイムゾーンを推測して設定する')
  }

  return `## 利用可能なツール\n${tools.join('\n')}`
}

/**
 * 動作手順セクションを構築
 */
function buildStepsSection(state: State): string {
  const steps: string[] = []
  let stepNum = 1

  // 言語設定が未完了の場合
  if (!state.language) {
    steps.push(`### ${stepNum}. 言語確認
1. 最初に応募者に親しみやすく挨拶する
2. 使用言語を確認する（直接聞くか、応募者のメッセージから推測）
3. 言語が確認できたら set_language を呼ぶ

言語推測ルール:
- 応募者が日本語で話しかけてきた場合は日本語（ja）と推測
- 応募者が英語で話しかけてきた場合は英語（en）と推測
- 推測に自信がない場合は、応募者に確認する`)
    stepNum++
  }

  // 国設定が未完了の場合
  if (!state.country) {
    steps.push(`### ${stepNum}. 居住国確認
1. 居住国を確認する
2. 居住国が確認できたら set_country を呼ぶ
3. 続けて set_timezone を呼んでタイムゾーンを設定する`)
    stepNum++
  } else if (!state.timezone) {
    // 国は設定済みだがタイムゾーンが未設定の場合
    steps.push(`### ${stepNum}. タイムゾーン設定
set_timezone を呼んでタイムゾーンを設定する`)
    stepNum++
  }

  // 完了ステップ
  steps.push(`### ${stepNum}. 完了
全ての設定が完了したら、確認メッセージを送って終了する。`)

  return `## 動作手順\n\n${steps.join('\n\n')}`
}

/**
 * 現在の状態説明を構築
 */
function buildCurrentStateSection(state: State): string {
  const completed: string[] = []

  if (state.language) {
    completed.push(`- 言語: ${state.language} （設定済み）`)
  }
  if (state.country) {
    completed.push(`- 居住国: ${state.country} （設定済み）`)
  }
  if (state.timezone) {
    completed.push(`- タイムゾーン: ${state.timezone} （設定済み）`)
  }

  if (completed.length === 0) {
    return ''
  }

  return `## 現在の設定状況\n${completed.join('\n')}`
}

/**
 * 役割説明を構築
 */
function buildRoleSection(state: State): string {
  const tasks: string[] = []

  if (!state.language) {
    tasks.push('使用言語の確認')
  }
  if (!state.country) {
    tasks.push('居住国の確認')
  }
  if (!state.timezone) {
    tasks.push('タイムゾーンの設定')
  }

  if (tasks.length === 0) {
    return '## 役割\n設定は全て完了しています。確認メッセージを送ってください。'
  }

  return `## 役割\n応募者の${tasks.join('と')}を行うことが目的です。`
}

/**
 * Greeter エージェントのシステムプロンプトを動的に構築
 */
export function buildGreeterSystemPrompt(state: State): string {
  const sections: string[] = []

  // 基本説明
  sections.push('あなたは採用応募プロセスの最初のステップを担当するアシスタントです。')

  // 現在の設定状況（あれば）
  const currentStateSection = buildCurrentStateSection(state)
  if (currentStateSection) {
    sections.push(currentStateSection)
  }

  // 役割
  sections.push(buildRoleSection(state))

  // 利用可能なツール
  sections.push(buildToolsSection(state))

  // 動作手順
  sections.push(buildStepsSection(state))

  // 共通の注意事項
  sections.push(COMMON_INSTRUCTIONS)

  return sections.join('\n\n')
}

/**
 * 後方互換性のための静的プロンプト（デフォルト状態用）
 * @deprecated buildGreeterSystemPrompt を使用してください
 */
export const GREETER_SYSTEM_PROMPT = buildGreeterSystemPrompt({})

/**
 * 言語別の挨拶メッセージ
 */
export const GREETING_MESSAGES: Record<string, string> = {
  ja: 'こんにちは！ご応募いただきありがとうございます。',
  en: 'Hello! Thank you for your application.',
  zh: '您好！感谢您的申请。',
  ko: '안녕하세요! 지원해 주셔서 감사합니다.',
}

/**
 * 挨拶メッセージを取得（未定義の言語は英語にフォールバック）
 */
export function getGreetingMessage(languageCode: string): string {
  return GREETING_MESSAGES[languageCode] || GREETING_MESSAGES.en
}

/**
 * 言語別の言語確認メッセージ
 */
export const LANGUAGE_CONFIRMATION_MESSAGES: Record<string, string> = {
  ja: '日本語で進めさせていただきます。',
  en: 'I will continue in English.',
  zh: '我将用中文继续。',
  ko: '한국어로 진행하겠습니다.',
}

/**
 * 言語確認メッセージを取得（未定義の言語は英語にフォールバック）
 */
export function getLanguageConfirmationMessage(languageCode: string): string {
  return LANGUAGE_CONFIRMATION_MESSAGES[languageCode] || LANGUAGE_CONFIRMATION_MESSAGES.en
}

/**
 * 言語別の居住国確認メッセージ
 */
export const COUNTRY_ASK_MESSAGES: Record<string, string> = {
  ja: '次に、現在お住まいの国を教えていただけますか？',
  en: 'Could you please tell me which country you currently live in?',
  zh: '请问您目前居住在哪个国家？',
  ko: '현재 거주하고 계신 국가를 알려주시겠어요?',
}

/**
 * 居住国確認メッセージを取得（未定義の言語は英語にフォールバック）
 */
export function getCountryAskMessage(languageCode: string): string {
  return COUNTRY_ASK_MESSAGES[languageCode] || COUNTRY_ASK_MESSAGES.en
}

/**
 * 言語別の完了メッセージ
 */
export const COMPLETION_MESSAGES: Record<string, string> = {
  ja: 'ありがとうございます。設定が完了しました。それでは、応募に関する質問を始めさせていただきます。',
  en: 'Thank you. The setup is complete. Now, let me begin with the application questions.',
  zh: '谢谢您。设置已完成。现在让我开始申请相关的问题。',
  ko: '감사합니다. 설정이 완료되었습니다. 이제 지원 관련 질문을 시작하겠습니다.',
}

/**
 * 完了メッセージを取得（未定義の言語は英語にフォールバック）
 */
export function getCompletionMessage(languageCode: string): string {
  return COMPLETION_MESSAGES[languageCode] || COMPLETION_MESSAGES.en
}
