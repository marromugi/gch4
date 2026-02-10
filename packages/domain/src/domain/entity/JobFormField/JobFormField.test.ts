import { JobFormField } from './JobFormField'
import { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'
import { JobId } from '../../valueObject/JobId/JobId'

const createField = (overrides: Partial<Parameters<typeof JobFormField.create>[0]> = {}) =>
  JobFormField.create({
    id: JobFormFieldId.fromString('jff-1'),
    jobId: JobId.fromString('job-1'),
    fieldId: 'motivation',
    label: '志望動機',
    intent: 'カルチャーフィットを見たい',
    required: true,
    sortOrder: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('JobFormField', () => {
  describe('create', () => {
    it('有効なプロパティで作成できる', () => {
      const field = createField()
      expect(field.label).toBe('志望動機')
      expect(field.fieldId).toBe('motivation')
      expect(field.required).toBe(true)
    })

    it('空のlabelでエラーを投げる', () => {
      expect(() => createField({ label: '' })).toThrow('JobFormField label cannot be empty')
    })

    it('空のfieldIdでエラーを投げる', () => {
      expect(() => createField({ fieldId: '' })).toThrow('JobFormField fieldId cannot be empty')
    })

    it('負のsortOrderでエラーを投げる', () => {
      expect(() => createField({ sortOrder: -1 })).toThrow(
        'JobFormField sortOrder must be non-negative'
      )
    })
  })

  describe('equals', () => {
    it('同じIDはequalである', () => {
      const f1 = createField()
      const f2 = createField()
      expect(f1.equals(f2)).toBe(true)
    })

    it('異なるIDはequalでない', () => {
      const f1 = createField()
      const f2 = createField({ id: JobFormFieldId.fromString('jff-2') })
      expect(f1.equals(f2)).toBe(false)
    })
  })
})
