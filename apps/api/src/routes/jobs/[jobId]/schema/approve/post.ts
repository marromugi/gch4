import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ApplicationAgent } from '@ding/agent'
import { ApproveJobSchemaVersion } from '@ding/domain'
import { FieldFactDefinition } from '@ding/domain/domain/entity'
import { ProhibitedTopic } from '@ding/domain/domain/entity'
import { FieldFactDefinitionId } from '@ding/domain/domain/valueObject'
import { JobFormFieldId } from '@ding/domain/domain/valueObject'
import { JobId } from '@ding/domain/domain/valueObject'
import { JobSchemaVersionId } from '@ding/domain/domain/valueObject'
import type { HonoEnv } from '../../../../../types/hono'
import { jobSchemaVersionResponseSchema } from '../../../../../schemas/response'
import { serializeJobSchemaVersion } from '../../../../../schemas/serializers'

const route = createRoute({
  method: 'post',
  path: '/{jobId}/schema/approve',
  operationId: 'approveJobSchemaVersion',
  tags: ['Job'],
  summary: 'Approve a job schema version',
  request: {
    params: z.object({
      jobId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            schemaVersionId: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Schema version approved',
      content: {
        'application/json': {
          schema: z.object({
            data: jobSchemaVersionResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
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
  const { jobId } = c.req.valid('param')
  const body = c.req.valid('json')

  // 1. スキーマ承認
  const usecase = new ApproveJobSchemaVersion(repositories.jobRepository)
  const result = await usecase.execute({
    jobId,
    schemaVersionId: body.schemaVersionId,
  })

  if (!result.success) {
    return c.json({ error: result.error.message }, 400)
  }

  const schemaVersion = result.value.schemaVersion

  // 2. FormField 取得
  const formFieldsResult = await repositories.jobRepository.findFormFieldsByJobId(
    JobId.fromString(jobId)
  )
  if (!formFieldsResult.success) {
    return c.json({ error: 'Failed to load form fields' }, 400)
  }
  const formFields = formFieldsResult.value

  // 3. Job 取得（LLM コンテキスト用）
  const jobResult = await repositories.jobRepository.findById(JobId.fromString(jobId))
  if (!jobResult.success) {
    return c.json({ error: 'Job not found' }, 400)
  }
  const job = jobResult.value

  // 4. LLM で FieldFactDefinition を生成
  const agent = new ApplicationAgent(infrastructure.llmProvider, {
    logDir: c.env.AGENT_LOG_DIR,
  })

  const fieldDefs = await agent.generateFieldDefinitions(
    formFields.map((f) => ({
      fieldId: f.id.value,
      label: f.label,
      intent: f.intent ?? '',
      required: f.required,
    })),
    {
      jobTitle: job.title,
      idealCandidate: job.idealCandidate ?? undefined,
      cultureContext: job.cultureContext ?? undefined,
    }
  )

  // 5. FieldFactDefinition エンティティを生成・保存
  const now = new Date()
  const schemaVersionId = JobSchemaVersionId.fromString(body.schemaVersionId)
  const factDefinitions: FieldFactDefinition[] = []
  const prohibitedTopics: ProhibitedTopic[] = []

  for (const fieldDef of fieldDefs) {
    const jobFormFieldId = JobFormFieldId.fromString(fieldDef.fieldId)

    // requiredFacts と doneCriteria は同じインデックスで対応
    fieldDef.requiredFacts.forEach((fact, idx) => {
      factDefinitions.push(
        FieldFactDefinition.create({
          id: FieldFactDefinitionId.fromString(crypto.randomUUID()),
          schemaVersionId,
          jobFormFieldId,
          factKey: `${fieldDef.fieldId}_fact_${idx}`,
          fact,
          doneCriteria: fieldDef.doneCriteria[idx] ?? fact,
          questioningHints: null,
          sortOrder: idx,
          createdAt: now,
        })
      )
    })

    // ProhibitedTopic
    for (const topic of fieldDef.prohibitedTopics) {
      prohibitedTopics.push(
        ProhibitedTopic.create({
          id: crypto.randomUUID(),
          schemaVersionId,
          jobFormFieldId,
          topic,
          createdAt: now,
        })
      )
    }
  }

  if (factDefinitions.length > 0) {
    const saveResult = await repositories.jobRepository.saveFactDefinitions(factDefinitions)
    if (!saveResult.success) {
      console.error('Failed to save fact definitions:', saveResult.error)
    }
  }

  if (prohibitedTopics.length > 0) {
    const saveResult = await repositories.jobRepository.saveProhibitedTopics(prohibitedTopics)
    if (!saveResult.success) {
      console.error('Failed to save prohibited topics:', saveResult.error)
    }
  }

  // 6. 質問戦略を生成して questioningHints を更新
  try {
    const strategyResult = await agent.generateQuestioningStrategy(
      factDefinitions.map((fd) => ({
        factKey: fd.factKey,
        fact: fd.fact,
        doneCriteria: fd.doneCriteria,
      })),
      {
        jobTitle: job.title,
        idealCandidate: job.idealCandidate ?? undefined,
        cultureContext: job.cultureContext ?? undefined,
      }
    )

    // questioningHints を付与した FieldFactDefinition を再保存
    const updatedDefs = factDefinitions.map((fd) => {
      const strategy = strategyResult.facts.find((s) => s.factKey === fd.factKey)
      if (!strategy || strategy.category === 'factual') return fd

      const hints = strategy.warmupSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')

      return FieldFactDefinition.create({
        ...fd,
        id: fd.id,
        schemaVersionId: fd.schemaVersionId,
        jobFormFieldId: fd.jobFormFieldId,
        factKey: fd.factKey,
        fact: fd.fact,
        doneCriteria: fd.doneCriteria,
        questioningHints: hints || null,
        sortOrder: fd.sortOrder,
        createdAt: fd.createdAt,
      })
    })

    await repositories.jobRepository.saveFactDefinitions(updatedDefs)
  } catch (error) {
    // 質問戦略の生成失敗は致命的でないので続行
    console.error('Failed to generate questioning strategy:', error)
  }

  return c.json({ data: serializeJobSchemaVersion(schemaVersion) }, 200)
})

export default app
