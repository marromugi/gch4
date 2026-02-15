import { OpenAPIHono } from '@hono/zod-openapi'
import { sessionRoutes } from './sessions'
import type { HonoEnv } from '../../types/hono'

const app = new OpenAPIHono<HonoEnv>()

app.route('/sessions', sessionRoutes)

export { app as v3Routes }
