# Agent Skills 仕様書 (agentskills.io 準拠)

## SKILL.md フォーマット

### YAML Frontmatter (必須フィールド)

```yaml
---
name: my-skill              # 必須: 64文字以内, 小文字+ハイフンのみ, [a-z0-9-]
description: |              # 必須(推奨): 1024文字以内
  What: このスキルが何をするか
  When: いつ使うべきか（トリガー条件）
---
```

### YAML Frontmatter (オプションフィールド)

```yaml
---
argument-hint: "[issue-number]"      # 引数のヒント（補完時に表示）
disable-model-invocation: true       # true = ユーザー手動のみ
user-invocable: false                # false = Claudeのみが起動
allowed-tools: Read, Grep, Glob      # 許可ツール（承認なしで実行）
model: sonnet                        # 実行モデル (sonnet/opus/haiku)
context: fork                        # fork = サブエージェントで実行
agent: Explore                       # サブエージェントタイプ
hooks: ...                           # スキルスコープのフック
license: Apache-2.0                  # ライセンス
compatibility: Requires git          # 前提条件 (500文字以内)
metadata:
  author: org-name
  version: "1.0.0"
---
```

### フィールド詳細

| フィールド | 必須 | 最大長 | 用途 |
|-----------|------|--------|------|
| name | No (ディレクトリ名使用) | 64文字 | スラッシュコマンド名 |
| description | 推奨 | 1024文字 | 自動トリガーの判断 |
| argument-hint | No | - | 補完表示用 |
| disable-model-invocation | No | - | true=手動のみ |
| user-invocable | No | - | false=非表示 |
| allowed-tools | No | - | ツール制限 |
| model | No | - | モデル指定 |
| context | No | - | fork=分離実行 |
| agent | No | - | エージェントタイプ |

### 変数置換

| 変数 | 説明 |
|------|------|
| `$ARGUMENTS` | スキル呼び出し時の全引数 |
| `$ARGUMENTS[N]` / `$N` | N番目の引数 (0-indexed) |
| `${CLAUDE_SESSION_ID}` | セッションID |

### 動的コンテキスト注入

```markdown
シェルコマンドの出力を埋め込む:
!`git status`
!`gh pr diff`
```

## ディレクトリ構造

```
skill-name/
├── SKILL.md           # 必須 (500行以下推奨)
├── scripts/           # 実行スクリプト
├── references/        # 参照ドキュメント
└── assets/            # テンプレート・静的リソース
```

## Progressive Disclosure (3層設計)

| 層 | 読み込み | トークン目安 |
|----|---------|-------------|
| メタデータ | 常時 (name+description) | ~100 |
| SKILL.md本文 | 起動時 | 5000以下推奨 |
| references/ | 必要時のみ | 無制限 |

## 格納場所と優先順位

| 優先度 | 場所 | スコープ |
|--------|------|---------|
| 1 (最高) | Enterprise managed | 全組織ユーザー |
| 2 | Personal `~/.claude/skills/` | 全プロジェクト |
| 3 | Project `.claude/skills/` | プロジェクト内 |
| 4 (最低) | Plugin `skills/` | Plugin有効時 |

## 呼び出し制御マトリクス

| 設定 | ユーザー呼び出し | Claude呼び出し |
|------|-----------------|---------------|
| (デフォルト) | Yes | Yes |
| disable-model-invocation: true | Yes | No |
| user-invocable: false | No | Yes |

## クロスプラットフォーム互換性

基本フィールド (name, description, markdown本文) は全ツールで動作:
- Claude Code, Cursor, VS Code, OpenAI Codex CLI, Gemini CLI
- Windsurf, Cline, Aider, Roo Code, Junie 他30+ツール

Claude Code固有拡張 (他ツールでは無視される):
- `context: fork`, `agent:`, `allowed-tools`, `hooks`
- `!`command`` 動的注入, `user-invocable`
