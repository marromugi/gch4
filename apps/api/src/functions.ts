import { onRequest } from 'firebase-functions/v2/https'
import { app } from './app'

// Cloud Functions Gen2 用のエントリーポイント
// Hono の fetch を Cloud Functions のリクエスト/レスポンスに変換
export const api = onRequest(
  {
    region: 'asia-northeast1',
    memory: '256MiB',
    timeoutSeconds: 60,
    minInstances: 0,
    maxInstances: 100,
  },
  async (req, res) => {
    // Node.js の IncomingMessage を Fetch API の Request に変換
    const url = new URL(req.url || '/', `https://${req.headers.host}`)

    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value)
      }
    }

    // rawBody は Buffer なので、Uint8Array に変換して BodyInit として使用可能にする
    const rawBody = req.rawBody
    const body =
      req.method !== 'GET' && req.method !== 'HEAD' && rawBody ? new Uint8Array(rawBody) : undefined

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    })

    // Hono アプリで処理
    const response = await app.fetch(request, {
      // 環境変数を c.env として渡す
      DATABASE_URL: process.env.DATABASE_URL || '',
      DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN || '',
      CLIENT_URL: process.env.CLIENT_URL || '',
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      GEMINI_MODEL: process.env.GEMINI_MODEL || '',
      // KVStore 設定（Firebase 環境ではデフォルトで firestore）
      KV_STORE_TYPE: process.env.KV_STORE_TYPE || 'firestore',
      FIRESTORE_PROJECT_ID: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '',
      FIRESTORE_DATABASE_ID: process.env.FIRESTORE_DATABASE_ID || '(default)',
      FIRESTORE_COLLECTION_NAME: process.env.FIRESTORE_COLLECTION_NAME || 'kv-store',
    })

    // Fetch API の Response を Express の res に変換
    res.status(response.status)

    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    const responseBody = await response.arrayBuffer()
    res.send(Buffer.from(responseBody))
  }
)
