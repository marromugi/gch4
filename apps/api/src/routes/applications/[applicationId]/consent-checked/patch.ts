import { EventLog } from '@ding/domain/domain/entity'
import { ApplicationId, EventLogId, EventType } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { applicationResponseSchema } from '../../../../schemas/response'
import { serializeApplication } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'patch',
  path: '/{applicationId}/consent-checked',
  operationId: 'markConsentChecked',
  tags: ['Application'],
  summary: 'Mark consent as checked',
  request: {
    params: z.object({
      applicationId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Consent marked as checked',
      content: {
        'application/json': {
          schema: z.object({
            data: applicationResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    404: {
      description: 'Application not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
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
  const { applicationId } = c.req.valid('param')

  const appId = ApplicationId.fromString(applicationId)

  // 1. Application 取得
  const appResult = await repositories.applicationRepository.findById(appId)
  if (!appResult.success) {
    return c.json({ error: 'Application not found' }, 404)
  }
  const application = appResult.value

  // 2. markConsentChecked 呼び出し（extractionReviewedAt が前提条件）
  try {
    application.markConsentChecked()
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Validation error' }, 400)
  }

  // 3. 保存
  const saveResult = await repositories.applicationRepository.save(application)
  if (!saveResult.success) {
    return c.json({ error: 'Failed to save application' }, 500)
  }

  // 4. EventLog 記録
  const now = new Date()
  const eventLog = EventLog.create({
    id: EventLogId.fromString(crypto.randomUUID()),
    jobId: application.jobId,
    applicationId: application.id,
    chatSessionId: null,
    policyVersionId: null,
    eventType: EventType.consentChecked(),
    metadata: null,
    createdAt: now,
  })
  await repositories.eventLogRepository.create(eventLog)

  return c.json({ data: serializeApplication(application) }, 200)
})

export default app
