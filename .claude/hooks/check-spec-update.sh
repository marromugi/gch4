#!/bin/bash

# Stop hook: 直近の修正を元に仕様書の更新が必要か確認
#
# このスクリプトは以下の場合に仕様書確認を提案します:
# - ドメイン層のコード変更がある場合
# - データベーススキーマの変更がある場合
# - API エンドポイントの変更がある場合

# stdin から hook 入力を読み取る
INPUT=$(cat)

# stop_hook_active が true なら無限ループ防止のため終了
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# Git の変更を確認（ステージ済み + 未ステージ）
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || git diff --name-only 2>/dev/null || echo "")

# 変更がなければ終了
if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

# ドメイン関連の変更をチェック
DOMAIN_CHANGES=""
SCHEMA_CHANGES=""
API_CHANGES=""
PAGE_CHANGES=""

# packages/domain の変更
if echo "$CHANGED_FILES" | grep -q "packages/domain/"; then
  DOMAIN_CHANGES=$(echo "$CHANGED_FILES" | grep "packages/domain/" | head -5)
fi

# データベーススキーマの変更
if echo "$CHANGED_FILES" | grep -q "packages/database/.*schema"; then
  SCHEMA_CHANGES=$(echo "$CHANGED_FILES" | grep "packages/database/.*schema" | head -5)
fi

# API の変更
if echo "$CHANGED_FILES" | grep -q "apps/api/"; then
  API_CHANGES=$(echo "$CHANGED_FILES" | grep "apps/api/" | head -5)
fi

# ページコンポーネントの変更
if echo "$CHANGED_FILES" | grep -q "packages/app/src/components/pages/"; then
  PAGE_CHANGES=$(echo "$CHANGED_FILES" | grep "packages/app/src/components/pages/" | head -5)
fi

# 仕様書自体の変更があれば確認不要
if echo "$CHANGED_FILES" | grep -q "docs/spec.md"; then
  exit 0
fi

# ドメイン関連の変更がなければ終了
if [ -z "$DOMAIN_CHANGES" ] && [ -z "$SCHEMA_CHANGES" ] && [ -z "$API_CHANGES" ] && [ -z "$PAGE_CHANGES" ]; then
  exit 0
fi

# 変更内容をまとめる
CHANGES_SUMMARY=""
if [ -n "$DOMAIN_CHANGES" ]; then
  CHANGES_SUMMARY="${CHANGES_SUMMARY}ドメイン層: ${DOMAIN_CHANGES}\n"
fi
if [ -n "$SCHEMA_CHANGES" ]; then
  CHANGES_SUMMARY="${CHANGES_SUMMARY}スキーマ: ${SCHEMA_CHANGES}\n"
fi
if [ -n "$API_CHANGES" ]; then
  CHANGES_SUMMARY="${CHANGES_SUMMARY}API: ${API_CHANGES}\n"
fi
if [ -n "$PAGE_CHANGES" ]; then
  CHANGES_SUMMARY="${CHANGES_SUMMARY}ページ: ${PAGE_CHANGES}\n"
fi

# Claude へのコンテキストを JSON で出力
cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "additionalContext": "【仕様書確認の提案】\n\n直近でドメイン関連のコード変更が検出されました:\n${CHANGES_SUMMARY}\nこれらの変更が docs/spec.md の仕様と整合しているか確認することを推奨します。\n\n確認が必要な場合は「spec-review エージェントを実行して」と指示してください。"
  }
}
EOF
