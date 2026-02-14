import { z } from 'zod'
import { createTool } from './types'

/**
 * 国コードからタイムゾーンへのマッピング
 * 主要な国のみ定義。複数タイムゾーンを持つ国は代表的なものを使用
 */
const countryTimezoneMap: Record<string, string> = {
  // アジア
  JP: 'Asia/Tokyo',
  CN: 'Asia/Shanghai',
  KR: 'Asia/Seoul',
  TW: 'Asia/Taipei',
  HK: 'Asia/Hong_Kong',
  SG: 'Asia/Singapore',
  TH: 'Asia/Bangkok',
  VN: 'Asia/Ho_Chi_Minh',
  PH: 'Asia/Manila',
  MY: 'Asia/Kuala_Lumpur',
  ID: 'Asia/Jakarta',
  IN: 'Asia/Kolkata',

  // ヨーロッパ
  GB: 'Europe/London',
  DE: 'Europe/Berlin',
  FR: 'Europe/Paris',
  IT: 'Europe/Rome',
  ES: 'Europe/Madrid',
  NL: 'Europe/Amsterdam',
  SE: 'Europe/Stockholm',
  NO: 'Europe/Oslo',
  FI: 'Europe/Helsinki',
  DK: 'Europe/Copenhagen',
  PL: 'Europe/Warsaw',
  CH: 'Europe/Zurich',
  AT: 'Europe/Vienna',
  BE: 'Europe/Brussels',
  PT: 'Europe/Lisbon',
  IE: 'Europe/Dublin',

  // 北米
  US: 'America/New_York', // 代表的なタイムゾーン
  CA: 'America/Toronto', // 代表的なタイムゾーン

  // オセアニア
  AU: 'Australia/Sydney', // 代表的なタイムゾーン
  NZ: 'Pacific/Auckland',

  // 南米
  BR: 'America/Sao_Paulo',
  AR: 'America/Buenos_Aires',
  CL: 'America/Santiago',
  CO: 'America/Bogota',
  MX: 'America/Mexico_City',
}

/**
 * 国コードからタイムゾーンを推測する
 */
export function inferTimezoneFromCountry(country: string): {
  timezone: string
  confidence: 'high' | 'medium' | 'low'
  fallback?: boolean
} {
  const upperCountry = country.toUpperCase()
  const timezone = countryTimezoneMap[upperCountry]

  if (timezone) {
    // 複数タイムゾーンを持つ国は confidence を medium に
    const multiTimezoneCountries = ['US', 'CA', 'AU', 'RU', 'BR']
    const confidence = multiTimezoneCountries.includes(upperCountry) ? 'medium' : 'high'
    return { timezone, confidence }
  }

  // 不明な国はフォールバック
  return {
    timezone: 'Asia/Tokyo',
    confidence: 'low',
    fallback: true,
  }
}

/**
 * set_timezone ツールの引数スキーマ
 */
export const setTimezoneArgsSchema = z.object({
  country: z.string().describe('ISO 3166-1 alpha-2 国コード'),
})

/**
 * set_timezone ツールの結果スキーマ
 */
export const setTimezoneResultSchema = z.object({
  timezone: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  fallback: z.boolean().optional(),
})

/**
 * set_timezone ツール: 居住国からタイムゾーンを推測して設定する
 */
export const setTimezoneTool = createTool({
  name: 'set_timezone',
  description: '居住国からタイムゾーンを推測して設定する。set_country の後に呼び出す。',
  args: setTimezoneArgsSchema,
  result: setTimezoneResultSchema,
  execute: async (args) => {
    return inferTimezoneFromCountry(args.country)
  },
})

export type SetTimezoneArgs = z.infer<typeof setTimezoneArgsSchema>
export type SetTimezoneResult = z.infer<typeof setTimezoneResultSchema>
