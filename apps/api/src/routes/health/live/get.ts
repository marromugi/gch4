import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const route = createRoute({
  method: 'get',
  path: '/',
  operationId: 'getLive',
  tags: ['Health'],
  summary: 'Liveness check',
  description: 'Kubernetes liveness probe endpoint',
  responses: {
    200: {
      description: 'Service is alive',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('alive'),
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
      status: 'alive',
      timestamp: new Date().toISOString(),
    },
    200
  )
})

export default app
