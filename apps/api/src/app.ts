import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { diMiddleware } from './middleware/di'
import { sessionMiddleware } from './middleware/session'
import { authRoutes } from './routes/auth'
import { eventLogRoutes } from './routes/event-logs'
import { formRoutes } from './routes/forms'
import GetHealth from './routes/health/get'
import GetHealthLive from './routes/health/live/get'
import GetHealthReady from './routes/health/ready/get'
import GetMe from './routes/me/get'
import { submissionRoutes } from './routes/submissions'
import { userRoutes } from './routes/users'
import { v3Routes } from './routes/v3'
import type { HonoEnv } from './types/hono'

const app = new OpenAPIHono<HonoEnv>()

// Middleware
app.use('*', logger())

// 動的CORS（c.envにアクセスするため）
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CLIENT_URL || 'http://localhost:3000',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
  return corsMiddleware(c, next)
})

// DI middleware (データベースとリポジトリを設定)
app.use('*', diMiddleware)

// Session middleware (認証ルート以外に適用)
app.use('*', sessionMiddleware)

// Routes
app.route('/health', GetHealth)
app.route('/health/live', GetHealthLive)
app.route('/health/ready', GetHealthReady)
app.route('/api/auth', authRoutes)
app.route('/me', GetMe)

// Domain API Routes
app.route('/api/forms', formRoutes)
app.route('/api/users', userRoutes)
app.route('/api/submissions', submissionRoutes)
app.route('/api/event-logs', eventLogRoutes)

// V3 API Routes (OrchestratorV3)
app.route('/api/v3', v3Routes)

// OpenAPI documentation
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: '@ding/api',
    version: '0.0.0',
    description: 'Ding API Documentation',
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Development server',
    },
  ],
})

// Swagger UI
app.get('/docs', swaggerUI({ url: '/openapi.json' }))

// 404 handler
app.notFound((c) => {
  console.log('[404] Not Found:', c.req.method, c.req.path)
  return c.json({ error: 'Not Found', method: c.req.method, path: c.req.path }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export { app }
