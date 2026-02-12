import { eq, and, desc } from 'drizzle-orm'
import type { Database } from '@ding/database/client'
import {
  reviewPolicyVersion,
  reviewPolicySignal,
  reviewProhibitedTopic,
} from '@ding/database/schema'
import { Result } from '../../../domain/shared/Result/Result'
import { ReviewPolicyVersion } from '../../../domain/entity/ReviewPolicyVersion/ReviewPolicyVersion'
import { ReviewPolicySignal } from '../../../domain/entity/ReviewPolicySignal/ReviewPolicySignal'
import { ReviewProhibitedTopic } from '../../../domain/entity/ReviewProhibitedTopic/ReviewProhibitedTopic'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { ReviewPolicyVersionStatus } from '../../../domain/valueObject/ReviewPolicyVersionStatus/ReviewPolicyVersionStatus'
import { ReviewPolicySignalId } from '../../../domain/valueObject/ReviewPolicySignalId/ReviewPolicySignalId'
import { ReviewSignalPriority } from '../../../domain/valueObject/ReviewSignalPriority/ReviewSignalPriority'
import { ReviewSignalCategory } from '../../../domain/valueObject/ReviewSignalCategory/ReviewSignalCategory'
import type { IReviewPolicyRepository } from '../../../domain/repository/IReviewPolicyRepository/IReviewPolicyRepository'

export class DrizzleReviewPolicyRepository implements IReviewPolicyRepository {
  constructor(private readonly db: Database) {}

  async findById(id: ReviewPolicyVersionId): Promise<Result<ReviewPolicyVersion, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(reviewPolicyVersion)
        .where(eq(reviewPolicyVersion.id, id.value))
        .limit(1)
      if (rows.length === 0) {
        return Result.err(new Error(`ReviewPolicyVersion not found: ${id.value}`))
      }
      return Result.ok(this.toPolicyVersionEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByJobId(jobId: JobId): Promise<Result<ReviewPolicyVersion[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(reviewPolicyVersion)
        .where(eq(reviewPolicyVersion.jobId, jobId.value))
      return Result.ok(rows.map((row) => this.toPolicyVersionEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findLatestPublishedByJobId(
    jobId: JobId
  ): Promise<Result<ReviewPolicyVersion | null, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(reviewPolicyVersion)
        .where(
          and(
            eq(reviewPolicyVersion.jobId, jobId.value),
            eq(reviewPolicyVersion.status, 'published')
          )
        )
        .orderBy(desc(reviewPolicyVersion.version))
        .limit(1)
      if (rows.length === 0) {
        return Result.ok(null)
      }
      return Result.ok(this.toPolicyVersionEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async save(entity: ReviewPolicyVersion): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(reviewPolicyVersion)
        .values({
          id: entity.id.value,
          jobId: entity.jobId.value,
          version: entity.version,
          status: entity.status.value,
          softCap: entity.softCap,
          hardCap: entity.hardCap,
          createdBy: entity.createdBy.value,
          confirmedAt: entity.confirmedAt,
          publishedAt: entity.publishedAt,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        })
        .onConflictDoUpdate({
          target: reviewPolicyVersion.id,
          set: {
            status: entity.status.value,
            softCap: entity.softCap,
            hardCap: entity.hardCap,
            confirmedAt: entity.confirmedAt,
            publishedAt: entity.publishedAt,
            updatedAt: entity.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // ReviewPolicySignal

  async findSignalsByPolicyVersionId(
    policyVersionId: ReviewPolicyVersionId
  ): Promise<Result<ReviewPolicySignal[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(reviewPolicySignal)
        .where(eq(reviewPolicySignal.policyVersionId, policyVersionId.value))
      return Result.ok(rows.map((row) => this.toSignalEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveSignals(signals: ReviewPolicySignal[]): Promise<Result<void, Error>> {
    try {
      for (const signal of signals) {
        await this.db
          .insert(reviewPolicySignal)
          .values({
            id: signal.id.value,
            policyVersionId: signal.policyVersionId.value,
            signalKey: signal.signalKey,
            label: signal.label,
            description: signal.description,
            priority: signal.priority.value,
            category: signal.category.value,
            sortOrder: signal.sortOrder,
            createdAt: signal.createdAt,
          })
          .onConflictDoUpdate({
            target: reviewPolicySignal.id,
            set: {
              label: signal.label,
              description: signal.description,
              priority: signal.priority.value,
              category: signal.category.value,
              sortOrder: signal.sortOrder,
            },
          })
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // ReviewProhibitedTopic

  async findProhibitedTopicsByPolicyVersionId(
    policyVersionId: ReviewPolicyVersionId
  ): Promise<Result<ReviewProhibitedTopic[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(reviewProhibitedTopic)
        .where(eq(reviewProhibitedTopic.policyVersionId, policyVersionId.value))
      return Result.ok(rows.map((row) => this.toProhibitedTopicEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveProhibitedTopics(topics: ReviewProhibitedTopic[]): Promise<Result<void, Error>> {
    try {
      for (const topic of topics) {
        await this.db
          .insert(reviewProhibitedTopic)
          .values({
            id: topic.id,
            policyVersionId: topic.policyVersionId.value,
            topic: topic.topic,
            createdAt: topic.createdAt,
          })
          .onConflictDoUpdate({
            target: reviewProhibitedTopic.id,
            set: {
              topic: topic.topic,
            },
          })
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Mappers

  private toPolicyVersionEntity(row: typeof reviewPolicyVersion.$inferSelect): ReviewPolicyVersion {
    return ReviewPolicyVersion.reconstruct({
      id: ReviewPolicyVersionId.fromString(row.id),
      jobId: JobId.fromString(row.jobId),
      version: row.version,
      status: ReviewPolicyVersionStatus.from(row.status),
      softCap: row.softCap,
      hardCap: row.hardCap,
      createdBy: UserId.fromString(row.createdBy),
      confirmedAt: row.confirmedAt,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toSignalEntity(row: typeof reviewPolicySignal.$inferSelect): ReviewPolicySignal {
    return ReviewPolicySignal.reconstruct({
      id: ReviewPolicySignalId.fromString(row.id),
      policyVersionId: ReviewPolicyVersionId.fromString(row.policyVersionId),
      signalKey: row.signalKey,
      label: row.label,
      description: row.description,
      priority: ReviewSignalPriority.from(row.priority),
      category: ReviewSignalCategory.from(row.category),
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
    })
  }

  private toProhibitedTopicEntity(
    row: typeof reviewProhibitedTopic.$inferSelect
  ): ReviewProhibitedTopic {
    return ReviewProhibitedTopic.reconstruct({
      id: row.id,
      policyVersionId: ReviewPolicyVersionId.fromString(row.policyVersionId),
      topic: row.topic,
      createdAt: row.createdAt,
    })
  }
}
