import { createDatabase } from '@ding/database'
import * as schema from '@ding/database/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

/** 認証に必要な環境変数の型 */
export type AuthEnv = {
  DATABASE_URL: string
  DATABASE_AUTH_TOKEN?: string
  BETTER_AUTH_URL?: string
  BETTER_AUTH_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  CLIENT_URL?: string
}

/**
 * Better Auth インスタンスを作成するファクトリ関数
 * Cloudflare Workers環境ではc.envから環境変数を渡す
 */
export function createAuth(env: AuthEnv) {
  const db = createDatabase({
    DATABASE_URL: env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: env.DATABASE_AUTH_TOKEN,
  })

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),

    baseURL: env.BETTER_AUTH_URL || 'http://localhost:8080',
    secret: env.BETTER_AUTH_SECRET,

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5分間キャッシュ
      },
      expiresIn: 60 * 60 * 24 * 7, // 7日間
      updateAge: 60 * 60 * 24, // 1日ごとに更新
    },

    advanced: {
      // Firebase Hosting は __session cookie のみを Cloud Functions に転送する
      // https://www.frontendeng.dev/blog/36-firebase-cookies-sessions
      cookiePrefix: '__session',
      useSecureCookies: true,
      defaultCookieAttributes: {
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      },
    },

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },

    trustedOrigins: [env.CLIENT_URL || 'http://localhost:3000'],

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            try {
              console.log('[auth] UserSetting 自動作成完了', { userId: user.id })
            } catch (error) {
              console.error('[auth] UserSetting 自動作成エラー:', error)
            }
          },
        },
      },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>

/** セッション情報（session + user を含む） */
export type SessionData = Auth['$Infer']['Session']

/** セッション単体 */
export type Session = SessionData['session']

/** ユーザー */
export type User = SessionData['user']
