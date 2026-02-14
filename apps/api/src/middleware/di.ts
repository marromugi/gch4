import { GeminiProvider, CloudflareKVStore, createDefaultRegistry } from '@ding/agent'
import { createDatabase } from '@ding/database'
import {
  DrizzleFormRepository,
  DrizzleSubmissionRepository,
  DrizzleEventLogRepository,
  DrizzleToolCallLogRepository,
  FallbackService,
} from '@ding/domain'
import type { HonoEnv } from '../types/hono'
import type { MiddlewareHandler } from 'hono'

// グローバルな AgentRegistry インスタンス
const globalAgentRegistry = createDefaultRegistry()

/**
 * DI (Dependency Injection) ミドルウェア
 */
export const diMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const db = createDatabase({
    DATABASE_URL: c.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: c.env.DATABASE_AUTH_TOKEN,
  })

  const repositories = {
    formRepository: new DrizzleFormRepository(db),
    submissionRepository: new DrizzleSubmissionRepository(db),
    eventLogRepository: new DrizzleEventLogRepository(db),
    toolCallLogRepository: new DrizzleToolCallLogRepository(db),
  }

  const services = {
    fallbackService: new FallbackService(),
  }

  const infrastructure = {
    llmProvider: new GeminiProvider({
      apiKey: c.env.GEMINI_API_KEY,
      defaultModel: c.env.GEMINI_MODEL,
    }),
    kvStore: new CloudflareKVStore(c.env.SESSIONS),
    agentRegistry: globalAgentRegistry,
  }

  c.set('di', {
    db,
    repositories,
    services,
    infrastructure,
  })

  await next()
}
