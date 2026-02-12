import { OpenAPIHono } from '@hono/zod-openapi'
import type { HonoEnv } from '../../types/hono'
import ListJobsByUser from './[userId]/jobs/get'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', ListJobsByUser)

export { app as userRoutes }
