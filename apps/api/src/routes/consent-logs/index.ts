import { OpenAPIHono } from '@hono/zod-openapi'
import type { HonoEnv } from '../../types/hono'
import SaveConsentLog from './post'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', SaveConsentLog)

export { app as consentLogRoutes }
