import { OpenAPIHono } from '@hono/zod-openapi'
import type { HonoEnv } from '../../types/hono'
import SaveFeedback from './post'
import GetFeedback from './[feedbackId]/get'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', SaveFeedback)
app.route('/', GetFeedback)

export { app as interviewFeedbackRoutes }
