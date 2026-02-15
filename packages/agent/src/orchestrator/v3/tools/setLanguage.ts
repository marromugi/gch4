import { z } from 'zod'
import type { LLMToolDefinition } from '../../../provider/types'

/**
 * 対応言語リスト（CONTINUE_LABELS準拠: 14言語）
 */
const SUPPORTED_LANGUAGE_CODES = [
  'ja',
  'en',
  'zh',
  'ko',
  'es',
  'fr',
  'de',
  'pt',
  'it',
  'ru',
  'ar',
  'hi',
  'th',
  'vi',
] as const

/**
 * set_language ツールの引数スキーマ
 */
export const setLanguageArgsSchema = z.object({
  languageCode: z
    .enum(SUPPORTED_LANGUAGE_CODES)
    .describe('ISO 639-1 language code for the selected language'),
  isSupported: z
    .boolean()
    .describe(
      'Whether the user requested language is in the supported list. Set to false if the user requested an unsupported language.'
    ),
})

/**
 * set_language ツールの引数型
 */
export type SetLanguageArgs = z.infer<typeof setLanguageArgsSchema>

/**
 * set_language ツールの LLM 定義
 *
 * BOOTSTRAP ステージでユーザーが言語を指定した後に使用
 */
export const setLanguageToolDefinition: LLMToolDefinition = {
  name: 'set_language',
  description:
    'Set the conversation language based on user preference. Use this after the user specifies their preferred language. If the user requests an unsupported language, set isSupported to false and choose the closest supported language.',
  parameters: {
    type: 'object',
    properties: {
      languageCode: {
        type: 'string',
        enum: SUPPORTED_LANGUAGE_CODES,
        description:
          'ISO 639-1 language code (ja, en, zh, ko, es, fr, de, pt, it, ru, ar, hi, th, vi)',
      },
      isSupported: {
        type: 'boolean',
        description:
          'Whether the requested language is in the supported list. Set to false if falling back to a different language.',
      },
    },
    required: ['languageCode', 'isSupported'],
  },
}

/**
 * set_language ツールの引数を検証
 */
export function validateSetLanguageArgs(args: unknown): SetLanguageArgs {
  return setLanguageArgsSchema.parse(args)
}
