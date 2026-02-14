# 応募エージェント設計

## 概要

応募者との対話を通じてフォームを埋めるエージェントシステム。
複数の専門エージェントが連携し、コンプライアンスを守りながらインタビューを進行する。

## エージェント一覧

| 名前        | 役割                         | tools                                                |
| ----------- | ---------------------------- | ---------------------------------------------------- |
| Greeter     | 最初の挨拶・言語・居住国確認 | `ask`, `set_language`, `set_country`, `set_timezone` |
| Architect   | インタビュー全体の設計       | `create_plan`                                        |
| Interviewer | インタビューの指揮者         | `subtask(*)`, `ask`                                  |
| Reviewer    | 回答の充足確認               | `review`                                             |
| QuickCheck  | 質問前の簡易コンプラチェック | `result`                                             |
| Auditor     | 最終監査                     | `result`                                             |

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
│      - subtask(quick_check)                                     │
│      - subtask(auditor)                                         │
│      - ask                                                      │
│    「インタビューを進める指揮者」                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 質問フロー（すべての質問で共通）                                   │
│                                                                 │
│  subtask(quick_check) → ask → subtask(reviewer)                 │
│         ↑                             │                         │
│         │                             ↓                         │
│         │                    ┌────────────────────┐             │
│         │                    │ Reviewer           │             │
│         │                    │ - passed: true     │ → 次フィールド│
│         │                    │ - passed: false    │             │
│         │                    │   + missingFacts   │             │
│         │                    └────────────────────┘             │
│         │                             │                         │
│         └───── フォローアップ質問 ─────┘                          │
│                                                                 │
│  ※ 深掘りが必要な質問は Reviewer の missingFacts を基に            │
│    自然なフォローアップ質問を生成する                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Reviewer                                                     │
│    tool: review                                                 │
│    ├→ 不足あり → Interviewer に feedback                         │
│    └→ OK → 次のフィールドへ                                      │
│    「回答の充足をレビュー」                                        │
└─────────────────────────────────────────────────────────────────┘
                           ↓ (全フィールド完了)
┌─────────────────────────────────────────────────────────────────┐
│ 5. Auditor                                                      │
│    tool: result                                                 │
│    └→ システムがユーザーに結果を返す                              │
│    「最終監査」                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 各エージェント詳細

### Greeter

**役割**: 最初の挨拶と言語・居住国・タイムゾーンの確認を行う。

**tools**:

- `ask`: ユーザーに質問やメッセージを送る
- `set_language`: 応募者の使用言語を設定する
- `set_country`: 応募者の居住国を設定する
- `set_timezone`: 居住国からタイムゾーンを推測して設定する

**動作**:

1. 応募者に挨拶する
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

1. 求人のフィールド定義を読み込む
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

**役割**: インタビューのオーケストレーター。各サブエージェントを呼び出しながら進行する。

**tools**:

- `subtask(reviewer)`: Reviewer をサブセッションで起動
- `subtask(quick_check)`: QuickCheck をサブセッションで起動
- `subtask(auditor)`: Auditor をサブセッションで起動
- `ask`: 応募者に質問する

**動作**:

1. システムから現在の field を受け取る
2. `subtask(quick_check)` でコンプラチェック
3. チェック通過後、`ask` で質問
4. 回答後、`subtask(reviewer)` で Reviewer を起動
5. Reviewer の結果を処理:
   - `passed: true` → 次の field へ進む
   - `passed: false` + `missingFacts` → フォローアップ質問を生成
6. フォローアップ質問も同様に quick_check → ask → reviewer のフローを繰り返す
7. 全 field 完了後、`subtask(auditor)` で Auditor を起動

**深掘りの仕組み**:

- 志望動機や経験など深掘りが必要な質問では、Reviewer が `missingFacts` を返す
- Interviewer は `missingFacts` を基に自然なフォローアップ質問を生成
- LLM の会話能力を活かし、形式的なステップ管理なしで自然な深掘りを実現

---

### Reviewer

**役割**: 回答が field の要件を満たしているか確認する。

**tools**:

- `review`: 回答の充足を確認し、結果を返す

**動作**:

1. 収集した回答と field 定義を照合
2. `required_facts` が満たされているか確認
3. `done_criteria` を満たしているか確認
4. 不足があれば feedback を返す
5. OK ならパスを返す

**出力**:

```typescript
const ReviewResultSchema = z.object({
  passed: z.boolean(),
  feedback: z.string().optional(),
  missing_facts: z.array(z.string()).optional(),
})
```

---

### QuickCheck

**役割**: 質問送信前の軽量コンプライアンスチェック。

**tools**:

- `result`: チェック結果を返す

**チェック項目**:

- `field_id` / `intent` への紐づきがあるか
- 禁止トピックに該当しないか
- 既回答の fact を再質問していないか
- トーン違反がないか

**出力**:

```typescript
const QuickCheckResultSchema = z.object({
  passed: z.boolean(),
  violations: z
    .array(
      z.object({
        type: z.enum([
          'prohibited_topic',
          'duplicate_question',
          'tone_violation',
          'no_intent_binding',
        ]),
        message: z.string(),
      })
    )
    .optional(),
})
```

---

### Auditor

**役割**: 全フィールド完了後の最終監査とサマリー作成。

**tools**:

- `result`: 監査結果とサマリーを返す

**チェック項目**:

- 過剰な情報収集がないか
- 失礼な表現がないか
- 会話全体の一貫性
- 禁止トピックへの抵触がないか

**動作**:

1. 会話履歴全体を精査
2. コンプライアンス違反がないか確認
3. 最終サマリーを作成
4. システムに結果を返す

**出力**:

```typescript
const AuditResultSchema = z.object({
  passed: z.boolean(),
  violations: z
    .array(
      z.object({
        type: z.string(),
        message: z.string(),
        severity: z.enum(['error', 'warning']),
      })
    )
    .optional(),
  summary: z.string(),
})
```

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

- `ask` 実行前には必ず `quick_check` を通す
- `reviewer` を通さないと次の field に進めない
- 全 field 完了後は必ず `auditor` を通す
- `required` な field がすべて `done` でなければ応募確定できない

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                           │
│  - データ取得（Application, Session, Messages）              │
│  - Orchestrator 呼び出し                                    │
│  - 結果の永続化（Repository 経由）                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Orchestrator                           │
│  - Context 構築（buildContext）                             │
│  - エージェント制御・遷移                                    │
│  - 結果処理（StateChange[] の収集）                         │
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
│  ┌─────────┐ ┌───────────┐ ┌──────────────┐                │
│  │ Greeter │ │ Architect │ │ Interviewer  │ ...            │
│  └─────────┘ └───────────┘ └──────────────┘                │
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

## StateChange

Orchestrator はエージェントの実行結果から `StateChange[]` を収集し、API レイヤーに返す。
API レイヤーはこれを使って永続化を行う。

### StateChange の種類

```typescript
type StateChangeType =
  | 'SET_LANGUAGE' // 言語設定
  | 'SET_COUNTRY' // 居住国設定
  | 'SET_TIMEZONE' // タイムゾーン設定
  | 'SET_CURRENT_AGENT' // エージェント遷移
  | 'ADD_USER_MESSAGE' // ユーザーメッセージ追加
  | 'ADD_ASSISTANT_MESSAGE' // アシスタントメッセージ追加

interface StateChange {
  type: StateChangeType
  payload: unknown
}
```

### StateChange の収集

```typescript
// Orchestrator.collectStateChanges
private collectStateChanges(toolCalls?: ToolCallResult[]): StateChange[] {
  const changes: StateChange[] = []
  for (const toolCall of toolCalls) {
    switch (toolCall.toolName) {
      case 'set_language':
        changes.push({ type: 'SET_LANGUAGE', payload: { language: ... } })
        break
      // ...
    }
  }
  return changes
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

### 使用例

```typescript
const logger = new ConsoleLogger('[Orchestrator]')
const orchestrator = new Orchestrator({
  provider: llmProvider,
  createAgent,
  logger,
})
```

### ログ出力ポイント

| コンポーネント | ログ内容                                           |
| -------------- | -------------------------------------------------- |
| Orchestrator   | ワークフロー開始、エージェント遷移、メッセージ処理 |
| BaseAgent      | ツール実行、LLM 呼び出し、ループイテレーション     |
| Agent (個別)   | 各エージェント固有のイベント                       |

---

## OrchestratorInput

API レイヤーから Orchestrator に渡す入力データ。

```typescript
interface OrchestratorInput {
  sessionId: string
  currentAgent?: AgentType
  state: {
    language?: string
    country?: string
    timezone?: string
  }
  chatHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}
```

---

## エージェント遷移

Orchestrator が管理するエージェント間の遷移ルール:

```typescript
private getNextAgent(currentAgent: AgentType, state: State): AgentType | null {
  switch (currentAgent) {
    case 'greeter':
      return 'architect'      // Greeter → Architect
    case 'architect':
      return 'interviewer'    // Architect → Interviewer
    case 'interviewer':
      return null             // 状態による（TODO）
    case 'reviewer':
      return 'interviewer'    // Reviewer → Interviewer
    case 'auditor':
      return null             // ワークフロー終了
    default:
      return null
  }
}
```
