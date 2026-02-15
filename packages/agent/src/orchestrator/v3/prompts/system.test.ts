import { describe, it, expect } from 'vitest'
import {
  buildSystemPrompt,
  ORCHESTRATOR_V3_BASE_PROMPT,
  LANGUAGE_INSTRUCTIONS,
  TONE_INSTRUCTIONS,
} from './system'

describe('system prompt', () => {
  describe('ORCHESTRATOR_V3_BASE_PROMPT', () => {
    it('基本的な役割が含まれている', () => {
      expect(ORCHESTRATOR_V3_BASE_PROMPT).toContain('professional interviewer')
      expect(ORCHESTRATOR_V3_BASE_PROMPT).toContain('structured interview')
    })

    it('ask ツールの説明が含まれている', () => {
      expect(ORCHESTRATOR_V3_BASE_PROMPT).toContain('ask')
      expect(ORCHESTRATOR_V3_BASE_PROMPT).toContain('Available Tools')
    })

    it('基本ルールが含まれている', () => {
      expect(ORCHESTRATOR_V3_BASE_PROMPT).toContain('ONE question at a time')
      expect(ORCHESTRATOR_V3_BASE_PROMPT).toContain('Wait for the user')
    })
  })

  describe('LANGUAGE_INSTRUCTIONS', () => {
    it('日本語の指示が含まれている', () => {
      expect(LANGUAGE_INSTRUCTIONS.ja).toContain('日本語')
    })

    it('英語の指示が含まれている', () => {
      expect(LANGUAGE_INSTRUCTIONS.en).toContain('English')
    })

    it('中国語の指示が含まれている', () => {
      expect(LANGUAGE_INSTRUCTIONS.zh).toContain('中文')
    })

    it('韓国語の指示が含まれている', () => {
      expect(LANGUAGE_INSTRUCTIONS.ko).toContain('한국어')
    })
  })

  describe('TONE_INSTRUCTIONS', () => {
    it('日本語のトーン指示が含まれている', () => {
      expect(TONE_INSTRUCTIONS.ja).toContain('温かく')
      expect(TONE_INSTRUCTIONS.ja).toContain('相槌')
    })

    it('英語のトーン指示が含まれている', () => {
      expect(TONE_INSTRUCTIONS.en).toContain('warm and friendly')
      expect(TONE_INSTRUCTIONS.en).toContain('acknowledgments')
    })
  })

  describe('buildSystemPrompt', () => {
    it('言語指定なしでデフォルト（英語）のプロンプトを生成する', () => {
      const prompt = buildSystemPrompt()

      expect(prompt).toContain(ORCHESTRATOR_V3_BASE_PROMPT)
      expect(prompt).toContain(LANGUAGE_INSTRUCTIONS.en)
      expect(prompt).toContain(TONE_INSTRUCTIONS.en)
    })

    it('日本語のプロンプトを生成する', () => {
      const prompt = buildSystemPrompt('ja')

      expect(prompt).toContain(ORCHESTRATOR_V3_BASE_PROMPT)
      expect(prompt).toContain(LANGUAGE_INSTRUCTIONS.ja)
      expect(prompt).toContain(TONE_INSTRUCTIONS.ja)
    })

    it('中国語のプロンプトを生成する', () => {
      const prompt = buildSystemPrompt('zh')

      expect(prompt).toContain(ORCHESTRATOR_V3_BASE_PROMPT)
      expect(prompt).toContain(LANGUAGE_INSTRUCTIONS.zh)
      expect(prompt).toContain(TONE_INSTRUCTIONS.zh)
    })

    it('韓国語のプロンプトを生成する', () => {
      const prompt = buildSystemPrompt('ko')

      expect(prompt).toContain(ORCHESTRATOR_V3_BASE_PROMPT)
      expect(prompt).toContain(LANGUAGE_INSTRUCTIONS.ko)
      expect(prompt).toContain(TONE_INSTRUCTIONS.ko)
    })

    it('未対応の言語の場合は英語にフォールバックする', () => {
      const prompt = buildSystemPrompt('fr')

      expect(prompt).toContain(LANGUAGE_INSTRUCTIONS.en)
      expect(prompt).toContain(TONE_INSTRUCTIONS.en)
    })

    it('Language セクションが含まれている', () => {
      const prompt = buildSystemPrompt('ja')

      expect(prompt).toContain('## Language')
    })
  })
})
