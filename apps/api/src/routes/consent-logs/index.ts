import { OpenAPIHono } from '@hono/zod-openapi'
import SaveConsentLog from './post'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', SaveConsentLog)

export { app as consentLogRoutes }
