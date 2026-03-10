#!/bin/bash
# ============================================
# Taisun x CC-Company 統合セットアップスクリプト
# ============================================
# 使い方:
#   1. 新規プロジェクトディレクトリで実行
#   2. taisun_agentのシンボリックリンクを作成
#   3. 統合プラグインをインストール
# ============================================

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 設定
TAISUN_HOME="${TAISUN_HOME:-$HOME/taisun_agent}"
PLUGIN_REPO="taisun-cc-company"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Taisun x CC-Company 統合セットアップ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ステップ1: 前提条件チェック
echo -e "${YELLOW}[1/5] 前提条件チェック...${NC}"

# taisun_agent の存在確認
if [ ! -d "$TAISUN_HOME" ]; then
    echo -e "${RED}エラー: taisun_agent が見つかりません: $TAISUN_HOME${NC}"
    echo "TAISUN_HOME 環境変数を設定するか、~/taisun_agent にクローンしてください:"
    echo "  git clone https://github.com/taiyousan15/taisun_agent.git ~/taisun_agent"
    exit 1
fi

if [ ! -f "$TAISUN_HOME/.claude/CLAUDE.md" ]; then
    echo -e "${RED}エラー: taisun_agent の構成ファイルが不完全です${NC}"
    exit 1
fi

echo -e "${GREEN}  ✅ taisun_agent: $TAISUN_HOME${NC}"

# Claude Code の確認
if ! command -v claude &> /dev/null; then
    echo -e "${YELLOW}  ⚠️  Claude Code CLI が見つかりません（手動でプラグインをインストールしてください）${NC}"
else
    echo -e "${GREEN}  ✅ Claude Code CLI: $(claude --version 2>/dev/null || echo 'installed')${NC}"
fi

# git の確認
if ! command -v git &> /dev/null; then
    echo -e "${RED}エラー: git がインストールされていません${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ git: $(git --version)${NC}"

# ステップ2: gitリポジトリ初期化（未初期化の場合）
echo ""
echo -e "${YELLOW}[2/5] プロジェクト初期化...${NC}"

if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}  ✅ git リポジトリを初期化しました${NC}"
else
    echo -e "${GREEN}  ✅ git リポジトリは既に存在します${NC}"
fi

# ステップ3: シンボリックリンク作成
echo ""
echo -e "${YELLOW}[3/5] Taisun Agent シンボリックリンク作成...${NC}"

# Windows対応
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "mingw"* || "$OSTYPE" == "cygwin" ]]; then
    export MSYS=winsymlinks:nativestrict
    echo -e "${BLUE}  Windows環境を検出: MSYS=winsymlinks:nativestrict を設定${NC}"
fi

# .claude シンボリックリンク
if [ -L ".claude" ]; then
    echo -e "${GREEN}  ✅ .claude シンボリックリンクは既に存在します${NC}"
elif [ -d ".claude" ]; then
    echo -e "${YELLOW}  ⚠️  .claude ディレクトリが既に存在します（シンボリックリンクではありません）${NC}"
    echo "  既存の .claude を .claude.backup にリネームします"
    mv .claude .claude.backup
    ln -s "$TAISUN_HOME/.claude" .claude
    echo -e "${GREEN}  ✅ .claude シンボリックリンクを作成しました（バックアップ: .claude.backup）${NC}"
else
    ln -s "$TAISUN_HOME/.claude" .claude
    echo -e "${GREEN}  ✅ .claude → $TAISUN_HOME/.claude${NC}"
fi

# .mcp.json シンボリックリンク
if [ -L ".mcp.json" ]; then
    echo -e "${GREEN}  ✅ .mcp.json シンボリックリンクは既に存在します${NC}"
elif [ -f ".mcp.json" ]; then
    echo -e "${YELLOW}  ⚠️  .mcp.json ファイルが既に存在します${NC}"
    mv .mcp.json .mcp.json.backup
    ln -s "$TAISUN_HOME/.mcp.json" .mcp.json
    echo -e "${GREEN}  ✅ .mcp.json シンボリックリンクを作成しました（バックアップ: .mcp.json.backup）${NC}"
else
    ln -s "$TAISUN_HOME/.mcp.json" .mcp.json
    echo -e "${GREEN}  ✅ .mcp.json → $TAISUN_HOME/.mcp.json${NC}"
fi

# ステップ4: 統合プラグインのインストール
echo ""
echo -e "${YELLOW}[4/5] 統合プラグインのセットアップ...${NC}"

# プラグインディレクトリをコピー（シンボリックリンクではなくコピー）
PLUGIN_DIR=".claude-plugin"
if [ ! -d "$PLUGIN_DIR" ]; then
    cp -r "$SCRIPT_DIR/.claude-plugin" "$PLUGIN_DIR" 2>/dev/null || true
    echo -e "${GREEN}  ✅ プラグインメタデータを配置しました${NC}"
else
    echo -e "${GREEN}  ✅ プラグインメタデータは既に存在します${NC}"
fi

PLUGINS_DIR="plugins/company"
if [ ! -d "$PLUGINS_DIR" ]; then
    mkdir -p "plugins"
    cp -r "$SCRIPT_DIR/plugins/company" "plugins/company"
    echo -e "${GREEN}  ✅ 統合プラグインを配置しました${NC}"
else
    echo -e "${GREEN}  ✅ 統合プラグインは既に存在します${NC}"
fi

# ステップ5: 検証
echo ""
echo -e "${YELLOW}[5/5] 検証...${NC}"

ERRORS=0

# シンボリックリンクの確認
if [ -L ".claude" ] && [ -d ".claude" ]; then
    echo -e "${GREEN}  ✅ .claude リンク正常${NC}"
else
    echo -e "${RED}  ❌ .claude リンク異常${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -L ".mcp.json" ] && [ -f ".mcp.json" ]; then
    echo -e "${GREEN}  ✅ .mcp.json リンク正常${NC}"
else
    echo -e "${RED}  ❌ .mcp.json リンク異常${NC}"
    ERRORS=$((ERRORS + 1))
fi

# プラグインファイルの確認
if [ -f "plugins/company/skills/company/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ 統合SKILL.md 存在確認${NC}"
else
    echo -e "${RED}  ❌ 統合SKILL.md が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "plugins/company/skills/company/references/departments.md" ]; then
    echo -e "${GREEN}  ✅ 統合departments.md 存在確認${NC}"
else
    echo -e "${RED}  ❌ 統合departments.md が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 結果表示
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}  ✅ セットアップ完了！${NC}"
    echo ""
    echo "  次のステップ:"
    echo "  1. Claude Code を起動: claude"
    echo "  2. 仮想会社を構築: /company"
    echo ""
    echo "  搭載機能:"
    echo "  - 96 AIエージェント"
    echo "  - 101+ スキル"
    echo "  - 18 MCPサーバー"
    echo "  - 14層防御フック"
    echo "  - Memory++システム"
else
    echo -e "${RED}  ❌ セットアップにエラーがあります（${ERRORS}件）${NC}"
    echo "  上記のエラーを確認してください"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
