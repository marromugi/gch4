import { OpenAPIHono } from '@hono/zod-openapi'
import ListFormsByUser from './[userId]/forms/get'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/', ListFormsByUser)

export { app as userRoutes }
