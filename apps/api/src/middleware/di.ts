import { createDatabase } from '@ding/database'
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

  const repositories = {}

  const services = {}

  const infrastructure = {}

  c.set('di', {
    db,
    repositories,
    services,
    infrastructure,
  })

  await next()
}
