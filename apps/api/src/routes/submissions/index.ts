import { OpenAPIHono } from '@hono/zod-openapi'
import GetChatSessionFormData from './[submissionId]/chat/sessions/[sessionId]/form-data/get'
import GetChatSession from './[submissionId]/chat/sessions/[sessionId]/get'
import SendChatMessage from './[submissionId]/chat/sessions/[sessionId]/messages/post'
import CreateChatSession from './[submissionId]/chat/sessions/post'
import UpdateCollectedField from './[submissionId]/collected-fields/[fieldId]/put'
import SaveCollectedField from './[submissionId]/collected-fields/post'
import MarkConsentChecked from './[submissionId]/consent-checked/patch'
import GetSubmission from './[submissionId]/get'
import ManualFallback from './[submissionId]/manual-fallback/post'
import MarkReviewCompleted from './[submissionId]/review-completed/patch'
import UpdateStatus from './[submissionId]/status/patch'
import SubmitSubmission from './[submissionId]/submit/post'
import CreateSubmission from './post'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', CreateSubmission)
app.route('/', GetSubmission)
app.route('/', UpdateStatus)
app.route('/', SubmitSubmission)
app.route('/', SaveCollectedField)
app.route('/', UpdateCollectedField)
app.route('/', ManualFallback)
app.route('/', CreateChatSession)
app.route('/', GetChatSession)
app.route('/', GetChatSessionFormData)
app.route('/', SendChatMessage)
app.route('/', MarkReviewCompleted)
app.route('/', MarkConsentChecked)

export { app as submissionRoutes }
