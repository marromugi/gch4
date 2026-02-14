import { OpenAPIHono } from '@hono/zod-openapi'
import CloseForm from './[formId]/close/post'
import GetFormFields from './[formId]/fields/get'
import SaveFormFields from './[formId]/fields/put'
import GetForm from './[formId]/get'
import PublishForm from './[formId]/publish/post'
import UpdateForm from './[formId]/put'
import ApproveSchema from './[formId]/schema/approve/post'
import GetSchema from './[formId]/schema/get'
import ListFormSubmissions from './[formId]/submissions/get'
import ListForms from './get'
import CreateForm from './post'
import SuggestFormFields from './suggest-fields/post'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', CreateForm)
app.route('/', ListForms)
app.route('/', SuggestFormFields)
app.route('/', GetForm)
app.route('/', UpdateForm)
app.route('/', PublishForm)
app.route('/', CloseForm)
app.route('/', GetFormFields)
app.route('/', SaveFormFields)
app.route('/', GetSchema)
app.route('/', ApproveSchema)
app.route('/', ListFormSubmissions)

export { app as formRoutes }
