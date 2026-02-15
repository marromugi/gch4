import {
  GeminiProvider,
  ConsoleLogger,
  createDefaultRegistry,
  createKVStore,
  parseKVStoreType,
  type KVStoreType,
  type IKVStore,
} from '@ding/agent'
import { createDatabase } from '@ding/database'
import {
  DrizzleFormRepository,
  DrizzleSubmissionRepository,
  DrizzleEventLogRepository,
  DrizzleToolCallLogRepository,
} from '@ding/domain'
import type { HonoEnv, Bindings } from '../types/hono'
import type { MiddlewareHandler } from 'hono'
import { getFirestore } from './firestore'

// グローバルな AgentRegistry インスタンス
const globalAgentRegistry = createDefaultRegistry()

/**
 * 環境変数から KVStore インスタンスを生成
 */
function createKVStoreFromEnv(env: Bindings, type: KVStoreType): IKVStore {
  switch (type) {
    case 'cloudflare':
      if (!env.SESSIONS) {
        throw new Error('SESSIONS binding is required for Cloudflare KV')
      }
      return createKVStore({
        type: 'cloudflare',
        cloudflareKV: env.SESSIONS,
      })

    case 'firestore':
      const firestore = getFirestore({
        projectId: env.FIRESTORE_PROJECT_ID,
        databaseId: env.FIRESTORE_DATABASE_ID,
      })
      return createKVStore({
        type: 'firestore',
        firestoreConfig: {
          firestore,
          collectionName: env.FIRESTORE_COLLECTION_NAME,
        },
      })

    case 'memory':
      return createKVStore({ type: 'memory' })

    default:
      throw new Error(`Unknown KV_STORE_TYPE: ${type}`)
  }
}

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

  // KVStore の種別を環境変数から決定
  const kvStoreType = parseKVStoreType(c.env.KV_STORE_TYPE)
  const kvStore = createKVStoreFromEnv(c.env, kvStoreType)

  const infrastructure = {
    llmProvider: new GeminiProvider({
      apiKey: c.env.GEMINI_API_KEY,
      defaultModel: c.env.GEMINI_MODEL,
    }),
    kvStore,
    agentRegistry: globalAgentRegistry,
    logger: new ConsoleLogger('[API]'),
  }

  c.set('di', {
    db,
    repositories,
    infrastructure,
  })

  await next()
}
