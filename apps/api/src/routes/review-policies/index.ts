import { OpenAPIHono } from '@hono/zod-openapi'
import type { HonoEnv } from '../../types/hono'
import CreatePolicy from './post'
import GetPolicy from './[policyId]/get'
import PublishPolicy from './[policyId]/publish/post'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', CreatePolicy)
app.route('/', GetPolicy)
app.route('/', PublishPolicy)

export { app as reviewPolicyRoutes }
