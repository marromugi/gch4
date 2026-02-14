import { OpenAPIHono } from '@hono/zod-openapi'
import RecordEventLog from './post'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', RecordEventLog)

export { app as eventLogRoutes }
