import { OpenAPIHono } from '@hono/zod-openapi'
import GetChatSessionFormData from './[applicationId]/chat/sessions/[sessionId]/form-data/get'
import GetChatSession from './[applicationId]/chat/sessions/[sessionId]/get'
import SendChatMessage from './[applicationId]/chat/sessions/[sessionId]/messages/post'
import CreateChatSession from './[applicationId]/chat/sessions/post'
import MarkConsentChecked from './[applicationId]/consent-checked/patch'
import UpdateExtractedField from './[applicationId]/extracted-fields/[fieldId]/put'
import SaveExtractedField from './[applicationId]/extracted-fields/post'
import MarkExtractionReviewed from './[applicationId]/extraction-reviewed/patch'
import GetApplication from './[applicationId]/get'
import ManualFallback from './[applicationId]/manual-fallback/post'
import UpdateStatus from './[applicationId]/status/patch'
import SubmitApplication from './[applicationId]/submit/post'
import CreateApplication from './post'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', CreateApplication)
app.route('/', GetApplication)
app.route('/', UpdateStatus)
app.route('/', SubmitApplication)
app.route('/', SaveExtractedField)
app.route('/', UpdateExtractedField)
app.route('/', ManualFallback)
app.route('/', CreateChatSession)
app.route('/', GetChatSession)
app.route('/', GetChatSessionFormData)
app.route('/', SendChatMessage)
app.route('/', MarkExtractionReviewed)
app.route('/', MarkConsentChecked)

export { app as applicationRoutes }
