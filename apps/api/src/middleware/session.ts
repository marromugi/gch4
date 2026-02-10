import { createAuth } from '../lib/auth'
import type { HonoEnv } from '../types/hono'
import type { MiddlewareHandler } from 'hono'

/**
 * セッションミドルウェア
 * 認証インスタンスを作成し、セッション情報を取得してコンテキストに設定
 */
export const sessionMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const auth = createAuth(c.env)
  c.set('auth', auth)

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  c.set('user', session?.user ?? null)
  c.set('session', session?.session ?? null)

  await next()
}

/**
 * 認証必須ミドルウェア
 * 未認証の場合は 401 エラーを返す
 */
export const requireAuth: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const user = c.get('user')

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
}
