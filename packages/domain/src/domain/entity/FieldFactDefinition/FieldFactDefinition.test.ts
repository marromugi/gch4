import { FieldFactDefinition } from './FieldFactDefinition'
import { FieldFactDefinitionId } from '../../valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'

const createFact = (overrides: Partial<Parameters<typeof FieldFactDefinition.create>[0]> = {}) =>
  FieldFactDefinition.create({
    id: FieldFactDefinitionId.fromString('ffd-1'),
    schemaVersionId: JobSchemaVersionId.fromString('sv-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    factKey: 'async_communication',
    fact: '非同期コミュニケーションで成果を出した実例',
    doneCriteria: '直近の具体事例、本人の行動、結果が確認できること',
    sortOrder: 0,
    createdAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('FieldFactDefinition', () => {
  describe('create', () => {
    it('有効なプロパティで作成できる', () => {
      const fact = createFact()
      expect(fact.factKey).toBe('async_communication')
      expect(fact.fact).toBe('非同期コミュニケーションで成果を出した実例')
    })

    it('空のfactKeyでエラーを投げる', () => {
      expect(() => createFact({ factKey: '' })).toThrow(
        'FieldFactDefinition factKey cannot be empty'
      )
    })

    it('空のfactでエラーを投げる', () => {
      expect(() => createFact({ fact: '' })).toThrow('FieldFactDefinition fact cannot be empty')
    })

    it('空のdoneCriteriaでエラーを投げる', () => {
      expect(() => createFact({ doneCriteria: '' })).toThrow(
        'FieldFactDefinition doneCriteria cannot be empty'
      )
    })
  })

  describe('equals', () => {
    it('同じIDはequalである', () => {
      const f1 = createFact()
      const f2 = createFact()
      expect(f1.equals(f2)).toBe(true)
    })

    it('異なるIDはequalでない', () => {
      const f1 = createFact()
      const f2 = createFact({ id: FieldFactDefinitionId.fromString('ffd-2') })
      expect(f1.equals(f2)).toBe(false)
    })
  })
})
