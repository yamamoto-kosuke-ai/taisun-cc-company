---
name: skill-analyzer
description: |
  Analyzes existing Claude Code skills and suggests improvements.
  Compares against best practices, identifies weaknesses, and
  generates actionable improvement recommendations.
  Use when user says "analyze skill", "improve skill", "skill review",
  "スキルを改善", or "スキル分析".
  Do NOT use for: creating new skills (use skill-forge),
  simple pass/fail validation (use skill-validator).
argument-hint: "[skill-directory-path]"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch
model: sonnet
metadata:
  author: TAISUN
  version: "1.0.0"
  category: skill-generation
---

# Skill Analyzer - Quality Improvement Engine

既存スキルを分析し、具体的な改善提案を生成する。
skill-validator (Pass/Fail判定) とは異なり、HOW TO IMPROVEに特化。

## Input

```
$ARGUMENTS = "{path-to-skill-directory}"
```

## Analysis Pipeline

### Step 1: 現状スコアリング

まず skill-validator と同等の5層検証を実行し、現在のスコアを把握。

### Step 2: Description 分析

現在のdescriptionを "Pushy Description" 基準で評価:

```
Current Description Analysis:
├── WHAT (何をするか):     {present/missing/weak}
├── WHEN (いつ使うか):     {present/missing/weak}
├── Trigger Phrases:       {count} found
├── NOT条件:               {present/missing}
├── Estimated Trigger Rate: ~{N}%
└── Improvement Potential:  {high/medium/low}
```

"weak" 判定基準:
- WHAT: 主語が曖昧、動詞が一般的すぎる
- WHEN: トリガー条件が具体的でない
- Trigger Phrases: 3つ未満、またはユーザーが言いそうにない表現

### Step 3: Content 構造分析

```
Content Structure Analysis:
├── Total Lines:           {N}
├── Frontmatter:           {N} lines
├── Instructions:          {N} sections
├── Code Examples:         {N} blocks
├── Error Handling:        {present/missing}
├── Troubleshooting:       {present/missing}
├── Progressive Disclosure: {used/not-used/needed}
└── Estimated Token Load:  ~{N} tokens
```

### Step 4: 競合比較 (WebSearch)

同様の機能を持つ公開スキルを検索し、比較:

```
WebSearch: "Claude Code skill {similar-function}"
WebSearch: "agentskills {topic} best"
```

比較ポイント:
- Description の質
- ツール選択の適切さ
- Progressive Disclosure の使い方
- コード例の充実度

### Step 5: 改善提案生成

```yaml
improvement_plan:
  current_score: {N}/100
  target_score: 90+

  critical_fixes:    # 必ず修正すべき
    - area: "{area}"
      issue: "{what's wrong}"
      fix: "{specific fix}"
      impact: "+{N} points"

  recommended_fixes: # 推奨修正
    - area: "{area}"
      issue: "{what's wrong}"
      fix: "{specific fix}"
      impact: "+{N} points"

  optional_enhancements: # あれば良い
    - area: "{area}"
      suggestion: "{what to add}"
      impact: "+{N} points"

  estimated_final_score: {N}/100
```

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Skill Analyzer - Improvement Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Skill:         {skill-name}
  Current Score: {score}/100 ({rating})
  Target Score:  90+ (Excellent)

  Description Quality:
    WHAT:     {status} {suggestion}
    WHEN:     {status} {suggestion}
    Triggers: {count}/3+ {suggestion}
    NOT:      {status} {suggestion}

  Content Quality:
    Structure:       {status}
    Code Examples:   {status}
    Error Handling:  {status}
    Troubleshooting: {status}

  Critical Fixes ({count}):
  1. [{area}] {issue} → {fix} (+{N}pts)

  Recommended ({count}):
  1. [{area}] {issue} → {fix} (+{N}pts)

  Optional ({count}):
  1. [{area}] {suggestion} (+{N}pts)

  Estimated Score After Fixes: {N}/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Auto-Fix Mode

`--fix` フラグ付きで呼び出された場合、critical_fixes を自動適用:

1. SKILL.md をバックアップ (SKILL.md.bak)
2. Critical fixes を順次適用 (Edit tool)
3. 再スコアリングで改善を確認
4. 差分をユーザーに提示

```
Auto-Fix Results:
  Before: {score}/100
  After:  {score}/100
  Fixed:  {count} issues
  Files modified: {list}
```

## Batch Analysis

複数スキルを一括分析:

```
引数: --all {skills-directory}

出力: スコア順ランキング + 全体の傾向分析
- 最も多い問題パターン
- 全体の平均スコア
- 優先的に改善すべきスキル
```

## Error Handling

| エラー | 対処 |
|--------|------|
| スキルパスが不正 | 候補をGlobで検索して提示 |
| WebSearch失敗 | 競合比較をスキップしローカル分析のみ |
| Auto-fix適用失敗 | バックアップから復元 + 手動修正を提案 |
