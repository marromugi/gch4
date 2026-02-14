import { z } from 'zod'
import { createTool } from './types'

/**
 * プリセット言語の定義（よく使われる言語のメタ情報）
 * 言語コード自体は任意のISO 639-1コードを受け付ける
 */
export const presetLanguageDefinitions = [
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
] as const

/**
 * @deprecated supportedLanguageDefinitions は presetLanguageDefinitions に名前変更されました
 */
export const supportedLanguageDefinitions = presetLanguageDefinitions

/**
 * プリセット言語コード（参照用、制限はしない）
 */
export const presetLanguageCodes = presetLanguageDefinitions.map((lang) => lang.code)

/**
 * @deprecated supportedLanguageCodes は presetLanguageCodes に名前変更されました
 */
export const supportedLanguageCodes = presetLanguageCodes

/**
 * 言語コードの型（任意のISO 639-1コード）
 */
export type LanguageCode = string

/**
 * set_language ツールの引数スキーマ
 * 任意のISO 639-1言語コードを受け付ける
 */
export const setLanguageArgsSchema = z.object({
  language: z
    .string()
    .min(2)
    .max(3)
    .describe('ISO 639-1 言語コード（例: ja, en, zh, ko, de, fr, es など）'),
})

/**
 * set_language ツールの結果スキーマ
 */
export const setLanguageResultSchema = z.object({
  success: z.boolean(),
  language: z.string(),
})

/**
 * set_language ツール: 応募者の使用言語を設定する
 */
export const setLanguageTool = createTool({
  name: 'set_language',
  description: '応募者の使用言語を設定する。言語が確認できた時点で呼び出す。',
  args: setLanguageArgsSchema,
  result: setLanguageResultSchema,
  execute: async (args) => {
    // 実際の永続化は Orchestrator 側で処理
    return {
      success: true,
      language: args.language,
    }
  },
})

export type SetLanguageArgs = z.infer<typeof setLanguageArgsSchema>
export type SetLanguageResult = z.infer<typeof setLanguageResultSchema>
