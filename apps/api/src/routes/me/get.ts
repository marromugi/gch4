import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../types/hono'

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
            user: z.record(z.string(), z.unknown()),
            session: z.record(z.string(), z.unknown()).nullable(),
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

  return c.json({ user, session }, 200)
})

export default app
