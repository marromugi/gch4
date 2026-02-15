import { OpenAPIHono } from '@hono/zod-openapi'
import SendMessage from './[sessionId]/messages/post'
import CreateSession from './post'
import type { HonoEnv } from '../../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', CreateSession)
app.route('/', SendMessage)

export { app as sessionRoutes }
