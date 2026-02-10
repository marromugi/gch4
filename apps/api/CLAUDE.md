## Directory Guidelines

### `src/routes/`

APIエンドポイントの定義。HTTPメソッドごとにファイルを分割する。

- `get.ts` → GETリクエスト
- `post.ts` → POSTリクエスト
- `index.ts` → 同階層のルートをまとめてexport

### `src/middleware/`

Honoミドルウェア。リクエスト/レスポンスの共通処理。

- 認証、セッション管理、DI注入など

### `src/lib/`

ルートやミドルウェアから呼び出すユーティリティ関数。

- ビジネスロジックを含まない汎用処理

### `src/types/`

型定義。Honoのコンテキスト拡張やリポジトリの型など。
