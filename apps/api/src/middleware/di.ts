import { createDatabase } from '@ding/database'
import { CloudflareKVStore, KVAgentSessionRepository, KVConversationLogStore } from '@ding/domain'
import type { MiddlewareHandler } from 'hono'
import { createRepositories } from '../lib/repositories'
import { createServices } from '../lib/services'
import { CloudflareDORunner } from '../lib/runners/CloudflareDORunner'
import { DOEventStore } from '../lib/event-store'
import type { HonoEnv } from '../types/hono'

/**
 * DI (Dependency Injection) ミドルウェア
 * データベース接続とリポジトリ・サービスインスタンスを作成してコンテキストに設定
 *
 * 注意: Cloudflare Workers では各リクエストが独立した実行環境で動作するため、
 * 接続プールは不要。リクエストごとにインスタンスを作成しても問題ない。
 */
export const diMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const db = createDatabase({
    DATABASE_URL: c.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: c.env.DATABASE_AUTH_TOKEN,
  })

  // KV ベースのリポジトリを作成
  const kvStore = new CloudflareKVStore(c.env.AGENT_KV, 60 * 60) // TTL: 1時間
  const agentSessionRepository = new KVAgentSessionRepository(kvStore)

  // 会話ログストア（30日 TTL）
  const logKvStore = new CloudflareKVStore(c.env.AGENT_KV, 30 * 24 * 60 * 60)
  const conversationLogStore = new KVConversationLogStore(logKvStore)

  const repositories = {
    ...createRepositories(db),
    agentSessionRepository,
    conversationLogStore,
  }

  // インフラストラクチャ層の作成
  const backgroundAgentRunner = new CloudflareDORunner(c.env.AGENT_SESSION_DO, c.executionCtx)
  const agentEventStore = new DOEventStore(c.env.AGENT_SESSION_DO)

  const services = createServices({
    repositories,
    mediaBucket: c.env.MEDIA_BUCKET,
    r2PublicUrl: c.env.R2_PUBLIC_URL,
    mediaSignerSecret: c.env.MEDIA_SIGNER_SECRET,
    mediaProxyBaseUrl: c.env.MEDIA_PROXY_BASE_URL,
    geminiApiKey: c.env.GEMINI_API_KEY,
    geminiModel: c.env.GEMINI_MODEL,
    backgroundAgentRunner,
  })

  c.set('di', {
    db,
    repositories,
    services,
    infrastructure: {
      backgroundAgentRunner,
      agentEventStore,
    },
  })

  await next()
}
