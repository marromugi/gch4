import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../types/hono'
import { userResponseSchema, sessionResponseSchema } from '../../schemas/response'

const route = createRoute({
  method: 'get',
  path: '/',
  operationId: 'getMe',
  tags: ['User'],
  summary: 'Get current user',
  description: 'Get the currently authenticated user information',
  responses: {
    200: {
      description: 'Current user information',
      content: {
        'application/json': {
          schema: z.object({
            user: userResponseSchema,
            session: sessionResponseSchema.nullable(),
          }),
        },
      },
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
})

const app = new OpenAPIHono<HonoEnv>()

app.openapi(route, (c) => {
  const user = c.get('user')
  const session = c.get('session')

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? null,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
  }
  const serializedSession = session
    ? {
        id: session.id,
        userId: session.userId,
        token: session.token,
        expiresAt:
          session.expiresAt instanceof Date ? session.expiresAt.toISOString() : session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt:
          session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
        updatedAt:
          session.updatedAt instanceof Date ? session.updatedAt.toISOString() : session.updatedAt,
      }
    : null

  return c.json({ user: serializedUser, session: serializedSession }, 200)
})

export default app
