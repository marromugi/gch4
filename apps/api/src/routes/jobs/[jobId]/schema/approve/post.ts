import { ApproveJobSchemaVersion } from '@ding/domain'
import { FieldFactDefinition, ProhibitedTopic } from '@ding/domain/domain/entity'
import {
  FieldFactDefinitionId,
  JobFormFieldId,
  JobId,
  JobSchemaVersionId,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { jobSchemaVersionResponseSchema } from '../../../../../schemas/response'
import { serializeJobSchemaVersion } from '../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../types/hono'

// FieldDefinition 生成用のスキーマ
const fieldDefinitionSchema = {
  type: 'object',
  properties: {
    definitions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fieldId: { type: 'string' },
          requiredFacts: { type: 'array', items: { type: 'string' } },
          doneCriteria: { type: 'array', items: { type: 'string' } },
          prohibitedTopics: { type: 'array', items: { type: 'string' } },
        },
        required: ['fieldId', 'requiredFacts', 'doneCriteria', 'prohibitedTopics'],
      },
    },
  },
  required: ['definitions'],
}

// 質問戦略生成用のスキーマ
const questioningStrategySchema = {
  type: 'object',
  properties: {
    facts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          factKey: { type: 'string' },
          category: { type: 'string', enum: ['factual', 'exploratory'] },
          warmupSteps: { type: 'array', items: { type: 'string' } },
        },
        required: ['factKey', 'category', 'warmupSteps'],
      },
    },
  },
  required: ['facts'],
}

interface FieldDefinitionResult {
  definitions: Array<{
    fieldId: string
    requiredFacts: string[]
    doneCriteria: string[]
    prohibitedTopics: string[]
  }>
}

interface QuestioningStrategyResult {
  facts: Array<{
    factKey: string
    category: 'factual' | 'exploratory'
    warmupSteps: string[]
  }>
}

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
  const llmProvider = infrastructure.llmProvider

  const fieldDefinitionPrompt = `
あなたは採用面接の質問設計の専門家です。
以下のフォームフィールド情報と求人情報をもとに、各フィールドについて収集すべき事実（required_facts）、完了条件（done_criteria）、禁止トピック（prohibited_topics）を生成してください。

## 求人情報
- タイトル: ${job.title}
- 理想の候補者像: ${job.idealCandidate ?? '未設定'}
- カルチャー背景: ${job.cultureContext ?? '未設定'}

## フォームフィールド
${formFields.map((f) => `- fieldId: ${f.id.value}, label: ${f.label}, intent: ${f.intent ?? '未設定'}, required: ${f.required}`).join('\n')}

## 出力要件
各フィールドについて以下を生成してください：
- requiredFacts: そのフィールドで収集すべき具体的な事実のリスト（1〜3個）
- doneCriteria: 各 requiredFact に対応する完了条件（requiredFacts と同じ数）
- prohibitedTopics: 聞いてはいけない話題（0〜2個）

JSON形式で出力してください。
`

  const fieldDefsResponse = await llmProvider.generateStructuredOutput<FieldDefinitionResult>(
    fieldDefinitionPrompt,
    {
      responseSchema: fieldDefinitionSchema,
    }
  )

  const fieldDefs = fieldDefsResponse.data.definitions

  // 5. FieldFactDefinition エンティティを生成・保存
  const now = new Date()
  const schemaVersionId = JobSchemaVersionId.fromString(body.schemaVersionId)
  const factDefinitions: FieldFactDefinition[] = []
  const prohibitedTopics: ProhibitedTopic[] = []

  for (const fieldDef of fieldDefs) {
    const jobFormFieldId = JobFormFieldId.fromString(fieldDef.fieldId)

    // requiredFacts と doneCriteria は同じインデックスで対応
    fieldDef.requiredFacts.forEach((fact: string, idx: number) => {
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
    const strategyPrompt = `
あなたは採用面接の質問設計の専門家です。
以下の事実定義について、それぞれの質問戦略を生成してください。

## 求人情報
- タイトル: ${job.title}
- 理想の候補者像: ${job.idealCandidate ?? '未設定'}
- カルチャー背景: ${job.cultureContext ?? '未設定'}

## 事実定義
${factDefinitions.map((fd) => `- factKey: ${fd.factKey}, fact: ${fd.fact}, doneCriteria: ${fd.doneCriteria}`).join('\n')}

## 出力要件
各事実について以下を判定してください：
- category: "factual"（単純な事実確認）または "exploratory"（深掘りが必要）
- warmupSteps: exploratory の場合、段階的に深掘りするためのステップ（1〜3個）。factual の場合は空配列。

JSON形式で出力してください。
`

    const strategyResponse = await llmProvider.generateStructuredOutput<QuestioningStrategyResult>(
      strategyPrompt,
      {
        responseSchema: questioningStrategySchema,
      }
    )

    const strategyResult = strategyResponse.data

    // questioningHints を付与した FieldFactDefinition を再保存
    const updatedDefs = factDefinitions.map((fd) => {
      const strategy = strategyResult.facts.find(
        (s: QuestioningStrategyResult['facts'][number]) => s.factKey === fd.factKey
      )
      if (!strategy || strategy.category === 'factual') return fd

      const hints = strategy.warmupSteps
        .map((step: string, i: number) => `${i + 1}. ${step}`)
        .join('\n')

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
