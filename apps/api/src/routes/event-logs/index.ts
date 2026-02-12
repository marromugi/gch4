import { OpenAPIHono } from '@hono/zod-openapi'
import type { HonoEnv } from '../../types/hono'
import RecordEventLog from './post'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', RecordEventLog)

export { app as eventLogRoutes }
