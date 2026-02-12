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
├── hooks/                      # ページ固有フック
│   ├── useXxx/
│   │   ├── useXxx.ts
│   │   └── index.ts
│   └── index.ts
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

## API 通信

### Orval 生成 Hook の使用

API 通信には `src/lib/api/generated/` に Orval で自動生成された hook を積極的に使用すること。自前で `fetch` や `axios` を直接呼び出さない。

```tsx
import { useGetJobs, useCreateJob } from '@/lib/api/generated'

// Good - Orval 生成 hook を使用
const { data, isLoading, error } = useGetJobs()
const { mutate: createJob } = useCreateJob()

// Bad - 直接 fetch を呼び出さない
const response = await fetch('/api/jobs')
```

## Storybook

### ファイル配置

Storybook ファイルはコンポーネントと同じディレクトリにコロケーションで配置する。

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.stories.tsx  # Storybook ファイル
└── index.ts
```

### MSW モックの活用

Storybook では Orval によって自動生成された MSW モックハンドラーを積極的に活用すること。`src/lib/api/generated/` 内に生成される MSW ハンドラーを使用することで、API レスポンスを簡単にモック化できる。

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { getGetJobsMock } from '@/lib/api/generated'
import { JobList } from './JobList'

const meta: Meta<typeof JobList> = {
  component: JobList,
  parameters: {
    msw: {
      handlers: [
        ...getGetJobsMock(), // Orval 生成モックを使用
      ],
    },
  },
}

export default meta
type Story = StoryObj<typeof JobList>

export const Default: Story = {}

// カスタムレスポンスが必要な場合
export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/jobs', () => {
          return HttpResponse.json([])
        }),
      ],
    },
  },
}
```

## UIコンポーネント

`@ding/ui` のコンポーネントを積極的に使用すること。

### テキスト

テキストの表示には必ず `Typography` コンポーネントを使用する。生の `<p>`, `<span>`, `<h1>` などは使用しない。

```tsx
import { Typography } from '@ding/ui'

// Good
<Typography variant="body" size="lg" weight="bold">本文テキスト</Typography>
<Typography variant="description" size="sm">説明テキスト</Typography>

// Props:
// - variant: 'body' | 'description' | 'alert' | 'disabled' | 'fill'
// - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
// - weight: 'normal' | 'medium' | 'semibold' | 'bold'
// - as: 'span' | 'p' | 'div' | 'label'

// Bad
<p>本文テキスト</p>
<span>説明テキスト</span>
```

### ボックス・レイアウト

`<div>` の代わりに `Box`、`Flex`、`Grid` コンポーネントを使用する。

#### Box

背景色、ボーダー、シャドウを持つコンテナに使用する。

```tsx
import { Box } from '@ding/ui'
;<Box background="surface" border="muted" elevation="low">
  コンテンツ
</Box>

// Props:
// - background: 'background' | 'surface' | 'muted' | 'subtle'
// - border: boolean | 'background' | 'surface' | 'muted' | 'subtle'
// - elevation: 'low' | 'mid' | 'high'
// - as: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav'
```

#### Flex

Flexbox レイアウトに使用する。

```tsx
import { Flex } from '@ding/ui'
;<Flex direction="column" justify="center" align="center" gap={4}>
  <Box>アイテム1</Box>
  <Box>アイテム2</Box>
</Flex>

// Props:
// - direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'
// - justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
// - align: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
// - wrap: 'nowrap' | 'wrap' | 'wrap-reverse'
// - gap: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
// - inline: boolean
// - as: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav'
```

#### Grid

グリッドレイアウトに使用する。

```tsx
import { Grid } from '@ding/ui'
;<Grid columns={3} gap={4}>
  <Box>アイテム1</Box>
  <Box>アイテム2</Box>
  <Box>アイテム3</Box>
</Grid>

// Props:
// - columns: 1 | 2 | 3 | 4 | 5 | 6
// - rows: 1 | 2 | 3 | 4 | 5 | 6
// - gap: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
// - flow: 'row' | 'column' | 'dense' | 'row-dense' | 'column-dense'
// - as: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav'
```

#### Bad

```tsx
// Bad - 生の div や style を使用しない
<div style={{ display: 'flex', gap: '16px', padding: '24px' }}>
  <div>コンテンツ</div>
</div>
```
