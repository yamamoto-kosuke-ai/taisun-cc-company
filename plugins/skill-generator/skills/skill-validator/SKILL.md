---
name: skill-validator
description: |
  5-layer quality validation for Claude Code skills.
  Validates structure, spec compliance, quality, hostile checks,
  and trigger accuracy. Outputs score 0-100.
  Use when user says "validate skill", "check skill quality",
  "skill score", "スキルを検証", or "品質チェック".
  Do NOT use for: creating skills (use skill-forge),
  analyzing existing skills for improvements (use skill-analyzer).
argument-hint: "[skill-directory-path]"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
metadata:
  author: TAISUN
  version: "1.0.0"
  category: skill-generation
---

# Skill Validator - 5-Layer Quality Gate

スキルの品質を5層で検証し、0-100のスコアを算出する。
90点以上で合格 (Production-ready)。

## Input

```
$ARGUMENTS = "{path-to-skill-directory}"
```

パスが指定されない場合、カレントディレクトリ内のSKILL.mdを検索する。

## Validation Pipeline

### Layer 1: 構造検証 (20点)

```bash
# 実行チェック
check_structure() {
  skill_dir="$ARGUMENTS"

  # 1. SKILL.md 存在確認 (大文字小文字正確)
  [ -f "$skill_dir/SKILL.md" ] || FAIL "SKILL.md not found"

  # 2. フォルダ名 kebab-case 検証
  dirname=$(basename "$skill_dir")
  echo "$dirname" | grep -qE '^[a-z0-9]+(-[a-z0-9]+)*$' || FAIL "Folder name not kebab-case: $dirname"

  # 3. README.md 不在確認
  [ ! -f "$skill_dir/README.md" ] || FAIL "README.md should not exist in skill folder"

  # 4. 許可ディレクトリのみ
  for dir in "$skill_dir"/*/; do
    name=$(basename "$dir")
    case "$name" in
      scripts|references|assets) ;; # OK
      *) FAIL "Unauthorized directory: $name" ;;
    esac
  done

  # 5. SKILL.md 行数チェック
  lines=$(wc -l < "$skill_dir/SKILL.md")
  [ "$lines" -le 500 ] || WARN "SKILL.md is $lines lines (max 500)"
}
```

| チェック | 配点 | 必須 |
|---------|------|------|
| SKILL.md存在 | 5 | Yes |
| kebab-caseフォルダ名 | 4 | Yes |
| README.md不在 | 3 | Yes |
| 許可ディレクトリのみ | 4 | Yes |
| 500行以下 | 4 | No (WARN) |

### Layer 2: 仕様準拠検証 (20点)

SKILL.md のfrontmatterを解析:

```
Frontmatter Parsing:
1. --- デリミタの存在と正しい配置
2. name フィールド: [a-z0-9-], 64文字以内, スペース/大文字なし
3. description フィールド: 空でない, 1024文字以内
4. XMLタグ (< >) がfrontmatterに含まれない
5. name に "claude" "anthropic" を含まない
6. allowed-tools の値が有効なツール名
7. model の値が有効 (sonnet/opus/haiku/inherit)
8. context の値が有効 (fork のみ)
```

有効なツール名一覧:
```
Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch,
Task, AskUserQuestion, TodoWrite, NotebookEdit, EnterPlanMode
```

| チェック | 配点 | 必須 |
|---------|------|------|
| ---デリミタ | 3 | Yes |
| name フォーマット | 4 | Yes |
| description 存在 | 4 | Yes |
| XMLタグ不在 | 3 | Yes |
| 禁止語不在 | 3 | Yes |
| ツール名有効性 | 2 | No |
| model有効性 | 1 | No |

### Layer 3: 品質検証 (25点)

#### Description品質 (12点)

| チェック | 配点 | 検出方法 |
|---------|------|---------|
| WHAT記述 | 3 | 動詞で始まる機能説明の存在 |
| WHEN記述 | 3 | "Use when", "when user says" 等の存在 |
| トリガーフレーズ | 3 | 引用符付きフレーズ3つ以上 |
| NOT条件 | 3 | "Do NOT", "Do not use for" 等の存在 |

#### Content品質 (13点)

| チェック | 配点 | 検出方法 |
|---------|------|---------|
| ステップバイステップ | 4 | 番号付きリスト or "Step N:" |
| コード例 | 3 | コードブロック (```) の存在 |
| エラーハンドリング | 3 | "error", "fail", "fallback" セクション |
| トラブルシューティング | 3 | "Troubleshooting" セクション |

### Layer 4: Hostile Validation (20点)

#### 単一責任原則 (5点)
```
検出パターン:
- description に "and" が3回以上 → 多機能疑い
- "A も B も C もする" パターン → 責務過多
- 名前と内容の不一致 → 命名問題
```

#### 非ハルシネーション (5点)
```
検出パターン:
- 存在しないツール名の参照
- 架空のAPI/コマンドの使用
- 実在しないファイルパスの参照
```

#### プレースホルダ拒否 (5点)
```
禁止パターン検索:
- TODO, FIXME, TBD, PLACEHOLDER
- "..." (省略) が指示内に存在
- "ここに追加", "add here", "implement this"
- "etc.", "and so on" (指示の曖昧化)
```

#### セキュリティ (5点)
```
検出パターン:
- ハードコードされたシークレット/APIキー
- rm -rf /, sudo の無条件実行
- 外部URLへの無検証アクセス
- eval() や exec() の無制限使用
```

### Layer 5: トリガーテスト (15点)

descriptionから推定されるトリガー精度を検証:

```
Test 1 (正のトリガー): 5点
  プロンプト: description内のトリガーフレーズそのまま
  期待: 発動する

Test 2 (正の変形): 5点
  プロンプト: トリガーフレーズの言い換え/類義語
  期待: 発動する

Test 3 (負のトリガー): 5点
  プロンプト: NOT条件に該当するプロンプト
  期待: 発動しない
```

## Score Calculation

```
Total = Layer1 + Layer2 + Layer3 + Layer4 + Layer5

Rating:
  90-100: Excellent (Production-ready)
  80-89:  Good (Minor improvements needed)
  70-79:  Fair (Several issues to fix)
  60-69:  Poor (Major revision needed)
  <60:    Critical (Rewrite required)
```

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Skill Validator - Quality Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Skill:  {skill-name}
  Path:   {skill-path}
  Score:  {score}/100 ({rating})

  Layer 1 - Structure:     {score}/20 {PASS/FAIL}
  Layer 2 - Spec:          {score}/20 {PASS/FAIL}
  Layer 3 - Quality:       {score}/25 {PASS/WARN}
  Layer 4 - Hostile:       {score}/20 {PASS/FAIL}
  Layer 5 - Trigger:       {score}/15 {PASS/WARN}

  Issues Found:
  [CRITICAL] {issue description}
  [WARNING]  {issue description}
  [INFO]     {suggestion}

  Recommendations:
  1. {actionable fix}
  2. {actionable fix}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Batch Mode

複数スキルを一括検証:

```
引数: --all {skills-directory}

出力:
| Skill | Score | Rating | Issues |
|-------|-------|--------|--------|
| {name} | {score} | {rating} | {count} |
| ... | ... | ... | ... |

Average Score: {avg}/100
Pass Rate: {N}/{total} ({percent}%)
```

## Error Handling

| エラー | 対処 |
|--------|------|
| パスが存在しない | エラーメッセージ + 候補パスの提示 |
| SKILL.md が空 | Score 0 + "Empty SKILL.md" レポート |
| Frontmatter パースエラー | YAMLエラー箇所を特定して報告 |
| 巨大ファイル (1000行+) | 先頭500行のみ検証 + 警告 |
