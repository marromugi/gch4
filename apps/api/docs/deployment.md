# Cloud Functions デプロイガイド

## 前提条件

- Google Cloud CLI (`gcloud`) がインストール済み
- プロジェクトが設定済み: `gcloud config set project <PROJECT_ID>`
- Cloud Functions API が有効化済み

## ビルド

```bash
cd apps/api
pnpm build:functions
```

これにより `dist/` ディレクトリに以下が生成されます:

- `functions.js` - エントリーポイント
- `app.js` - Honoアプリ本体
- `routes/` - ルートハンドラー
- `package.json` - 依存関係情報

## デプロイ

```bash
gcloud functions deploy ding-api \
  --gen2 \
  --runtime=nodejs22 \
  --region=asia-northeast1 \
  --trigger-http \
  --allow-unauthenticated \
  --source=dist \
  --entry-point=api
```

### オプション説明

| オプション                | 説明                                         |
| ------------------------- | -------------------------------------------- |
| `--gen2`                  | Cloud Functions 2nd gen（Cloud Runベース）   |
| `--runtime=nodejs22`      | Node.js 22 ランタイム                        |
| `--region`                | デプロイ先リージョン                         |
| `--trigger-http`          | HTTPトリガー                                 |
| `--allow-unauthenticated` | 認証なしでアクセス可能（本番環境では要検討） |
| `--source=dist`           | ソースディレクトリ                           |
| `--entry-point=api`       | エクスポートされた関数名                     |

## 環境変数の設定

```bash
gcloud functions deploy ding-api \
  --gen2 \
  --set-env-vars="DATABASE_URL=xxx,API_KEY=yyy" \
  ...
```

## デプロイ後の確認

```bash
# 関数のURLを取得
gcloud functions describe ding-api --gen2 --region=asia-northeast1 --format='value(serviceConfig.uri)'

# ヘルスチェック
curl https://<FUNCTION_URL>/health
```

## ログの確認

```bash
gcloud functions logs read ding-api --gen2 --region=asia-northeast1
```
