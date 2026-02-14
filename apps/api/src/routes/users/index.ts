import { OpenAPIHono } from '@hono/zod-openapi'
import ListJobsByUser from './[userId]/jobs/get'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', ListJobsByUser)

export { app as userRoutes }
