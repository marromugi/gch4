## Directory Guidelines

### `src/routes/`

APIエンドポイントの定義。`@hono/zod-openapi` を使用してルートを定義する。

| ファイル   | 役割                           |
| ---------- | ------------------------------ |
| `get.ts`   | GETリクエストハンドラ          |
| `post.ts`  | POSTリクエストハンドラ         |
| `put.ts`   | PUTリクエストハンドラ          |
| `index.ts` | 同階層のルートをまとめてexport |

#### ルート定義パターン

```typescript
import { createRoute, z } from '@hono/zod-openapi'

// 1. Zodスキーマを定義
const ParamsSchema = z.object({
  id: z.string().openapi({ example: '123' }),
})

const ResponseSchema = z
  .object({
    data: z.object({ id: z.string(), name: z.string() }),
  })
  .openapi('ResourceResponse')

// 2. createRouteでOpenAPIメタデータ付きルートを作成
export const route = createRoute({
  method: 'get',
  path: '/resources/{id}',
  request: { params: ParamsSchema },
  responses: {
    200: {
      content: { 'application/json': { schema: ResponseSchema } },
      description: 'Success',
    },
  },
})

// 3. app.openapiでハンドラを登録
app.openapi(route, async (c) => {
  const { id } = c.req.valid('param')
  return c.json({ data: { id, name: 'example' } }, 200)
})
```

### `src/middleware/`

Honoミドルウェア。リクエスト/レスポンスの共通処理。

- 認証、セッション管理、DI注入など

### `src/lib/`

ルートやミドルウェアから呼び出すユーティリティ関数。

- ビジネスロジックを含まない汎用処理

### `src/types/`

型定義。Honoのコンテキスト拡張やリポジトリの型など。
