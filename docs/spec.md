# Ding - 汎用フォーム作成ツール

## 目的

このプロジェクトは、LLM とのチャットを通じてフォーム入力を支援する汎用ツール。
回答者は直接フォームに入力せず、対話形式で必要な情報を提供する。

## 前提

- 本ツールは汎用フォーム作成・回答収集に特化
- LLM は「質問生成」と「入力内容の整理」を支援する
- 収集したデータの利用・判断はフォーム作成者が行う

## 何をするか

### 1. フォームの作成

- フォーム作成者はフォーム項目と深掘り観点を定義できる
- AI が自然言語の説明から項目を提案する
- 各項目には完了条件（何を収集すべきか）を設定できる

### 2. LLM との会話でフォームを回答

- 回答者はフォームに直接入力せず、LLM とのチャットで回答する
- LLM は項目ごとの深掘り観点に沿って質問し、回答を構造化する
- 収集した情報は確認・修正ステップを経て確定する

## 機能要件

### フォーム作成

- フォームを作成できる
- フォームごとにフィールド項目を定義できる
- フィールドごとに深掘り観点（intent）を設定できる
- フォームの目的（purpose）を自然言語で設定できる
- AI がフィールドを自動提案できる

### 回答フロー

- フォームごとに回答チャットを開始できる
- チャット開始時に `言語` と `居住国` を取得する
- タイムゾーンは自動推定し、手動修正できる
- LLM が深掘り観点に沿って質問を生成する
- チャット内容からフィールド値を抽出する
- 回答前に抽出結果の確認・修正ステップを設ける（必須）
- 回答前に同意チェックを設ける（必須）
- 回答一覧と回答詳細を閲覧できる

## 必須フロー（回答時）

1. チャットで回答
2. 抽出結果の確認・修正
3. 同意チェック
4. 回答確定

## 回答エージェント思考フロー

### 全体フロー

1. フォーム作成者がフォームを作成し、フィールド項目・intent・purpose を設定する
2. 設定内容をもとに LLM が完了条件（completion_criteria / done_condition）を自動生成する
3. フォーム作成者が生成結果を確認・微修正し、フォームを公開する
4. 回答者がチャットを開始する
5. セッション開始処理（session_bootstrap）で言語・居住国を取得し、タイムゾーンを推定する
6. エージェントが質問プランを作成し、会話を進める
7. 全フィールド完了後、抽出結果の確認・修正 → 同意チェック → 回答確定

### フィールド定義

フォーム作成者が設定する項目：

- `field_id`: フィールド識別子
- `label`: 表示名
- `description`: 説明（オプション）
- `intent`: 深掘り観点（何を収集したいか）
- `required`: 必須かどうか

LLM が自動生成する項目（作成者が微修正可能）：

- `criteria`: 収集すべき事実のリスト
- `done_condition`: 完了条件

### セッション開始（session_bootstrap）

チャット開始時に以下を取得する。これを通過しないと質問ループに入れない。

1. `言語` を取得する
2. `居住国` を取得する
3. `タイムゾーン` を自動推定し、手動修正できるようにする
4. データ利用説明を表示する

### タスク状態遷移

各完了条件に対してタスクを1つ作成し、以下の状態で管理する。

#### ステータス定義

- `pending`: 未着手
- `in_progress`: 回答中
- `completed`: 完了条件を満たした

#### 状態遷移

```
pending → in_progress（質問開始時）
in_progress → completed（完了条件充足時）
in_progress → pending（フォローアップが必要な場合）
```

#### 不変条件

- `required` なタスクがすべて `completed` でなければ回答確定できない

### 質問生成と会話設計

#### 基本ルール

- 1 質問 1 目的（各質問は必ず 1 つの field_id と intent に紐づく）
- 回答から複数の事実を抽出して一括更新する
- 回答者が自由に話した場合も、該当する事実があれば抽出・更新する
- 既回答済みの事実を再質問しない

#### 会話トーン設計

- 最初の挨拶: 自己紹介と会話の目的を伝える
- 質問中: 丁寧で中立な聞き方
- 相槌: 回答への受容を示してから次の質問に移る
- 締め: 感謝を伝え、確認画面への誘導を行う

### フォールバック

#### 条件（いずれかを満たした場合）

- レビュー失敗が 3 回連続
- 抽出失敗が 2 回連続
- タイムアウトが 2 回連続

#### 動作

1. 未入力のフォーム項目を一覧表示する
2. 回答者に手入力してもらう
3. 入力完了後、確認・同意ステップに進む
4. `manual_fallback_triggered` イベントを記録する

### イベント計測

- `chat_started`: チャット開始
- `session_bootstrap_completed`: セッション開始処理完了
- `review_completed`: 抽出結果の確認完了
- `consent_checked`: 同意チェック完了
- `submission_submitted`: 回答確定
- `manual_fallback_triggered`: 手入力フォールバック発動

## データモデル

### Form（フォーム）

- `id`: フォーム識別子
- `title`: タイトル
- `description`: 説明（オプション）
- `purpose`: 目的（自然言語、AI入力用）
- `completion_message`: 完了時メッセージ
- `status`: ステータス（draft / published / closed）
- `created_by`: 作成者 ID
- `created_at`: 作成日時
- `updated_at`: 更新日時

### FormField（フォームフィールド）

- `id`: フィールド識別子
- `form_id`: フォーム ID
- `field_id`: フィールド識別子
- `label`: 表示名
- `description`: 説明
- `intent`: 深掘り観点
- `required`: 必須フラグ
- `sort_order`: 表示順序

### FieldCompletionCriteria（完了条件）

- `id`: 完了条件識別子
- `schema_version_id`: スキーマバージョン ID
- `form_field_id`: フィールド ID
- `criteria_key`: 条件キー
- `criteria`: 収集すべき事実
- `done_condition`: 完了条件
- `questioning_hints`: 質問時のヒント

### Submission（回答）

- `id`: 回答識別子
- `form_id`: フォーム ID
- `schema_version_id`: スキーマバージョン ID
- `respondent_name`: 回答者名（オプション）
- `respondent_email`: 回答者メール（オプション）
- `language`: 言語
- `country`: 居住国
- `timezone`: タイムゾーン
- `status`: ステータス（new / in_progress / review_completed / submitted）
- `review_completed_at`: レビュー完了日時
- `consent_checked_at`: 同意チェック日時
- `submitted_at`: 回答確定日時

### SubmissionTask（回答タスク）

- `id`: タスク識別子
- `submission_id`: 回答 ID
- `field_completion_criteria_id`: 完了条件 ID
- `form_field_id`: フィールド ID
- `criteria`: 収集すべき事実
- `done_condition`: 完了条件
- `required`: 必須フラグ
- `status`: ステータス（pending / in_progress / completed）
- `collected_value`: 収集した値

### CollectedField（収集フィールド）

- `id`: 収集フィールド識別子
- `submission_id`: 回答 ID
- `form_field_id`: フィールド ID
- `value`: 収集した値
- `source`: ソース（chat / manual）
- `confirmed`: 確認済みフラグ

## データ保護（最小要件）

- 取得データを明示する
- 利用目的を明示する
- 保存期間を明示する
- 削除依頼の窓口を用意する
- 同意取得ログを保存する

## スコープ外

- 自動判定・スコアリング
- 高度な外部システム連携
- 多言語対応（原文保存のみ対応）

## 成功指標

- 回答完了率
- 回答完了までの平均時間
- 抽出結果の修正率（LLM 抽出品質の確認）
