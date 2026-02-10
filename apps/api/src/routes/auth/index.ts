import { Hono } from 'hono'
import type { HonoEnv } from '../../types/hono'

const authRoutes = new Hono<HonoEnv>()

/**
 * Better Auth ハンドラー
 * すべての認証エンドポイントを処理:
 * - GET/POST /auth/sign-in/google
 * - GET /auth/callback/google
 * - POST /auth/sign-out
 * - GET /auth/session
 */
authRoutes.on(['GET', 'POST'], '/*', (c) => {
  const auth = c.get('auth')
  return auth.handler(c.req.raw)
})

export { authRoutes }
