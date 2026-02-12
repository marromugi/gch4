import { OpenAPIHono } from '@hono/zod-openapi'
import type { HonoEnv } from '../../types/hono'
import SaveExtractedField from './[applicationId]/post'
import UpdateExtractedField from './[applicationId]/[fieldId]/put'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', SaveExtractedField)
app.route('/', UpdateExtractedField)

export { app as extractedFieldRoutes }
