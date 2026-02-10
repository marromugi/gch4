import { ExtractedField } from './ExtractedField'
import { ExtractedFieldId } from '../../valueObject/ExtractedFieldId/ExtractedFieldId'
import { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'
import { ExtractedFieldSource } from '../../valueObject/ExtractedFieldSource/ExtractedFieldSource'

const createField = (overrides: Partial<Parameters<typeof ExtractedField.create>[0]> = {}) =>
  ExtractedField.create({
    id: ExtractedFieldId.fromString('ef-1'),
    applicationId: ApplicationId.fromString('app-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    value: 'LLMで抽出された値',
    source: ExtractedFieldSource.llm(),
    confirmed: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('ExtractedField', () => {
  describe('create', () => {
    it('有効なプロパティで作成できる', () => {
      const field = createField()
      expect(field.value).toBe('LLMで抽出された値')
      expect(field.source.isLlm()).toBe(true)
      expect(field.confirmed).toBe(false)
    })
  })

  describe('confirm', () => {
    it('確認済みにできる', () => {
      const field = createField()
      const confirmed = field.confirm()
      expect(confirmed.confirmed).toBe(true)
    })
  })

  describe('updateValue', () => {
    it('値を更新できる', () => {
      const field = createField()
      const updated = field.updateValue('手入力値', ExtractedFieldSource.manual())
      expect(updated.value).toBe('手入力値')
      expect(updated.source.isManual()).toBe(true)
      expect(updated.confirmed).toBe(false)
    })
  })

  describe('equals', () => {
    it('同じIDはequalである', () => {
      const f1 = createField()
      const f2 = createField()
      expect(f1.equals(f2)).toBe(true)
    })
  })
})
