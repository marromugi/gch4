import { z } from 'zod'
import { presetLanguageDefinitions } from './language'
import { createTool } from './types'

/**
 * get_available_languages ツールの結果スキーマ
 */
export const getAvailableLanguagesResultSchema = z.object({
  languages: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      nativeName: z.string(),
    })
  ),
  note: z.string().optional(),
})

/**
 * get_available_languages ツール: プリセット言語の一覧を取得する
 * 注: これはプリセット言語のリストであり、任意のISO 639-1言語コードが使用可能
 */
export const getAvailableLanguagesTool = createTool({
  name: 'get_available_languages',
  description:
    'プリセット言語の一覧を取得する。リストに無い言語でも、任意のISO 639-1言語コードが set_language で使用可能。',
  args: z.object({}),
  result: getAvailableLanguagesResultSchema,
  execute: async () => ({
    languages: presetLanguageDefinitions.map((lang) => ({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
    })),
    note: 'これはプリセット言語のリストです。リストに無い言語でも、任意のISO 639-1言語コードが使用可能です。',
  }),
})

export type GetAvailableLanguagesResult = z.infer<typeof getAvailableLanguagesResultSchema>
