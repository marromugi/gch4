# Web App

Vite + React 19 + TanStack Router のWebアプリケーション。

## ディレクトリ構造

```
src/
├── components/pages/   # ページコンポーネント
├── hooks/              # カスタムフック
├── lib/
│   ├── api/           # APIクライアント
│   │   ├── generated/ # Orval自動生成
│   │   └── hooks/     # API用カスタムフック
│   ├── auth/          # 認証ロジック
│   └── hook-form/     # フォームユーティリティ
├── routes/            # TanStack Router ルートファイル
├── main.tsx           # エントリーポイント
└── router.ts          # ルーター設定
```

## コンポーネント配置

ページ固有のコンポーネントはコロケーションで配置する（該当ページと同じディレクトリに配置）。

```
src/components/pages/Settings/
├── index.ts                    # エクスポート
├── SettingsPage.tsx            # ページ本体
├── const.ts                    # 定数
├── type.ts                     # 型定義
├── util.ts                     # ユーティリティ
├── schema.ts                   # フォームスキーマ
├── hook.ts                     # ページ固有フック
└── SettingsForm/               # ページ固有コンポーネント
    ├── index.ts
    ├── SettingsForm.tsx
    ├── SettingsForm.stories.tsx
    ├── const.ts
    ├── type.ts
    ├── schema.ts
    └── hook.ts
```

## 開発コマンド

```bash
pnpm dev      # 開発サーバー起動
pnpm build    # ビルド
```

## ページ追加手順

1. `src/components/pages/` にコンポーネント作成
2. `src/routes/` にルートファイル作成
