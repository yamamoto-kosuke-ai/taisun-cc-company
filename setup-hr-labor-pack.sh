#!/bin/bash
# ============================================
# 人事労務拡張パック セットアップスクリプト
# ============================================
# 使い方:
#   bash ~/taisun-cc-company/setup-hr-labor-pack.sh
#
# 前提条件:
#   - taisun-cc-company の setup.sh が実行済み
#   - .claude シンボリックリンクが存在すること
# ============================================

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 設定
TAISUN_HOME="${TAISUN_HOME:-$HOME/taisun_agent}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACK_DIR="$SCRIPT_DIR/plugins/hr-labor-pack"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  人事労務拡張パック セットアップ${NC}"
echo -e "${CYAN}  HR/Accounting/Labor Extension Pack${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================
# ステップ1: 前提条件チェック
# ============================================
echo -e "${YELLOW}[1/6] 前提条件チェック...${NC}"

# taisun_agent の存在確認
if [ ! -d "$TAISUN_HOME" ]; then
    echo -e "${RED}エラー: taisun_agent が見つかりません: $TAISUN_HOME${NC}"
    echo "先に setup.sh を実行してください"
    exit 1
fi
echo -e "${GREEN}  ✅ taisun_agent: $TAISUN_HOME${NC}"

# .claude シンボリックリンクの確認
if [ ! -d ".claude" ]; then
    echo -e "${RED}エラー: .claude が見つかりません${NC}"
    echo "先に setup.sh を実行してください"
    exit 1
fi
echo -e "${GREEN}  ✅ .claude ディレクトリ存在${NC}"

# プラグインディレクトリの確認
if [ ! -d "$PACK_DIR" ]; then
    echo -e "${RED}エラー: 拡張パックが見つかりません: $PACK_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ 拡張パック: $PACK_DIR${NC}"

# ============================================
# ステップ2: Hooks の注入
# ============================================
echo ""
echo -e "${YELLOW}[2/6] 法改正ウォッチャー & 給与計算バリデータの注入...${NC}"

HOOKS_DEST="$TAISUN_HOME/.claude/hooks"

# hr-law-watcher.js
cp -f "$PACK_DIR/hooks/hr-law-watcher.js" "$HOOKS_DEST/hr-law-watcher.js"
echo -e "${GREEN}  ✅ hr-law-watcher.js (SessionStart: 法改正ウォッチャー)${NC}"

# hr-payroll-validator.js
cp -f "$PACK_DIR/hooks/hr-payroll-validator.js" "$HOOKS_DEST/hr-payroll-validator.js"
echo -e "${GREEN}  ✅ hr-payroll-validator.js (PostToolUse: 給与計算バリデータ)${NC}"

# ============================================
# ステップ3: Rules の注入
# ============================================
echo ""
echo -e "${YELLOW}[3/6] ドメイン知識ルール & マイナンバー安全管理ルールの注入...${NC}"

RULES_DEST="$TAISUN_HOME/.claude/rules"

cp -f "$PACK_DIR/rules/hr-domain-knowledge.md" "$RULES_DEST/hr-domain-knowledge.md"
echo -e "${GREEN}  ✅ hr-domain-knowledge.md (給与計算・社保・年調の業務ルール)${NC}"

cp -f "$PACK_DIR/rules/mynumber-security.md" "$RULES_DEST/mynumber-security.md"
echo -e "${GREEN}  ✅ mynumber-security.md (マイナンバー安全管理措置)${NC}"

# ============================================
# ステップ4: Skills の注入
# ============================================
echo ""
echo -e "${YELLOW}[4/6] 法改正リサーチ & 料率マスタ更新スキルの注入...${NC}"

SKILLS_DEST="$TAISUN_HOME/.claude/skills"

# /hr-law-check スキル
HR_LAW_DEST="$SKILLS_DEST/hr-law-check"
mkdir -p "$HR_LAW_DEST"
cp -f "$PACK_DIR/skills/hr-law-check/SKILL.md" "$HR_LAW_DEST/SKILL.md"
echo -e "${GREEN}  ✅ /hr-law-check (法改正リサーチスキル)${NC}"

# /hr-rate-update スキル
HR_RATE_DEST="$SKILLS_DEST/hr-rate-update"
mkdir -p "$HR_RATE_DEST"
cp -f "$PACK_DIR/skills/hr-rate-update/SKILL.md" "$HR_RATE_DEST/SKILL.md"
echo -e "${GREEN}  ✅ /hr-rate-update (料率マスタ更新スキル)${NC}"

# ============================================
# ステップ5: データディレクトリ & 料率マスタ配置
# ============================================
echo ""
echo -e "${YELLOW}[5/6] データディレクトリ & 料率マスタ初期配置...${NC}"

DATA_DEST="$TAISUN_HOME/.claude/hooks/data/hr-labor"
mkdir -p "$DATA_DEST"

# rate-master.json（存在しない場合のみ初期配置）
if [ -f "$DATA_DEST/rate-master.json" ]; then
    echo -e "${GREEN}  ✅ rate-master.json は既に存在します（上書きしません）${NC}"
    echo -e "${YELLOW}  ℹ️  最新化するには /hr-law-check を実行してください${NC}"
else
    cp "$PACK_DIR/data/rate-master.json" "$DATA_DEST/rate-master.json"
    echo -e "${GREEN}  ✅ rate-master.json 初期配置完了${NC}"
fi

echo -e "${BLUE}  配置先: $DATA_DEST/${NC}"

# ============================================
# ステップ6: settings.json への hook登録
# ============================================
echo ""
echo -e "${YELLOW}[6/6] settings.json への hook 自動登録...${NC}"

SETTINGS_FILE="$TAISUN_HOME/.claude/settings.json"

if [ -f "$SETTINGS_FILE" ]; then
    # Node.jsスクリプトでJSON安全編集
    REGISTER_SCRIPT="$PACK_DIR/register-hooks.js"
    if [ -f "$REGISTER_SCRIPT" ]; then
        RESULT=$(node "$REGISTER_SCRIPT" "$SETTINGS_FILE" 2>&1)
        echo "$RESULT" | while IFS= read -r line; do
            case "$line" in
                ADDED:*)
                    echo -e "${GREEN}  ✅ ${line#ADDED: }${NC}"
                    ;;
                SKIP:*)
                    echo -e "${GREEN}  ✅ ${line#SKIP: }${NC}"
                    ;;
                BACKUP:*)
                    echo -e "${BLUE}  📋 バックアップ: ${line#BACKUP: }${NC}"
                    ;;
                SAVED:*)
                    echo -e "${GREEN}  ✅ ${line#SAVED: }${NC}"
                    ;;
                NO\ CHANGES:*)
                    echo -e "${GREEN}  ✅ 全hook登録済み（変更なし）${NC}"
                    ;;
                *)
                    echo -e "${YELLOW}  $line${NC}"
                    ;;
            esac
        done
    else
        echo -e "${RED}  ❌ register-hooks.js が見つかりません: $REGISTER_SCRIPT${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}  ⚠️  settings.json が見つかりません${NC}"
fi

# ============================================
# 検証
# ============================================
echo ""
echo -e "${YELLOW}検証中...${NC}"

ERRORS=0

# Hooks
for hook in hr-law-watcher.js hr-payroll-validator.js; do
    if [ -f "$HOOKS_DEST/$hook" ]; then
        echo -e "${GREEN}  ✅ Hook: $hook${NC}"
    else
        echo -e "${RED}  ❌ Hook: $hook が見つかりません${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Rules
for rule in hr-domain-knowledge.md mynumber-security.md; do
    if [ -f "$RULES_DEST/$rule" ]; then
        echo -e "${GREEN}  ✅ Rule: $rule${NC}"
    else
        echo -e "${RED}  ❌ Rule: $rule が見つかりません${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Skills
for skill in hr-law-check hr-rate-update; do
    if [ -f "$SKILLS_DEST/$skill/SKILL.md" ]; then
        echo -e "${GREEN}  ✅ Skill: /$skill${NC}"
    else
        echo -e "${RED}  ❌ Skill: /$skill が見つかりません${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Data
if [ -f "$DATA_DEST/rate-master.json" ]; then
    echo -e "${GREEN}  ✅ Data: rate-master.json${NC}"
else
    echo -e "${RED}  ❌ Data: rate-master.json が見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# シンボリックリンク経由アクセス確認
if [ -f ".claude/hooks/hr-law-watcher.js" ]; then
    echo -e "${GREEN}  ✅ シンボリックリンク経由でアクセス可能${NC}"
else
    echo -e "${RED}  ❌ シンボリックリンク経由でアクセスできません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# ============================================
# 結果表示
# ============================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}  ✅ 人事労務拡張パック セットアップ完了！${NC}"
    echo ""
    echo "  搭載機能:"
    echo "  ┌──────────────────────────────────────────────────┐"
    echo "  │  法改正追従（3段構え）                           │"
    echo "  │  ├─ 第1段: 法改正ウォッチャー (SessionStart)     │"
    echo "  │  │  → セッション開始時に料率マスタ鮮度チェック   │"
    echo "  │  ├─ 第2段: 給与計算バリデータ (PostToolUse)      │"
    echo "  │  │  → コード変更時に料率整合性・マイナンバー検査 │"
    echo "  │  └─ 第3段: /hr-law-check (手動スキル)            │"
    echo "  │     → WebSearchで最新法改正を徹底リサーチ        │"
    echo "  ├──────────────────────────────────────────────────┤"
    echo "  │  ドメイン知識                                    │"
    echo "  │  ├─ 給与計算の業務ルール (rules)                 │"
    echo "  │  └─ マイナンバー安全管理措置 (rules)             │"
    echo "  ├──────────────────────────────────────────────────┤"
    echo "  │  ツール                                          │"
    echo "  │  ├─ /hr-law-check  法改正リサーチ                │"
    echo "  │  ├─ /hr-rate-update 料率マスタ更新               │"
    echo "  │  └─ rate-master.json 料率一元管理マスタ          │"
    echo "  └──────────────────────────────────────────────────┘"
    echo ""
    echo "  次のステップ:"
    echo "  1. /hr-law-check で最新法改正を確認"
    echo "  2. /hr-rate-update init で料率マスタを最新化"
    echo "  3. settings.json に hook を登録（上記の案内を参照）"
else
    echo -e "${RED}  ❌ セットアップにエラーがあります（${ERRORS}件）${NC}"
    echo "  上記のエラーを確認してください"
fi
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
