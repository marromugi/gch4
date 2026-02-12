import { OpenAPIHono } from '@hono/zod-openapi'
import type { HonoEnv } from '../../types/hono'
import CreateJob from './post'
import ListJobs from './get'
import SuggestIdealCandidate from './suggest-ideal-candidate/post'
import SuggestCultureContext from './suggest-culture-context/post'
import SuggestFormFields from './suggest-form-fields/post'
import GetJob from './[jobId]/get'
import UpdateJob from './[jobId]/put'
import PublishJob from './[jobId]/publish/post'
import CloseJob from './[jobId]/close/post'
import GetFormFields from './[jobId]/form-fields/get'
import SaveFormFields from './[jobId]/form-fields/put'
import GetSchema from './[jobId]/schema/get'
import ApproveSchema from './[jobId]/schema/approve/post'
import ListApplications from './[jobId]/applications/get'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', CreateJob)
app.route('/', ListJobs)
app.route('/', SuggestIdealCandidate)
app.route('/', SuggestCultureContext)
app.route('/', SuggestFormFields)
app.route('/', GetJob)
app.route('/', UpdateJob)
app.route('/', PublishJob)
app.route('/', CloseJob)
app.route('/', GetFormFields)
app.route('/', SaveFormFields)
app.route('/', GetSchema)
app.route('/', ApproveSchema)
app.route('/', ListApplications)

export { app as jobRoutes }
