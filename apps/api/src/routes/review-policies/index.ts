import { OpenAPIHono } from '@hono/zod-openapi'
import GetPolicy from './[policyId]/get'
import PublishPolicy from './[policyId]/publish/post'
import CreatePolicy from './post'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', CreatePolicy)
app.route('/', GetPolicy)
app.route('/', PublishPolicy)

export { app as reviewPolicyRoutes }
