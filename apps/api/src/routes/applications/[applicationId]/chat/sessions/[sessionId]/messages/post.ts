import { ApplicationAgent } from '@ding/agent'
import { ApplicationId, ChatSessionId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  chatMessageResponseSchema,
  chatSessionResponseSchema,
  applicationTodoResponseSchema,
} from '../../../../../../../schemas/response'
import {
  serializeChatMessage,
  serializeChatSession,
  serializeApplicationTodo,
} from '../../../../../../../schemas/serializers'
import { buildAgentContext } from './buildAgentContext'
import { processAgentResult } from './processAgentResult'
import type { HonoEnv } from '../../../../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{applicationId}/chat/sessions/{sessionId}/messages',
  operationId: 'sendChatMessage',
  tags: ['Chat'],
  summary: 'Send a message in a chat session',
  request: {
    params: z.object({
      applicationId: z.string(),
      sessionId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Message processed',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              message: chatMessageResponseSchema,
              session: chatSessionResponseSchema,
              todos: z.array(applicationTodoResponseSchema),
              phase: z.enum(['bootstrap', 'questioning', 'fallback', 'wrapup']),
              isComplete: z.boolean(),
            }),
          }),
        },
      },
    },
    404: {
      description: 'Not found',
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
  const { applicationId, sessionId } = c.req.valid('param')
  const body = c.req.valid('json')

  const appId = ApplicationId.fromString(applicationId)
  const sessId = ChatSessionId.fromString(sessionId)

  // 1. Application 取得
  const appResult = await repositories.applicationRepository.findById(appId)
  if (!appResult.success) {
    return c.json({ error: 'Application not found' }, 404)
  }
  const application = appResult.value

  // 2. Job 取得
  const jobResult = await repositories.jobRepository.findById(application.jobId)
  if (!jobResult.success) {
    return c.json({ error: 'Job not found' }, 404)
  }
  const job = jobResult.value

  // 3. セッション取得
  const sessionsResult =
    await repositories.applicationRepository.findChatSessionsByApplicationId(appId)
  if (!sessionsResult.success) {
    return c.json({ error: 'Failed to load sessions' }, 500)
  }
  const session = sessionsResult.value.find((s) => s.id.equals(sessId))
  if (!session) {
    return c.json({ error: 'Chat session not found' }, 404)
  }

  // 4. 関連データ取得
  const [
    messagesResult,
    todosResult,
    formFieldsResult,
    factDefsResult,
    prohibitedResult,
    extractedFieldsResult,
  ] = await Promise.all([
    repositories.applicationRepository.findChatMessagesBySessionId(sessId),
    repositories.applicationRepository.findTodosByApplicationId(appId),
    repositories.jobRepository.findFormFieldsByJobId(application.jobId),
    repositories.jobRepository.findFactDefinitionsBySchemaVersionId(application.schemaVersionId),
    repositories.jobRepository.findProhibitedTopicsBySchemaVersionId(application.schemaVersionId),
    repositories.applicationRepository.findExtractedFieldsByApplicationId(appId),
  ])

  if (
    !messagesResult.success ||
    !todosResult.success ||
    !formFieldsResult.success ||
    !factDefsResult.success ||
    !prohibitedResult.success ||
    !extractedFieldsResult.success
  ) {
    return c.json({ error: 'Failed to load session data' }, 500)
  }

  // 5. Agent コンテキスト構築
  const agentContext = buildAgentContext({
    application,
    job,
    session,
    messages: messagesResult.value,
    todos: todosResult.value,
    formFields: formFieldsResult.value,
    factDefinitions: factDefsResult.value,
    prohibitedTopics: prohibitedResult.value,
  })

  // 6. Agent 実行
  const agent = new ApplicationAgent(infrastructure.llmProvider, {
    logDir: c.env.AGENT_LOG_DIR,
  })
  const agentResult = await agent.executeTurn(agentContext, body.message)

  // 7. 結果処理
  const { assistantMessage, updatedSession, updatedTodos } = await processAgentResult({
    result: agentResult,
    session,
    application,
    todos: todosResult.value,
    existingExtractedFields: extractedFieldsResult.value,
    userMessage: body.message,
    repositories,
  })

  return c.json(
    {
      data: {
        message: serializeChatMessage(assistantMessage),
        session: serializeChatSession(updatedSession),
        todos: updatedTodos.map(serializeApplicationTodo),
        phase: agentResult.phase,
        isComplete: agentResult.isComplete,
      },
    },
    200
  )
})

export default app
