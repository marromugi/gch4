import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const route = createRoute({
  method: 'get',
  path: '/',
  operationId: 'getReady',
  tags: ['Health'],
  summary: 'Readiness check',
  description: 'Kubernetes readiness probe endpoint',
  responses: {
    200: {
      description: 'Service is ready',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('ready'),
            timestamp: z.string().datetime(),
          }),
        },
      },
    },
  },
})

const app = new OpenAPIHono()

app.openapi(route, (c) => {
  return c.json(
    {
      status: 'ready',
      timestamp: new Date().toISOString(),
    },
    200
  )
})

export default app
