import { ProhibitedTopic } from './ProhibitedTopic'
import { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'

const createTopic = (overrides: Partial<Parameters<typeof ProhibitedTopic.create>[0]> = {}) =>
  ProhibitedTopic.create({
    id: 'pt-1',
    schemaVersionId: JobSchemaVersionId.fromString('sv-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    topic: '前職の機密情報',
    createdAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('ProhibitedTopic', () => {
  describe('create', () => {
    it('有効なプロパティで作成できる', () => {
      const topic = createTopic()
      expect(topic.topic).toBe('前職の機密情報')
    })

    it('空のtopicでエラーを投げる', () => {
      expect(() => createTopic({ topic: '' })).toThrow('ProhibitedTopic topic cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じIDはequalである', () => {
      const t1 = createTopic()
      const t2 = createTopic()
      expect(t1.equals(t2)).toBe(true)
    })

    it('異なるIDはequalでない', () => {
      const t1 = createTopic()
      const t2 = createTopic({ id: 'pt-2' })
      expect(t1.equals(t2)).toBe(false)
    })
  })
})
