import { createDatabase } from '@ding/database'
import {
  DrizzleJobRepository,
  DrizzleApplicationRepository,
  DrizzleReviewPolicyRepository,
  DrizzleInterviewFeedbackRepository,
  DrizzleEventLogRepository,
} from '@ding/domain'
import { ApplicationSubmissionService, FallbackService } from '@ding/domain'
import { GeminiProvider } from '@ding/agent/provider/gemini'
import type { HonoEnv } from '../types/hono'
import type { MiddlewareHandler } from 'hono'

/**
 * DI (Dependency Injection) ミドルウェア
 */
export const diMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const db = createDatabase({
    DATABASE_URL: c.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: c.env.DATABASE_AUTH_TOKEN,
  })

  const repositories = {
    jobRepository: new DrizzleJobRepository(db),
    applicationRepository: new DrizzleApplicationRepository(db),
    reviewPolicyRepository: new DrizzleReviewPolicyRepository(db),
    interviewFeedbackRepository: new DrizzleInterviewFeedbackRepository(db),
    eventLogRepository: new DrizzleEventLogRepository(db),
  }

  const services = {
    submissionService: new ApplicationSubmissionService(),
    fallbackService: new FallbackService(),
  }

  const infrastructure = {
    llmProvider: new GeminiProvider({
      apiKey: c.env.GEMINI_API_KEY,
      defaultModel: c.env.GEMINI_MODEL,
    }),
  }

  c.set('di', {
    db,
    repositories,
    services,
    infrastructure,
  })

  await next()
}
