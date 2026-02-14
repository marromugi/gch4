import { z } from 'zod'
import { createTool } from './types'

/**
 * set_country ツールの引数スキーマ
 */
export const setCountryArgsSchema = z.object({
  country: z.string().describe('ISO 3166-1 alpha-2 国コード（例: JP, US, CN, KR）'),
})

/**
 * set_country ツールの結果スキーマ
 */
export const setCountryResultSchema = z.object({
  success: z.boolean(),
  country: z.string(),
})

/**
 * set_country ツール: 応募者の居住国を設定する
 */
export const setCountryTool = createTool({
  name: 'set_country',
  description: '応募者の居住国を設定する。居住国が確認できた時点で呼び出す。',
  args: setCountryArgsSchema,
  result: setCountryResultSchema,
  execute: async (args) => {
    // 実際の永続化は Orchestrator 側で処理
    return {
      success: true,
      country: args.country.toUpperCase(),
    }
  },
})

export type SetCountryArgs = z.infer<typeof setCountryArgsSchema>
export type SetCountryResult = z.infer<typeof setCountryResultSchema>
