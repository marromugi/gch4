import type { DIContainer } from './repositories'
import type { Auth, Session, User } from '../lib/auth'

/** Cloudflare Workers 環境変数の型 */
export type Bindings = {
  DATABASE_URL: string
  DATABASE_AUTH_TOKEN?: string
  CLIENT_URL?: string
  BETTER_AUTH_URL?: string
  BETTER_AUTH_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GEMINI_API_KEY: string
  GEMINI_MODEL?: string
}

export type HonoEnv = {
  Bindings: Bindings
  Variables: {
    user: User | null
    session: Session | null
    auth: Auth
    di: DIContainer
  }
}
