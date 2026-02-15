import { OpenAPIHono } from '@hono/zod-openapi'
import AnswerSession from './[sessionId]/answer/post'
import GenerateFields from './[sessionId]/generate/post'
import GetSession from './[sessionId]/get'
import CreateSession from './post'
import type { HonoEnv } from '../../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', CreateSession)
app.route('/', GetSession)
app.route('/', AnswerSession)
app.route('/', GenerateFields)

export { app as designSessionRoutes }
