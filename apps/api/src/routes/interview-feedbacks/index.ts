import { OpenAPIHono } from '@hono/zod-openapi'
import GetFeedback from './[feedbackId]/get'
import SaveFeedback from './post'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', SaveFeedback)
app.route('/', GetFeedback)

export { app as interviewFeedbackRoutes }
