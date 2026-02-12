import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from './DrizzleJobRepository'
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

describe('DrizzleJobRepository', () => {
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

  const createJob = (id = 'job-1') =>
    Job.reconstruct({
      id: JobId.fromString(id),
      title: 'Test Job',
      description: 'A test job',
      idealCandidate: 'Ideal candidate',
      cultureContext: 'Culture context',
      status: JobStatus.draft(),
      createdBy: UserId.fromString(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  describe('save / findById', () => {
    it('should save and retrieve a job', async () => {
      const job = createJob()
      const saveResult = await repo.save(job)
      expect(saveResult.success).toBe(true)

      const findResult = await repo.findById(job.id)
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.id.value).toBe(job.id.value)
        expect(findResult.value.title).toBe('Test Job')
        expect(findResult.value.status.value).toBe('draft')
      }
    })

    it('should upsert on save', async () => {
      const job = createJob()
      await repo.save(job)

      const updated = Job.reconstruct({
        id: job.id,
        title: 'Updated Job',
        description: job.description,
        idealCandidate: job.idealCandidate,
        cultureContext: job.cultureContext,
        status: JobStatus.draft(),
        createdBy: job.createdBy,
        createdAt: job.createdAt,
        updatedAt: new Date(),
      })
      await repo.save(updated)

      const findResult = await repo.findById(job.id)
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.title).toBe('Updated Job')
      }
    })

    it('should return error for non-existent job', async () => {
      const result = await repo.findById(JobId.fromString('non-existent'))
      expect(result.success).toBe(false)
    })
  })

  describe('findByCreatedBy', () => {
    it('should return jobs created by user', async () => {
      await repo.save(createJob('job-1'))
      await repo.save(createJob('job-2'))

      const result = await repo.findByCreatedBy(UserId.fromString(userId))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(2)
      }
    })
  })

  describe('delete', () => {
    it('should delete a job', async () => {
      const job = createJob()
      await repo.save(job)
      await repo.delete(job.id)

      const result = await repo.findById(job.id)
      expect(result.success).toBe(false)
    })
  })

  describe('JobFormField', () => {
    it('should save and find form fields', async () => {
      const job = createJob()
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

      const result = await repo.findFormFieldsByJobId(job.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].fieldId).toBe('name')
      }
    })

    it('should save multiple form fields', async () => {
      const job = createJob()
      await repo.save(job)

      const fields = [
        JobFormField.reconstruct({
          id: JobFormFieldId.fromString('field-1'),
          jobId: job.id,
          fieldId: 'name',
          label: 'Name',
          intent: null,
          required: true,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        JobFormField.reconstruct({
          id: JobFormFieldId.fromString('field-2'),
          jobId: job.id,
          fieldId: 'email',
          label: 'Email',
          intent: null,
          required: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ]
      await repo.saveFormFields(fields)

      const result = await repo.findFormFieldsByJobId(job.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(2)
      }
    })
  })

  describe('JobSchemaVersion', () => {
    it('should save and find schema versions', async () => {
      const job = createJob()
      await repo.save(job)

      const version = JobSchemaVersion.reconstruct({
        id: JobSchemaVersionId.fromString('sv-1'),
        jobId: job.id,
        version: 1,
        status: JobSchemaVersionStatus.draft(),
        approvedAt: null,
        createdAt: new Date(),
      })
      await repo.saveSchemaVersion(version)

      const result = await repo.findSchemaVersionsByJobId(job.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].version).toBe(1)
      }
    })

    it('should find latest schema version', async () => {
      const job = createJob()
      await repo.save(job)

      const v1 = JobSchemaVersion.reconstruct({
        id: JobSchemaVersionId.fromString('sv-1'),
        jobId: job.id,
        version: 1,
        status: JobSchemaVersionStatus.approved(),
        approvedAt: new Date(),
        createdAt: new Date(),
      })
      const v2 = JobSchemaVersion.reconstruct({
        id: JobSchemaVersionId.fromString('sv-2'),
        jobId: job.id,
        version: 2,
        status: JobSchemaVersionStatus.draft(),
        approvedAt: null,
        createdAt: new Date(),
      })
      await repo.saveSchemaVersion(v1)
      await repo.saveSchemaVersion(v2)

      const result = await repo.findLatestSchemaVersion(job.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).not.toBeNull()
        expect(result.value!.version).toBe(2)
      }
    })

    it('should return null when no schema versions exist', async () => {
      const result = await repo.findLatestSchemaVersion(JobId.fromString('non-existent'))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBeNull()
      }
    })
  })

  describe('FieldFactDefinition', () => {
    it('should save and find fact definitions', async () => {
      const job = createJob()
      await repo.save(job)

      const field = JobFormField.reconstruct({
        id: JobFormFieldId.fromString('field-1'),
        jobId: job.id,
        fieldId: 'name',
        label: 'Name',
        intent: null,
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
      ]
      await repo.saveFactDefinitions(defs)

      const result = await repo.findFactDefinitionsBySchemaVersionId(sv.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].factKey).toBe('full_name')
      }
    })
  })

  describe('ProhibitedTopic', () => {
    it('should save and find prohibited topics', async () => {
      const job = createJob()
      await repo.save(job)

      const field = JobFormField.reconstruct({
        id: JobFormFieldId.fromString('field-1'),
        jobId: job.id,
        fieldId: 'name',
        label: 'Name',
        intent: null,
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

      const result = await repo.findProhibitedTopicsBySchemaVersionId(sv.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].topic).toBe('Salary expectations')
      }
    })
  })
})
