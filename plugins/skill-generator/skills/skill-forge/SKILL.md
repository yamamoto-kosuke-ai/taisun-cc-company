---
name: skill-forge
description: |
  World-class Claude Code skill generator with deep research pipeline.
  Use when user says "create a skill", "make a skill", "build a skill",
  "generate a skill", "new skill", "/skill-forge", or "スキルを作って".
  Also triggers on: "skill generation", "skill creation workflow".
  Do NOT use for: editing existing skills (use skill-analyzer),
  validating skills (use skill-validator), or packaging (use skill-packager).
argument-hint: "[skill-concept or topic]"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch, Task, AskUserQuestion, TodoWrite
model: opus
metadata:
  author: TAISUN
  version: "1.0.0"
  category: skill-generation
---

# Skill Forge - Ultimate Skill Generator

最高品質のClaude Codeスキルを生成する6フェーズパイプライン。
毎回必ずディープリサーチを実行し、エビデンスに基づくスキルを生成する。

## Core References (MUST Read on invocation)

- [AgentSkills仕様](references/agentskills-spec.md) - SKILL.md フォーマット完全仕様
- [ベストプラクティス](references/best-practices.md) - Anthropic公式+コミュニティ知見
- [品質チェックリスト](references/quality-checklist.md) - 5層バリデーション基準

## Phase 1: INTAKE (要件ヒアリング)

ユーザーの入力 `$ARGUMENTS` を分析し、以下を対話的に確定する。

### 1.1 初期分析

引数がある場合、まず以下を推測して提示:

```
スキル概要:
- 名前候補: {kebab-case name}
- カテゴリ: {basic/research/generator/automation/analysis}
- 想定ユーザー: {ペルソナ}
- 主要機能: {箇条書き}
```

### 1.2 要件確認 (AskUserQuestion)

以下の4点を必ず確認する:

1. **スコープ**: このスキルは何をする/しないか
2. **トリガー**: どんな言葉で発動すべきか (3つ以上)
3. **ツール権限**: 必要なallowed-tools
4. **呼び出し方式**: user-invocable / model-invocable / both

### 1.3 要件ドキュメント作成

確定した要件を構造化:

```yaml
skill_requirements:
  name: "{skill-name}"
  category: "{category}"
  scope:
    does: [...]
    does_not: [...]
  triggers:
    positive: [...]   # 発動すべきフレーズ
    negative: [...]   # 発動すべきでないフレーズ
  tools: [...]
  invocation: "both"  # user/model/both
  special_requirements: [...]
```

## Phase 2: RESEARCH (ディープリサーチ) - ALWAYS EXECUTE

**このフェーズは省略不可。毎回必ず実行する。**

### 2.1 SkillsMP 類似スキル検索

Task tool で skill-research スキル相当のリサーチを実行:

```
WebFetch: https://skillsmp.com/api/skills?q={skill-name}&limit=20
```

取得した類似スキルから:
- 共通パターンの抽出
- description の書き方
- allowed-tools の組み合わせ
- Progressive Disclosure の構造

### 2.2 Web検索 (並列実行)

3つのTask agentを並列起動:

**Agent 1: 技術リサーチ**
```
WebSearch: "Claude Code skill {topic} best practices"
WebSearch: "agentskills.io {topic} implementation"
WebSearch: "{topic} automation CLI tool"
```

**Agent 2: パターンリサーチ**
```
WebSearch: "Claude Code custom skill examples"
WebSearch: "{topic} workflow automation pattern"
WebSearch: "AI coding assistant {topic} plugin"
```

**Agent 3: 既存実装リサーチ**
```
WebSearch: "github claude-code skills {topic}"
WebSearch: "cursor rules {topic}"
WebSearch: ".cursorrules {topic} example"
```

### 2.3 リサーチ統合

全リサーチ結果を統合し、以下を導出:

```
リサーチサマリー:
- 類似スキル数: {N}件
- 主要パターン: [...]
- ベストプラクティス: [...]
- 差別化ポイント: [...]
- 推奨アーキテクチャ: {description}
```

## Phase 3: GENERATE (スキル生成)

### 3.1 テンプレート選択

要件のカテゴリに基づきテンプレートを選択:

| カテゴリ | テンプレート | 特徴 |
|---------|------------|------|
| basic | templates/basic/ | シンプルな単機能スキル |
| research | templates/research/ | WebSearch/WebFetch活用 |
| generator | templates/generator/ | コード/コンテンツ生成 |
| automation | templates/automation/ | Bash/スクリプト実行 |
| analysis | templates/analysis/ | コード解析/レビュー |

### 3.2 SKILL.md 生成

以下の順序で生成:

1. **Frontmatter**: 仕様準拠のYAML (references/agentskills-spec.md)
2. **Description**: Pushy Description パターン (references/best-practices.md)
   - WHAT + WHEN + NOT の3要素必須
   - 具体的トリガーフレーズ3つ以上
3. **Body**: ステップバイステップ指示
   - 明確な手順
   - コード例 (主要操作)
   - エラーハンドリング
   - トラブルシューティング
4. **Progressive Disclosure**: 500行超の場合は references/ に分離

### 3.3 Description 品質チェック

生成したdescriptionが以下を満たすか確認:

```yaml
# 最低品質ライン
description: |
  {WHAT - 何をするか: 1文}
  Use when user says "{trigger1}", "{trigger2}", or "{trigger3}".
  {WHEN - 追加のトリガー条件}
  Do NOT use for: {NOT条件1} ({代替スキル名} instead).
```

### 3.4 出力

生成したスキルのディレクトリ構造:

```
{skill-name}/
├── SKILL.md           # メインスキル (500行以下)
├── references/        # 詳細ドキュメント (必要時)
│   └── {topic}.md
└── scripts/           # ヘルパースクリプト (必要時)
    └── {helper}.sh
```

## Phase 4: VALIDATE (5層バリデーション)

references/quality-checklist.md の全項目を検証。

### 4.1 自動検証

```
Layer 1: 構造検証
  □ SKILL.md 存在 → ✓/✗
  □ kebab-case フォルダ名 → ✓/✗
  □ README.md 不在 → ✓/✗
  □ 許可ディレクトリのみ → ✓/✗
  □ 500行以下 → ✓/✗ ({actual}行)

Layer 2: 仕様準拠
  □ --- デリミタ → ✓/✗
  □ name フォーマット → ✓/✗
  □ description 存在 → ✓/✗
  □ XMLタグ不在 → ✓/✗
  □ 禁止語不在 → ✓/✗

Layer 3: 品質
  □ WHAT記述 → ✓/✗
  □ WHEN記述 → ✓/✗
  □ トリガーフレーズ → ✓/✗
  □ ステップバイステップ → ✓/✗
  □ コード例 → ✓/✗
  □ エラーハンドリング → ✓/✗

Layer 4: Hostile Validation
  □ 単一責任 → ✓/✗
  □ ハルシネーション無し → ✓/✗
  □ プレースホルダ無し → ✓/✗
  □ セキュリティ → ✓/✗

Layer 5: トリガーテスト
  □ 正のトリガー: "{prompt1}" → ✓/✗
  □ 正の変形: "{prompt2}" → ✓/✗
  □ 負のトリガー: "{prompt3}" → ✓/✗
```

### 4.2 スコア算出

```
Layer 1: {score}/20 (必須: 20/20)
Layer 2: {score}/20 (必須: 20/20)
Layer 3: {score}/25 (最低: 20/25)
Layer 4: {score}/20 (必須: 20/20)
Layer 5: {score}/15 (最低: 10/15)
─────────────────────
Total: {score}/100
```

## Phase 5: ITERATE (自動改善ループ)

スコアが90点未満の場合、最大3回まで自動改善を実行。

### 5.1 改善対象の特定

```
失敗項目:
1. {item} - 原因: {reason} - 修正方針: {fix}
2. {item} - 原因: {reason} - 修正方針: {fix}
```

### 5.2 自動修正

各失敗項目に対して:
1. 原因を分析
2. 修正を適用 (Edit tool)
3. 再検証

### 5.3 ループ制御

```
Round 1: Score {X}/100 → {合格/不合格}
Round 2: Score {Y}/100 → {合格/不合格}
Round 3: Score {Z}/100 → {合格/最終出力}
```

3回で90点に達しない場合:
- 現在のベストスコアで出力
- 残りの改善点をレポート
- ユーザーに手動修正を提案

## Phase 6: DEPLOY (出力・配置)

### 6.1 最終出力

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Skill Forge - Generation Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Name:     {skill-name}
  Score:    {score}/100 ({rating})
  Category: {category}
  Files:    {file-count}

  Output:   .claude/skills/{skill-name}/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6.2 配置先の確認

AskUserQuestion で配置先を確認:

1. **プロジェクトスキル**: `.claude/skills/{name}/` に配置
2. **パーソナルスキル**: `~/.claude/skills/{name}/` に配置
3. **カレントディレクトリ出力のみ**: ファイルだけ出力
4. **プラグインパッケージ**: skill-packager を呼び出し

### 6.3 配置実行

選択に応じてファイルをコピー/移動し、最終確認を出力。

## Error Handling

### リサーチ失敗時
- SkillsMP API不通: WebSearch のみで継続
- WebSearch失敗: ローカルテンプレート + references/ で生成
- 全リサーチ失敗: ユーザーに報告し、テンプレートベースで生成

### バリデーション失敗時
- Layer 1-2 失敗: 自動修正 (構造問題は機械的に修正可能)
- Layer 3 失敗: Description/Content を再生成
- Layer 4 失敗: 問題箇所を特定し修正
- Layer 5 失敗: Description のトリガーフレーズを調整

### 一般エラー
- ツール権限エラー: ユーザーに承認を依頼
- ファイル書き込みエラー: パスを確認し再試行
- コンテキスト枯渇: 中間結果を保存し継続方法を提案

## Troubleshooting

| 問題 | 原因 | 対策 |
|------|------|------|
| リサーチが遅い | 並列Agent未使用 | Task tool で並列実行 |
| スコアが上がらない | Description品質 | Pushy Description パターン適用 |
| 500行超過 | コンテンツ過多 | references/ に分離 |
| トリガーしない | フレーズ不足 | 具体的フレーズ5つ以上 |
| 過剰トリガー | NOT条件不足 | 否定条件を追加 |
