import { OpenAPIHono } from '@hono/zod-openapi'
import UpdateExtractedField from './[applicationId]/[fieldId]/put'
import SaveExtractedField from './[applicationId]/post'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', SaveExtractedField)
app.route('/', UpdateExtractedField)

export { app as extractedFieldRoutes }
