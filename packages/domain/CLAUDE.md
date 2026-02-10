# @ding/domain

ドメイン駆動設計（DDD）に基づくビジネスロジック層。

## ディレクトリ構造

```
src/
├── domain/              # ドメイン層
│   ├── shared/          # 共有基底クラス（Entity, Result）
│   ├── valueObject/     # 値オブジェクト
│   ├── entity/          # エンティティ
│   ├── repository/      # リポジトリインターフェース
│   └── service/         # ドメインサービス
├── infrastructure/      # インフラ層
│   ├── repository/      # リポジトリ実装
│   └── service/         # サービス実装
└── presentation/        # プレゼンテーション層
    └── usecase/         # ユースケース
```

## エクスポート

| パス                                | 説明                       |
| ----------------------------------- | -------------------------- |
| `@ding/domain`                      | メインエクスポート         |
| `@ding/domain/domain`               | ドメイン層全体             |
| `@ding/domain/domain/shared`        | Entity, Result             |
| `@ding/domain/domain/valueObject`   | 値オブジェクト             |
| `@ding/domain/domain/entity`        | エンティティ               |
| `@ding/domain/domain/repository`    | リポジトリインターフェース |
| `@ding/domain/domain/service`       | ドメインサービス           |
| `@ding/domain/infrastructure`       | インフラ層実装             |
| `@ding/domain/presentation/usecase` | ユースケース               |

## テスト

テストファイルはコロケーション（対象ファイルと同じディレクトリ）に配置。

```
src/domain/shared/
└── Result/
    └── Result.ts
    └── Result.test.ts
    └── index.ts
```

vitest の projects 機能で `unit` と `integration` を分離。

```bash
# unit テスト（DB不要）
pnpm --filter @ding/domain test

# integration テスト（テストDB必要）
pnpm --filter @ding/domain test:integration

# テストDB のリセット（スキーマ変更時）
pnpm db:test:reset
```

integration テストは Docker の `db-test` コンテナ（ポート 8082）を使用。
