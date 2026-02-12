import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { GetJobSchemaWithDefinitions } from './GetJobSchemaWithDefinitions'
import { Job } from '../../../domain/entity/Job/Job'
import { JobFormField } from '../../../domain/entity/JobFormField/JobFormField'
import { JobSchemaVersion } from '../../../domain/entity/JobSchemaVersion/JobSchemaVersion'
import { FieldFactDefinition } from '../../../domain/entity/FieldFactDefinition/FieldFactDefinition'
import { ProhibitedTopic } from '../../../domain/entity/ProhibitedTopic/ProhibitedTopic'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobSchemaVersionStatus } from '../../../domain/valueObject/JobSchemaVersionStatus/JobSchemaVersionStatus'
import { FieldFactDefinitionId } from '../../../domain/valueObject/FieldFactDefinitionId/FieldFactDefinitionId'

describe('GetJobSchemaWithDefinitions (integration)', () => {
  let db: Database
  let repo: DrizzleJobRepository
  const userId = 'test-user-1'

  beforeAll(() => {
    db = createTestDatabase()
    repo = new DrizzleJobRepository(db)
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
  })

  const setupJobWithSchema = async () => {
    const job = Job.reconstruct({
      id: JobId.fromString('job-1'),
      title: 'Test Job',
      description: null,
      idealCandidate: null,
      cultureContext: null,
      status: JobStatus.draft(),
      createdBy: UserId.fromString(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await repo.save(job)

    const field = JobFormField.reconstruct({
      id: JobFormFieldId.fromString('field-1'),
      jobId: job.id,
      fieldId: 'name',
      label: 'Name',
      intent: 'Collect name',
      required: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await repo.saveFormField(field)

    const sv = JobSchemaVersion.reconstruct({
      id: JobSchemaVersionId.fromString('sv-1'),
      jobId: job.id,
      version: 1,
      status: JobSchemaVersionStatus.draft(),
      approvedAt: null,
      createdAt: new Date(),
    })
    await repo.saveSchemaVersion(sv)

    return { job, field, sv }
  }

  describe('正常系', () => {
    it('SchemaVersionとFactDefinitionsとProhibitedTopicsを取得できる', async () => {
      const { field, sv } = await setupJobWithSchema()

      const defs = [
        FieldFactDefinition.reconstruct({
          id: FieldFactDefinitionId.fromString('ffd-1'),
          schemaVersionId: sv.id,
          jobFormFieldId: field.id,
          factKey: 'full_name',
          fact: 'Full name of candidate',
          doneCriteria: 'Name is provided',
          questioningHints: null,
          sortOrder: 0,
          createdAt: new Date(),
        }),
        FieldFactDefinition.reconstruct({
          id: FieldFactDefinitionId.fromString('ffd-2'),
          schemaVersionId: sv.id,
          jobFormFieldId: field.id,
          factKey: 'experience_years',
          fact: 'Years of experience',
          doneCriteria: 'Experience is provided',
          questioningHints: null,
          sortOrder: 1,
          createdAt: new Date(),
        }),
      ]
      await repo.saveFactDefinitions(defs)

      const topics = [
        ProhibitedTopic.reconstruct({
          id: 'pt-1',
          schemaVersionId: sv.id,
          jobFormFieldId: field.id,
          topic: 'Salary expectations',
          createdAt: new Date(),
        }),
      ]
      await repo.saveProhibitedTopics(topics)

      const usecase = new GetJobSchemaWithDefinitions(repo)
      const result = await usecase.execute({ jobId: 'job-1' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.schemaVersion.id.value).toBe('sv-1')
        expect(result.value.factDefinitions).toHaveLength(2)
        const factKeys = result.value.factDefinitions.map((d) => d.factKey)
        expect(factKeys).toContain('full_name')
        expect(factKeys).toContain('experience_years')
        expect(result.value.prohibitedTopics).toHaveLength(1)
        expect(result.value.prohibitedTopics[0].topic).toBe('Salary expectations')
      }
    })

    it('FactDefinitionsとProhibitedTopicsが無い場合は空配列を返す', async () => {
      await setupJobWithSchema()

      const usecase = new GetJobSchemaWithDefinitions(repo)
      const result = await usecase.execute({ jobId: 'job-1' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.schemaVersion.id.value).toBe('sv-1')
        expect(result.value.factDefinitions).toHaveLength(0)
        expect(result.value.prohibitedTopics).toHaveLength(0)
      }
    })
  })

  describe('異常系', () => {
    it('SchemaVersionが存在しない場合エラー', async () => {
      const job = Job.reconstruct({
        id: JobId.fromString('job-no-schema'),
        title: 'No Schema Job',
        description: null,
        idealCandidate: null,
        cultureContext: null,
        status: JobStatus.draft(),
        createdBy: UserId.fromString(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await repo.save(job)

      const usecase = new GetJobSchemaWithDefinitions(repo)
      const result = await usecase.execute({ jobId: 'job-no-schema' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('No schema version')
      }
    })
  })
})
