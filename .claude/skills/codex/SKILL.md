---
name: codex
description: Codex CLIを使用してコードレビューや調査を行う。/codex <リクエスト> で実行。
---

# Codex Skill

OpenAI Codex CLIを使用してコード調査やレビューを実行するスキルです。

## Usage

`/codex <リクエスト内容>`

## Execution

以下のコマンドを実行してください：

```bash
codex exec --full-auto --sandbox read-only --cd "$(pwd)" "<ユーザーのリクエスト内容>

確認や質問は不要です。具体的な提案・修正案・コード例まで自主的に出力してください。"
```

## Instructions

1. ユーザーのリクエスト内容をそのまま `codex exec` コマンドに渡してください
2. `--full-auto` モードで自動実行します
3. `--sandbox read-only` でファイルの変更は行いません（読み取り専用）
4. 実行結果をユーザーに報告してください

## Examples

- `/codex このコードベースの認証フローを調査して`
- `/codex src/components のコードレビューをして`
- `/codex 未使用のimportを探して`
- `/codex パフォーマンス改善点を提案して`
