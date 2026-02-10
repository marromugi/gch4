import { Job } from './Job'
import { JobId } from '../../valueObject/JobId/JobId'
import { UserId } from '../../valueObject/UserId/UserId'
import { JobStatus } from '../../valueObject/JobStatus/JobStatus'

const createJob = (overrides: Partial<Parameters<typeof Job.create>[0]> = {}) =>
  Job.create({
    id: JobId.fromString('job-1'),
    title: 'エンジニア募集',
    description: 'フルスタックエンジニアを募集します',
    idealCandidate: 'TypeScriptに精通',
    cultureContext: 'フルリモート / 非同期中心',
    status: JobStatus.draft(),
    createdBy: UserId.fromString('user-1'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('Job', () => {
  describe('create', () => {
    it('有効なプロパティで作成できる', () => {
      const job = createJob()
      expect(job.title).toBe('エンジニア募集')
      expect(job.status.isDraft()).toBe(true)
    })

    it('空のタイトルでエラーを投げる', () => {
      expect(() => createJob({ title: '' })).toThrow('Job title cannot be empty')
    })

    it('空白のみのタイトルでエラーを投げる', () => {
      expect(() => createJob({ title: '   ' })).toThrow('Job title cannot be empty')
    })
  })

  describe('publish', () => {
    it('draftからopenに遷移できる', () => {
      const job = createJob()
      const published = job.publish()
      expect(published.status.isOpen()).toBe(true)
    })

    it('openからpublishするとエラーになる', () => {
      const job = createJob({ status: JobStatus.open() })
      expect(() => job.publish()).toThrow('Cannot publish job in status: open')
    })
  })

  describe('close', () => {
    it('openからclosedに遷移できる', () => {
      const job = createJob({ status: JobStatus.open() })
      const closed = job.close()
      expect(closed.status.isClosed()).toBe(true)
    })

    it('draftからcloseするとエラーになる', () => {
      const job = createJob()
      expect(() => job.close()).toThrow('Cannot close job in status: draft')
    })
  })

  describe('equals', () => {
    it('同じIDのJobはequalである', () => {
      const job1 = createJob()
      const job2 = createJob()
      expect(job1.equals(job2)).toBe(true)
    })

    it('異なるIDのJobはequalでない', () => {
      const job1 = createJob()
      const job2 = createJob({ id: JobId.fromString('job-2') })
      expect(job1.equals(job2)).toBe(false)
    })
  })
})
