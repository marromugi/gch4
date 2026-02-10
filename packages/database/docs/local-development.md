# ローカル開発環境

## 概要

ローカル開発では Docker で `sqld` (libSQL サーバー) を起動し、HTTP経由でデータベースに接続します。

```
┌─────────────────┐     HTTP      ┌─────────────────┐
│  wrangler dev   │ ──────────→  │  sqld (Docker)  │
│  (Worker API)   │   :8081      │   Port 8081     │
│   Port 8080     │              │                 │
└─────────────────┘              └─────────────────┘
```

## セットアップ

### 1. Docker コンテナを起動

```bash
docker compose up -d
```

### 2. スキーマをプッシュ

```bash
DATABASE_URL=http://127.0.0.1:8081 pnpm --filter @ding/database db:push
```

### 3. API を起動

```bash
pnpm dev:api
```

## 環境変数

| 変数名                | ローカル開発            | 本番環境                |
| --------------------- | ----------------------- | ----------------------- |
| `DATABASE_URL`        | `http://127.0.0.1:8081` | `libsql://xxx.turso.io` |
| `DATABASE_AUTH_TOKEN` | 不要                    | 必要                    |

## Drizzle Studio

データベースの内容を確認するには:

```bash
DATABASE_URL=http://127.0.0.1:8081 pnpm --filter @ding/database db:studio
```

## トラブルシューティング

### sqld に接続できない

```bash
# コンテナの状態を確認
docker compose ps

# ヘルスチェック
curl http://127.0.0.1:8081/health
```

### データをリセットしたい

```bash
# コンテナを停止してデータを削除
docker compose down
rm -rf data/libsql

# 再起動
docker compose up -d
DATABASE_URL=http://127.0.0.1:8081 pnpm --filter @ding/database db:push
```
