import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const route = createRoute({
  method: 'get',
  path: '/',
  operationId: 'getHealth',
  tags: ['Health'],
  summary: 'Health check',
  description: 'Basic health check endpoint',
  responses: {
    200: {
      description: 'Service is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('healthy'),
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
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
    200
  )
})

export default app
