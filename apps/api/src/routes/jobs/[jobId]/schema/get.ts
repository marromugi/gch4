import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { GetJobSchemaWithDefinitions } from '@ding/domain'
import type { HonoEnv } from '../../../../types/hono'
import {
  jobSchemaVersionResponseSchema,
  fieldFactDefinitionResponseSchema,
  prohibitedTopicResponseSchema,
} from '../../../../schemas/response'
import {
  serializeJobSchemaVersion,
  serializeFieldFactDefinition,
  serializeProhibitedTopic,
} from '../../../../schemas/serializers'

const route = createRoute({
  method: 'get',
  path: '/{jobId}/schema',
  operationId: 'getJobSchema',
  tags: ['Job'],
  summary: 'Get schema with definitions for a job',
  request: {
    params: z.object({
      jobId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Job schema',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              schemaVersion: jobSchemaVersionResponseSchema,
              factDefinitions: z.array(fieldFactDefinitionResponseSchema),
              prohibitedTopics: z.array(prohibitedTopicResponseSchema),
            }),
          }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
})

const app = new OpenAPIHono<HonoEnv>()

app.openapi(route, async (c) => {
  const { repositories } = c.get('di')
  const { jobId } = c.req.valid('param')

  const usecase = new GetJobSchemaWithDefinitions(repositories.jobRepository)
  const result = await usecase.execute({ jobId })

  if (!result.success) {
    return c.json({ error: result.error.message }, 500)
  }

  const { schemaVersion, factDefinitions, prohibitedTopics } = result.value
  return c.json(
    {
      data: {
        schemaVersion: serializeJobSchemaVersion(schemaVersion),
        factDefinitions: factDefinitions.map(serializeFieldFactDefinition),
        prohibitedTopics: prohibitedTopics.map(serializeProhibitedTopic),
      },
    },
    200
  )
})

export default app
