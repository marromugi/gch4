import { OpenAPIHono } from '@hono/zod-openapi'
import UpdateCollectedField from './[submissionId]/collected-fields/[fieldId]/put'
import SaveCollectedField from './[submissionId]/collected-fields/post'
import MarkConsentChecked from './[submissionId]/consent-checked/patch'
import GetSubmission from './[submissionId]/get'
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
app.route('/', MarkReviewCompleted)
app.route('/', MarkConsentChecked)

export { app as submissionRoutes }
