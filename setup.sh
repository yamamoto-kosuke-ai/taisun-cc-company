#!/bin/bash
# ============================================
# Taisun x CC-Company 統合セットアップスクリプト
# ============================================
# 使い方:
#   1. 新規プロジェクトディレクトリで実行
#   2. taisun_agentのシンボリックリンクを作成
#   3. 統合スキルをtaisun_agentに注入
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

# ステップ4: 統合スキルをtaisun_agentに注入
echo ""
echo -e "${YELLOW}[4/6] CC-Company統合スキルの注入...${NC}"

# /company スキルをtaisun_agentの.claude/skills/に直接コピー
SKILL_DEST="$TAISUN_HOME/.claude/skills/company"

if [ -d "$SKILL_DEST" ]; then
    cp -f "$SCRIPT_DIR/plugins/company/skills/company/SKILL.md" "$SKILL_DEST/SKILL.md"
    cp -rf "$SCRIPT_DIR/plugins/company/skills/company/references" "$SKILL_DEST/"
    echo -e "${GREEN}  ✅ /company スキルを更新しました${NC}"
else
    mkdir -p "$SKILL_DEST/references"
    cp "$SCRIPT_DIR/plugins/company/skills/company/SKILL.md" "$SKILL_DEST/SKILL.md"
    cp -r "$SCRIPT_DIR/plugins/company/skills/company/references/"* "$SKILL_DEST/references/"
    echo -e "${GREEN}  ✅ /company スキルを注入しました${NC}"
fi

echo -e "${BLUE}  配置先: $SKILL_DEST/${NC}"

# /partner スキルをtaisun_agentの.claude/skills/に直接コピー
echo ""
echo -e "${YELLOW}[5/6] Partner統合スキルの注入...${NC}"

PARTNER_DEST="$TAISUN_HOME/.claude/skills/partner"

if [ -d "$PARTNER_DEST" ]; then
    cp -f "$SCRIPT_DIR/plugins/partner/skills/partner/SKILL.md" "$PARTNER_DEST/SKILL.md"
    cp -rf "$SCRIPT_DIR/plugins/partner/skills/partner/references" "$PARTNER_DEST/"
    echo -e "${GREEN}  ✅ /partner スキルを更新しました${NC}"
else
    mkdir -p "$PARTNER_DEST/references"
    cp "$SCRIPT_DIR/plugins/partner/skills/partner/SKILL.md" "$PARTNER_DEST/SKILL.md"
    cp -r "$SCRIPT_DIR/plugins/partner/skills/partner/references/"* "$PARTNER_DEST/references/"
    echo -e "${GREEN}  ✅ /partner スキルを注入しました${NC}"
fi

echo -e "${BLUE}  配置先: $PARTNER_DEST/${NC}"

# ステップ5b: Playwright Skillの注入
echo ""
echo -e "${YELLOW}[5b/6] Playwright Skill の注入...${NC}"

PW_DEST="$TAISUN_HOME/.claude/skills/playwright-skill"

if [ -d "$PW_DEST" ]; then
    cp -f "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/SKILL.md" "$PW_DEST/SKILL.md"
    cp -f "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/run.js" "$PW_DEST/run.js"
    cp -f "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/package.json" "$PW_DEST/package.json"
    cp -f "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/API_REFERENCE.md" "$PW_DEST/API_REFERENCE.md"
    cp -rf "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/lib" "$PW_DEST/"
    echo -e "${GREEN}  ✅ Playwright Skill を更新しました${NC}"
else
    mkdir -p "$PW_DEST/lib"
    cp "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/SKILL.md" "$PW_DEST/SKILL.md"
    cp "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/run.js" "$PW_DEST/run.js"
    cp "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/package.json" "$PW_DEST/package.json"
    cp "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/API_REFERENCE.md" "$PW_DEST/API_REFERENCE.md"
    cp -r "$SCRIPT_DIR/plugins/playwright/skills/playwright-skill/lib/"* "$PW_DEST/lib/"
    echo -e "${GREEN}  ✅ Playwright Skill を注入しました${NC}"
fi

echo -e "${BLUE}  配置先: $PW_DEST/${NC}"

# Playwright 依存パッケージの自動インストール
if command -v npm &> /dev/null; then
    if [ ! -d "$PW_DEST/node_modules" ]; then
        echo -e "${YELLOW}  📦 Playwright 依存パッケージをインストール中...${NC}"
        (cd "$PW_DEST" && npm install --silent 2>/dev/null && npx playwright install chromium 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}  ✅ Playwright インストール完了${NC}"
        else
            echo -e "${YELLOW}  ⚠️  自動インストールに失敗しました。手動で実行してください:${NC}"
            echo -e "${YELLOW}     cd $PW_DEST && npm run setup${NC}"
        fi
    else
        echo -e "${GREEN}  ✅ Playwright は既にインストール済み${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠️  npm が見つかりません。Playwright の手動インストールが必要です${NC}"
fi

# ステップ5c: プロンプトブースター + ブリーフィングを秘書に注入
echo ""
echo -e "${YELLOW}[5c/6] プロンプトブースター & ブリーフィング を秘書に注入...${NC}"

SEC_CLAUDE=".company/secretary/CLAUDE.md"
PATCH_FILE="$SCRIPT_DIR/plugins/prompt-booster/secretary-patch.md"

if [ -f "$SEC_CLAUDE" ] && [ -f "$PATCH_FILE" ]; then
    # 既に注入済みかチェック
    if grep -q "プロンプトブースター" "$SEC_CLAUDE" 2>/dev/null; then
        # 古いパッチを削除して再注入（最新版に更新）
        sed -i '/## プロンプトブースター/,/^## フォルダ構成/{ /^## フォルダ構成/!d }' "$SEC_CLAUDE"
        sed -i '/## フォルダ構成/e cat '"\"$PATCH_FILE\"" "$SEC_CLAUDE"
        echo -e "${GREEN}  ✅ プロンプトブースター & ブリーフィングを更新しました${NC}"
    else
        # フォルダ構成の前に挿入
        sed -i '/## フォルダ構成/e cat '"\"$PATCH_FILE\"" "$SEC_CLAUDE"
        echo -e "${GREEN}  ✅ プロンプトブースター & ブリーフィングを注入しました${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠️  .company が未構築です。/company 実行後に setup.sh を再実行してください${NC}"
fi

# ステップ5d: Interactive Video Platform の注入
echo ""
echo -e "${YELLOW}[5d/6] Interactive Video Platform の注入...${NC}"

IV_DEST="$TAISUN_HOME/.claude/skills/interactive-video-platform"

if [ -d "$IV_DEST" ]; then
    cp -f "$SCRIPT_DIR/plugins/interactive-video/skills/interactive-video-platform/SKILL.md" "$IV_DEST/SKILL.md"
    cp -rf "$SCRIPT_DIR/plugins/interactive-video/skills/interactive-video-platform/scripts" "$IV_DEST/"
    echo -e "${GREEN}  ✅ Interactive Video Platform を更新しました${NC}"
else
    mkdir -p "$IV_DEST/scripts"
    cp "$SCRIPT_DIR/plugins/interactive-video/skills/interactive-video-platform/SKILL.md" "$IV_DEST/SKILL.md"
    cp -r "$SCRIPT_DIR/plugins/interactive-video/skills/interactive-video-platform/scripts/"* "$IV_DEST/scripts/"
    echo -e "${GREEN}  ✅ Interactive Video Platform を注入しました${NC}"
fi

echo -e "${BLUE}  配置先: $IV_DEST/${NC}"

# Python依存パッケージの確認
if command -v python3 &> /dev/null || command -v python &> /dev/null; then
    echo -e "${GREEN}  ✅ Python 検出済み${NC}"
    echo -e "${YELLOW}  ℹ️  Fish Audio APIキーを設定してください:${NC}"
    echo -e "${BLUE}     export FISH_AUDIO_API_KEY=\"your-api-key\"${NC}"
else
    echo -e "${YELLOW}  ⚠️  Python が見つかりません。Interactive Video Platform にはPythonが必要です${NC}"
fi

# ステップ5e: Mission Skill の注入
echo ""
echo -e "${YELLOW}[5e/6] Mission Skill の注入...${NC}"

MS_DEST="$TAISUN_HOME/.claude/skills/mission"

if [ -d "$MS_DEST" ]; then
    cp -f "$SCRIPT_DIR/plugins/mission/skills/mission/SKILL.md" "$MS_DEST/SKILL.md"
    cp -rf "$SCRIPT_DIR/plugins/mission/skills/mission/references" "$MS_DEST/"
    echo -e "${GREEN}  ✅ Mission Skill を更新しました${NC}"
else
    mkdir -p "$MS_DEST/references"
    cp "$SCRIPT_DIR/plugins/mission/skills/mission/SKILL.md" "$MS_DEST/SKILL.md"
    cp -r "$SCRIPT_DIR/plugins/mission/skills/mission/references/"* "$MS_DEST/references/"
    echo -e "${GREEN}  ✅ Mission Skill を注入しました${NC}"
fi

echo -e "${BLUE}  配置先: $MS_DEST/${NC}"

# ステップ5e: Briefing Skill の注入
echo ""
echo -e "${YELLOW}[5f/6] Briefing Skill の注入...${NC}"

BR_DEST="$TAISUN_HOME/.claude/skills/briefing"

if [ -d "$BR_DEST" ]; then
    cp -f "$SCRIPT_DIR/plugins/briefing/skills/briefing/SKILL.md" "$BR_DEST/SKILL.md"
    echo -e "${GREEN}  ✅ Briefing Skill を更新しました${NC}"
else
    mkdir -p "$BR_DEST"
    cp "$SCRIPT_DIR/plugins/briefing/skills/briefing/SKILL.md" "$BR_DEST/SKILL.md"
    echo -e "${GREEN}  ✅ Briefing Skill を注入しました${NC}"
fi

echo -e "${BLUE}  配置先: $BR_DEST/${NC}"

# ステップ5f: n8n MCP のユーザーレベル設定案内
echo ""
echo -e "${YELLOW}[5g/6] n8n MCP サーバー設定確認...${NC}"

# ユーザーレベルの ~/.claude.json を確認
if [ -f "$HOME/.claude.json" ] && grep -q "n8n-mcp" "$HOME/.claude.json" 2>/dev/null; then
    echo -e "${GREEN}  ✅ n8n MCP は既にユーザーレベルで設定済み${NC}"
else
    echo -e "${YELLOW}  ℹ️  n8n MCP を追加するには以下を実行してください:${NC}"
    echo -e "${BLUE}     claude mcp add -s user n8n-mcp -- npx n8n-mcp${NC}"
    echo -e "${YELLOW}  ℹ️  n8nインスタンスに接続する場合:${NC}"
    echo -e "${BLUE}     claude mcp add -s user n8n-mcp -e N8N_API_URL=http://localhost:5678/api/v1 -e N8N_API_KEY=your-key -- npx n8n-mcp${NC}"
fi

# ステップ6: 検証
echo ""
echo -e "${YELLOW}[6/6] 検証...${NC}"

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

# スキルファイルの確認（taisun_agent内）
if [ -f "$TAISUN_HOME/.claude/skills/company/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ 統合SKILL.md 存在確認（$TAISUN_HOME/.claude/skills/company/）${NC}"
else
    echo -e "${RED}  ❌ 統合SKILL.md が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$TAISUN_HOME/.claude/skills/company/references/departments.md" ]; then
    echo -e "${GREEN}  ✅ 統合departments.md 存在確認${NC}"
else
    echo -e "${RED}  ❌ 統合departments.md が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$TAISUN_HOME/.claude/skills/company/references/claude-md-template.md" ]; then
    echo -e "${GREEN}  ✅ 統合claude-md-template.md 存在確認${NC}"
else
    echo -e "${RED}  ❌ 統合claude-md-template.md が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# /partner スキルファイルの確認（taisun_agent内）
if [ -f "$TAISUN_HOME/.claude/skills/partner/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ /partner SKILL.md 存在確認（$TAISUN_HOME/.claude/skills/partner/）${NC}"
else
    echo -e "${RED}  ❌ /partner SKILL.md が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$TAISUN_HOME/.claude/skills/partner/references/interview-guide.md" ]; then
    echo -e "${GREEN}  ✅ /partner interview-guide.md 存在確認${NC}"
else
    echo -e "${RED}  ❌ /partner interview-guide.md が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# シンボリックリンク経由でのアクセス確認
if [ -f ".claude/skills/company/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ シンボリックリンク経由で /company にアクセス可能${NC}"
else
    echo -e "${RED}  ❌ シンボリックリンク経由で /company にアクセスできません${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".claude/skills/partner/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ シンボリックリンク経由で /partner にアクセス可能${NC}"
else
    echo -e "${RED}  ❌ シンボリックリンク経由で /partner にアクセスできません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Interactive Video Platform の確認
if [ -f "$TAISUN_HOME/.claude/skills/interactive-video-platform/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ Interactive Video Platform 存在確認（$TAISUN_HOME/.claude/skills/interactive-video-platform/）${NC}"
else
    echo -e "${RED}  ❌ Interactive Video Platform が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".claude/skills/interactive-video-platform/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ シンボリックリンク経由で Interactive Video Platform にアクセス可能${NC}"
else
    echo -e "${RED}  ❌ シンボリックリンク経由で Interactive Video Platform にアクセスできません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Mission Skill の確認
if [ -f "$TAISUN_HOME/.claude/skills/mission/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ Mission Skill 存在確認（$TAISUN_HOME/.claude/skills/mission/）${NC}"
else
    echo -e "${RED}  ❌ Mission Skill が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".claude/skills/mission/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ シンボリックリンク経由で Mission Skill にアクセス可能${NC}"
else
    echo -e "${RED}  ❌ シンボリックリンク経由で Mission Skill にアクセスできません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Briefing Skill の確認
if [ -f "$TAISUN_HOME/.claude/skills/briefing/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ Briefing Skill 存在確認（$TAISUN_HOME/.claude/skills/briefing/）${NC}"
else
    echo -e "${RED}  ❌ Briefing Skill が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".claude/skills/briefing/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ シンボリックリンク経由で Briefing Skill にアクセス可能${NC}"
else
    echo -e "${RED}  ❌ シンボリックリンク経由で Briefing Skill にアクセスできません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Playwright Skill の確認
if [ -f "$TAISUN_HOME/.claude/skills/playwright-skill/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ Playwright Skill 存在確認（$TAISUN_HOME/.claude/skills/playwright-skill/）${NC}"
else
    echo -e "${RED}  ❌ Playwright Skill が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".claude/skills/playwright-skill/SKILL.md" ]; then
    echo -e "${GREEN}  ✅ シンボリックリンク経由で Playwright Skill にアクセス可能${NC}"
else
    echo -e "${RED}  ❌ シンボリックリンク経由で Playwright Skill にアクセスできません${NC}"
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
    echo "  3. 業務パートナーを設定: /partner"
    echo ""
    echo "  搭載機能:"
    echo "  - 96 AIエージェント"
    echo "  - 101+ スキル（+ /company, /partner, Playwright, /briefing, /mission, Interactive Video）"
    echo "  - 18+ MCPサーバー（+ n8n MCP）"
    echo "  - 14層防御フック"
    echo "  - Memory++システム"
    echo "  - Playwright ブラウザ自動化"
    echo "  - Interactive Video Platform（Fish Audio TTS + 分岐VSL）"
    echo "  - モーニングブリーフィング（/briefing）"
    echo "  - プロンプトブースター（曖昧指示の自動具体化）"
    echo "  - Google Workspace連携（要: サービスアカウントJSONキー）"
    echo "  - Chatwork連携（要: .chatwork-config.json）"
else
    echo -e "${RED}  ❌ セットアップにエラーがあります（${ERRORS}件）${NC}"
    echo "  上記のエラーを確認してください"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
