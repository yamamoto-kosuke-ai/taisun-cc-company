# スキル作成ベストプラクティス

## Anthropic公式 + コミュニティ知見統合

### 1. Description 設計原則

**"Pushy" Description**: トリガー率を最大化する記述法。

```yaml
# BAD: 曖昧で発動しない (トリガー率 ~20%)
description: Helps with projects

# GOOD: 具体的なトリガー条件 (トリガー率 ~50%)
description: Manages Linear project workflows

# BEST: トリガーフレーズ + 否定条件 (トリガー率 ~90%)
description: |
  Manages Linear project workflows. Use when user says
  "plan sprint", "create Linear tasks", or "project planning".
  Do NOT use for: simple task lists (use todo-manager instead).
```

**必須要素**:
1. WHAT: このスキルが何をするか
2. WHEN: いつ使うべきか（具体的なトリガーフレーズ）
3. NOT: いつ使うべきでないか（過剰トリガー防止）

### 2. Theory of Mind アプローチ

命令ではなく「なぜそうすべきか」を説明する。

```markdown
# BAD: 命令形
Always use snake_case for variables.

# GOOD: 理由付き
Use snake_case for variables because this codebase follows PEP 8
and mixed styles make grep-based navigation unreliable.
```

### 3. Progressive Disclosure 設計

```
SKILL.md (常にロード: 500行以下)
├── コア指示 (必ず実行する内容)
├── 主要ワークフロー
└── 参照ファイルへのリンク

references/ (必要時のみロード)
├── detailed-api.md (APIの詳細仕様)
├── examples.md (実例集)
└── troubleshooting.md (トラブルシューティング)

scripts/ (実行時のみ)
├── validate.sh
└── helper.py
```

### 4. 名前付け規則

| ルール | 例 |
|--------|-----|
| kebab-case のみ | `my-skill` (NOT `mySkill`) |
| 動名詞形推奨 | `reviewing-code` (NOT `code-reviewer`) |
| 64文字以内 | - |
| "claude" "anthropic" 禁止 | - |
| 機能を表す名前 | `api-rate-limiter` (NOT `util-1`) |

### 5. Content 品質基準

**必須要素**:
- [ ] 明確なステップバイステップ指示
- [ ] コード例（主要操作に対して）
- [ ] エラーハンドリング
- [ ] トラブルシューティングセクション

**推奨要素**:
- [ ] 使用例 (`/skill-name arg` の具体例)
- [ ] 期待される出力形式
- [ ] 前提条件・依存関係
- [ ] 制限事項

### 6. allowed-tools 設計

```yaml
# 読み取り専用スキル
allowed-tools: Read, Grep, Glob

# ファイル操作スキル
allowed-tools: Read, Write, Edit, Glob, Grep

# 外部連携スキル
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch

# Bash制限付き
allowed-tools: Bash(git:*, npm:*, python:*)
```

### 7. よくある失敗と対策

| 問題 | 原因 | 対策 |
|------|------|------|
| スキルが発動しない | description が曖昧 | トリガーフレーズを具体的に |
| 過剰に発動する | description が広すぎ | NOT条件を追加 |
| 指示が無視される | SKILL.md が長すぎ | references/ に分離 |
| コンテキスト圧迫 | 全コンテンツがSKILL.md内 | Progressive Disclosure |
| Prettierでフォーマット崩壊 | YAMLが再整形される | .prettierignore に追加 |
| 他ツールで動かない | Claude固有機能使用 | 基本フィールドのみ使用 |

### 8. スコアリング基準

| スコア | 評価 | 基準 |
|--------|------|------|
| 90-100 | Excellent | 全チェック項目クリア、トリガー精度90%+ |
| 80-89 | Good | 軽微な改善のみ必要 |
| 70-79 | Fair | 複数の改善が必要 |
| 60-69 | Poor | 大幅な改訂が必要 |
| <60 | Critical | 書き直し必要 |
