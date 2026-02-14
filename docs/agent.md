# フォーム回答エージェント設計

## 概要

回答者との対話を通じてフォームを埋めるエージェントシステム。
複数の専門エージェントが連携し、効率的にフォームを収集する。

## エージェント一覧

| 名前        | 役割                         | tools                                                |
| ----------- | ---------------------------- | ---------------------------------------------------- |
| Greeter     | 最初の挨拶・言語・居住国確認 | `ask`, `set_language`, `set_country`, `set_timezone` |
| Architect   | インタビュー全体の設計       | `create_plan`                                        |
| Interviewer | インタビューの指揮者         | `subtask(reviewer)`, `ask`                           |
| Reviewer    | 回答の充足確認               | `review`                                             |

## フロー図

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Greeter                                                      │
│    tools: ask, set_language, set_country, set_timezone          │
│    「最初の挨拶・言語・居住国・タイムゾーン確認」                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Architect                                                    │
│    tool: create_plan → Field[]                                  │
│    「インタビュー全体の設計（フィールドの順序決定）」                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Interviewer ← システムが現在のfieldを注入                     │
│    tools:                                                       │
│      - subtask(reviewer)                                        │
│      - ask                                                      │
│    「インタビューを進める指揮者」                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 質問フロー（すべての質問で共通）                                   │
│                                                                 │
│  ask → subtask(reviewer)                                        │
│         │                                                       │
│         ↓                                                       │
│  ┌────────────────────┐                                         │
│  │ Reviewer           │                                         │
│  │ - passed: true     │ → 次フィールドへ                         │
│  │ - passed: false    │                                         │
│  │   + missingFacts   │                                         │
│  └────────────────────┘                                         │
│         │                                                       │
│         └───── フォローアップ質問を生成 → ask → ...               │
│                                                                 │
│  ※ 深掘りが必要な質問は Reviewer の missingFacts を基に            │
│    自然なフォローアップ質問を生成する                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              全フィールド完了 → 確認画面へ
```

## 各エージェント詳細

### Greeter

**役割**: 最初の挨拶と言語・居住国・タイムゾーンの確認を行う。

**tools**:

- `ask`: ユーザーに質問やメッセージを送る
- `set_language`: 回答者の使用言語を設定する
- `set_country`: 回答者の居住国を設定する
- `set_timezone`: 居住国からタイムゾーンを推測して設定する

**動作**:

1. 回答者に挨拶する
2. 使用言語を確認し、`set_language` で設定
3. 居住国を確認し、`set_country` で設定
4. `set_timezone` でタイムゾーンを自動推測（失敗時は Asia/Tokyo にフォールバック）
5. 完了後、Architect に制御を渡す

**State 導出**:

セクションは State から導出する（明示的な状態管理は不要）:

```typescript
function getSection(state: State): Section {
  if (!state.language) return 'language'
  if (!state.country) return 'country'
  if (!state.timezone) return 'timezone'
  return 'completed'
}
```

---

### Architect

**役割**: フィールド定義を元に、インタビュー全体の順序を設計する。

**tools**:

- `create_plan`: フィールドの配列を返す

**動作**:

1. フォームのフィールド定義を読み込む
2. インタビューの順序を決定する
3. `create_plan` でプランを出力する（Zod でパース）
4. 完了後、Interviewer に制御を渡す

**出力スキーマ**:

```typescript
const PlanSchema = z.object({
  fields: z.array(
    z.object({
      field_id: z.string(),
      label: z.string(),
      intent: z.string(),
      required: z.boolean(),
    })
  ),
})
```

---

### Interviewer

**役割**: インタビューのオーケストレーター。Reviewer を呼び出しながら進行する。

**tools**:

- `subtask(reviewer)`: Reviewer をサブセッションで起動
- `ask`: 回答者に質問する

**動作**:

1. システムから現在の field を受け取る
2. `ask` で質問
3. 回答後、`subtask(reviewer)` で Reviewer を起動
4. Reviewer の結果を処理:
   - `passed: true` → 次の field へ進む
   - `passed: false` + `missingFacts` → フォローアップ質問を生成
5. フォローアップ質問も同様に ask → reviewer のフローを繰り返す
6. 全 field 完了後、確認画面へ誘導

**深掘りの仕組み**:

- 深掘りが必要な質問では、Reviewer が `missingFacts` を返す
- Interviewer は `missingFacts` を基に自然なフォローアップ質問を生成
- LLM の会話能力を活かし、形式的なステップ管理なしで自然な深掘りを実現

---

### Reviewer

**役割**: 回答が field の要件を満たしているか確認する。

**tools**:

- `review`: 回答の充足を確認し、結果を返す

**動作**:

1. 収集した回答と field 定義を照合
2. `criteria` が満たされているか確認
3. `done_condition` を満たしているか確認
4. 不足があれば feedback を返す
5. OK ならパスを返す

**出力**:

```typescript
const ReviewResultSchema = z.object({
  passed: z.boolean(),
  feedback: z.string().optional(),
  missing_facts: z.array(z.string()).optional(),
  extracted_facts: z.array(z.string()).optional(),
  field_value: z.string().optional(),
})
```

---

## サブセッションのコンテキスト引き継ぎ

サブエージェントを起動する際、以下の情報をサマリーテキストとして渡す:

- これまでの会話の要約
- 現在の field 情報
- 収集済みの facts

## 状態遷移

各 field に対する状態は以下の通り:

```
pending → interviewing → reviewing → done
                ↑            │
                └────────────┘
                (feedback あり)
```

## 不変条件

- `reviewer` を通さないと次の field に進めない
- `required` な field がすべて `done` でなければ回答確定できない

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                           │
│  - データ取得（Submission, Session, Messages）               │
│  - Orchestrator 呼び出し                                    │
│  - 結果の永続化（Repository 経由）                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      OrchestratorV2                         │
│  - KV Store によるセッション状態管理                         │
│  - エージェント制御・遷移                                    │
│  - サブセッション管理                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       BaseAgent                             │
│  - runAgentLoop: ask が呼ばれるまでループ                    │
│  - ツール結果（エラー含む）を LLM にフィードバック             │
│  - 最大ループ回数の制限                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Agents                                │
│  ┌─────────┐ ┌───────────┐ ┌──────────────┐ ┌──────────┐   │
│  │ Greeter │ │ Architect │ │ Interviewer  │ │ Reviewer │   │
│  └─────────┘ └───────────┘ └──────────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## エージェントループ機構

### 基本方針

- **ask が呼ばれるまでループ**: ユーザーへの応答が必要になるまで内部でツール呼び出しを繰り返す
- **ツール結果を LLM にフィードバック**: 成功/エラー問わず結果を LLM に返し、次のアクションを決定させる
- **最大ループ回数**: 無限ループ防止（デフォルト10回）
- **残タスク注入**: ツール呼び出しがない場合、残タスクを確認してプロンプトに注入

### ループの流れ

```
1. LLM 呼び出し（chatWithTools）
2. ツール呼び出しがあれば実行
   - ask の場合 → ループ終了、ユーザー応答待ち
   - その他 → ツール結果を履歴に追加
3. ツール呼び出しがない場合:
   - 残タスクを確認（getRemainingTasks）
   - 残タスクがあれば「You still need to: ...」を注入して再度 LLM 呼び出し
   - 残タスクがなければ終了
4. 2-3 を繰り返す（最大N回）
5. 最大回数に達したらエラー
```

### 残タスク注入（フォールバック機構）

LLM がツールを呼ばずにテキストだけ返した場合、残タスクを注入して再度呼び出す:

```typescript
// BaseAgent
protected abstract getRemainingTasks(state: State): string[]

// GreeterAgent の実装例
protected getRemainingTasks(state: State): string[] {
  const tasks: string[] = []
  if (!state.language) tasks.push('Set the user language using set_language')
  if (!state.country) tasks.push('Set the user country using set_country')
  if (!state.timezone) tasks.push('Set the timezone using set_timezone')
  return tasks
}
```

### runAgentLoop の結果

```typescript
interface AgentLoopResult {
  responseText: string // ユーザーへのレスポンス
  toolCalls: ToolCallResult[] // 実行されたツール呼び出し
  awaitingUserResponse: boolean // ユーザーの応答待ちか
  state: State // 更新後の状態
  usage?: TokenUsage // トークン使用量
}
```

---

## Logger

デバッグ用の Logger インターフェースを提供。

### インターフェース

```typescript
interface ILogger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
}

interface LogContext {
  agent?: string
  sessionId?: string
  tool?: string
  [key: string]: unknown
}
```

### 実装

- **ConsoleLogger**: タイムスタンプ付きのコンソール出力（開発用）
- **NoOpLogger**: 何も出力しない（デフォルト/テスト用）

---

## エージェント遷移

OrchestratorV2 が管理するエージェント間の遷移ルール:

```typescript
private getNextAgent(currentAgent: AgentType, state: State): AgentType | null {
  switch (currentAgent) {
    case 'greeter':
      return 'architect'      // Greeter → Architect
    case 'architect':
      return 'interviewer'    // Architect → Interviewer
    case 'interviewer':
      return null             // Interviewer で終了 or reviewer を経由
    case 'reviewer':
      return 'interviewer'    // Reviewer → Interviewer
    default:
      return null
  }
}
```

---

## KV Store ベースの状態管理

### MainSessionState

```typescript
interface MainSessionState {
  sessionId: string
  agentStack: AgentStackEntry[]
  messages: LLMMessage[]
  subSessionResults: Record<string, unknown>
  bootstrap: {
    language?: string
    country?: string
    timezone?: string
  }
  form: SessionForm
  plan?: unknown
  currentFieldIndex: number
  collectedFields: Record<string, string>
  followUpCount: number
  createdAt: number
  updatedAt: number
}
```

### SessionForm

```typescript
interface SessionForm {
  fields: FormField[]
  facts: FactDefinition[]
}

interface FormField {
  id: string
  fieldId: string
  label: string
  intent: string | null
  required: boolean
  sortOrder: number
}

interface FactDefinition {
  id: string
  formFieldId: string
  factKey: string
  fact: string
  doneCriteria: string
  questioningHints: string | null
}
```
