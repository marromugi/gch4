import { OrchestratorV3, ConsoleLogger, type SessionForm } from '@ding/agent'
import { FormId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { createV3SessionRequestSchema, v3SessionCreatedResponseSchema } from '../../../schemas/v3'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'createV3Session',
  tags: ['V3'],
  summary: 'Create a new V3 interview session',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createV3SessionRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Session created',
      content: {
        'application/json': {
          schema: z.object({
            data: v3SessionCreatedResponseSchema,
          }),
        },
      },
    },
    404: {
      description: 'Form not found',
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
  const { repositories, infrastructure } = c.get('di')
  const { formId, browserLanguage } = c.req.valid('json')

  // 1. Form 取得
  const formResult = await repositories.formRepository.findById(FormId.fromString(formId))
  if (!formResult.success) {
    return c.json({ error: 'Form not found' }, 404)
  }
  const form = formResult.value

  // 2. 最新の SchemaVersion を取得
  const schemaVersionResult = await repositories.formRepository.findLatestSchemaVersionByFormId(
    form.id
  )
  if (!schemaVersionResult.success || !schemaVersionResult.value) {
    return c.json({ error: 'No schema version found for form' }, 404)
  }
  const schemaVersion = schemaVersionResult.value

  // 3. FormField 一覧
  const formFieldsResult = await repositories.formRepository.findFormFieldsByFormId(form.id)
  if (!formFieldsResult.success) {
    return c.json({ error: 'Failed to load form fields' }, 500)
  }
  const formFields = formFieldsResult.value

  // 4. FieldCompletionCriteria 一覧
  const criteriaResult = await repositories.formRepository.findCompletionCriteriaBySchemaVersionId(
    schemaVersion.id
  )
  if (!criteriaResult.success) {
    return c.json({ error: 'Failed to load completion criteria' }, 500)
  }
  const completionCriteria = criteriaResult.value

  // 5. セッションID 生成
  const sessionId = crypto.randomUUID()

  // 6. SessionForm 構築
  const sessionForm: SessionForm = {
    fields: formFields.map((f) => ({
      id: f.id.value,
      fieldId: f.fieldId,
      label: f.label,
      intent: f.intent,
      required: f.required,
      sortOrder: f.sortOrder,
    })),
    facts: completionCriteria.map((c) => ({
      id: c.id.value,
      formFieldId: c.formFieldId.value,
      factKey: c.criteriaKey,
      fact: c.criteria,
      doneCriteria: c.doneCondition,
      questioningHints: c.questioningHints,
      boundaries: c.boundaries,
    })),
    completionMessage: form.completionMessage,
  }

  // 7. OrchestratorV3 初期化・開始
  const logger = new ConsoleLogger('[OrchestratorV3]')
  const orchestrator = new OrchestratorV3({
    kvStore: infrastructure.kvStore,
    registry: infrastructure.agentRegistry,
    provider: infrastructure.llmProvider,
    logger,
  })

  try {
    const result = await orchestrator.start(sessionId, sessionForm, { browserLanguage })

    return c.json(
      {
        data: {
          sessionId,
          greeting: result.responseText,
          stage: result.currentStage,
          askOptions: result.askOptions,
        },
      },
      201
    )
  } catch (error) {
    console.error('Failed to start V3 session:', error)
    return c.json({ error: 'Failed to start session' }, 500)
  }
})

export default app
