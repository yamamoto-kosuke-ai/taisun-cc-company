---
name: mission
description: "Global Skill & MCP Intelligence System - 世界規模の調査→キーワード抽出→深層分析→システム設計提案を一気通貫で実行"
interaction: plan
---

# Mission Skill - グローバル調査＆システム構築提案

## 概要
世界中のスキル/MCP/API/拡張機能マーケットを網羅的にリサーチし、
対象リポジトリに統合する「システム構築提案書」を自動生成する大型スキル。

## 起動条件
- **手動起動のみ**: `/mission` または `/mission <テーマ>`
- 自動発動しない（トークン節約）
- 新システム設計・大規模機能追加・市場調査時に使用

## 起動時ガイド表示（必須）

`/mission` が呼び出されたら、**まず以下のガイドを表示してからテーマ確認に進む**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /mission - グローバル調査 & システム構築提案
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

22サイト横断のマーケット調査 → キーワード抽出 → 深層分析(2パス)
→ リポジトリ分析 → 11セクション構成の提案書を自動生成します。

■ こんな時に使えます
  - 新しいシステム/サービスを設計したい
  - 競合・マーケットの全体像を把握したい
  - 技術選定の根拠が欲しい
  - 大規模な機能追加の計画を立てたい

■ 指示の出し方（例）
  /mission taisun cc-companyに追加すべき機能を世界中から調査して提案
  /mission SaaS型AIライティングツールの市場調査と設計
  /mission MCP市場の全体像を把握し、自社に統合できるものを提案
  /mission RAG vs Fine-tuning の技術比較と最適なアーキテクチャ提案

■ 所要時間: 2-5時間（6フェーズ、途中停止・再開可能）
■ トークン消費: 約65万-75万トークン/回
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

ガイド表示後、引数がなければ「どんなテーマで調査しますか？」と確認する。
引数があればガイド表示後すぐに実行を開始する。

## 実行フロー

```
[テーマ確認] → [Phase 1: マーケットスキャン] → [/compact]
→ [Phase 2: キーワードマイニング] → [/compact]
→ [Phase 3: 深層調査 Pass1] → [/compact]
→ [Phase 4: 深層調査 Pass2] → [/compact]
→ [Phase 5: リポジトリ分析] → [/compact]
→ [Phase 6: 最終提案書生成] → [完了報告]
```

## 事前準備

### テーマ確認
引数がない場合、ユーザーに調査テーマを確認する:
- 「何のシステムを設計しますか？」
- 「対象リポジトリはどこですか？」（デフォルト: 現在のプロジェクト）

### 成果物ディレクトリ作成
```bash
mkdir -p research keywords proposal
```

## コンプライアンスルール（全フェーズ共通）

- 各サイトの利用規約/robots.txt/レート制限を尊重する
- ペイウォール回避には踏み込まない
- SNSは公開情報の範囲で、必要最小限を取得し、個人の特定情報は保存しない
- YouTube/note/X などの全文転載は避ける（要点抽出・引用は最小限、短く）
- 重要主張には出典（URL/日時/発言元）を残す
- 推測と事実を明確に分離し、推測は根拠も記す

---

## Phase 1: マーケットスキャン

### 目的
seed URLsを起点に、マーケット/ディレクトリの情報構造を棚卸しする。

### 手順

1. `references/seed-urls.md` のURLリストを読み込む
2. 各サイトについてWebFetchで構造を把握（深さ2-3）
3. サイトごとに以下を表形式で整理:
   - カテゴリ体系
   - 検索/フィルタUI
   - 取得できるメタデータ項目
   - API有無
   - 利用規約/robots.txt/レート制限
   - 更新頻度
   - 差別化点

### サブエージェント起動（推奨）

Agent tool で `marketplace-scanner` を起動（`references/agents.md` 参照）:
- subagent_type: `Explore`
- model: `sonnet`
- run_in_background: true
- 結果は500文字以内で要約して返すよう指示

### 成果物
- `research/market_maps.md` — マーケット比較表
- `research/source_index.md` — 収集ソース一覧（URL・要点・日付）

### フェーズ完了時
`/compact Focus on: market_maps key findings, source_index summary, gaps identified, next actions; drop raw HTML and verbose logs`

---

## Phase 2: キーワードマイニング

### 目的
Phase 1で収集したカテゴリ/タグから、関連・複合・急上昇・ニッチキーワードを抽出する。

### 手順

1. Phase 1のmarket_maps.mdからカテゴリ/タグ/検索クエリ候補を抽出
2. スキルベースのタクソノミ（能力/入力/出力/依存/実行環境）にマッピング
3. 以下の4分類でキーワードを抽出（50-200件目標）:

| 分類 | 基準 | 例 |
|------|------|-----|
| related | 同義語/上位下位/用途別 | MCP → Model Context Protocol, tool-use |
| compound | 2-4語フレーズ | MCP + RAG + workflow |
| rising | GitHub stars増加/投稿頻度/リリース頻度 | Claude Code scheduled tasks |
| niche | 高専門性・低競合・高価値 | 医療向けMCP, 法務AI自動化 |

4. 各キーワードにrationale（選定理由）とsources（出典）を付記

### サブエージェント起動（推奨）

Agent tool で `keyword-miner` を起動（`references/agents.md` 参照）:
- subagent_type: `general-purpose`
- model: `sonnet`
- run_in_background: true

### 成果物
- `keywords/keyword_universe.csv` — 列: keyword, lang, type, rationale, sources, metrics_proxy
- `keywords/taxonomy.yaml` — 能力分類ツリー

### フェーズ完了時
`/compact Focus on: top 50 keywords, taxonomy structure, rising trends, niche opportunities; drop raw category lists`

---

## Phase 3: 深層調査 Pass1

### 目的
キーワードを使って国内/海外の情報を網羅的に収集する。

### 手順

1. 上位キーワード50-200件を確定
2. 各キーワードでWebSearchを実施（日本語+英語）
3. 重要なURLはWebFetchで本文取得
4. SNS/コミュニティ調査:

| ソース | 調査内容 |
|--------|---------|
| YouTube | 代表的・高シグナル動画を選定、字幕/文字起こし→論点・需要・ペイン抽出 |
| X | 代表スレ/投稿を抽出、主張のクラスタリング（賛否/課題/ユースケース） |
| Reddit | 関連subredditの上位投稿を分析 |
| Hacker News | 関連スレッドの議論を分析 |
| note | 日本語の技術記事・事例を収集 |

5. 各ソースの発見を以下でクラスタリング:
   - ユースケース
   - 課題/不満
   - 成功事例
   - 未解決ニーズ
   - 用語の揺れ

### サブエージェント起動（推奨）

Agent tool で `social-signal-analyst` を起動（`references/agents.md` 参照）:
- subagent_type: `general-purpose`
- model: `sonnet`
- run_in_background: true

### 成果物
- `research/social_signals.md` — SNS論点クラスタ
- `research/youtube_insights.md` — 動画→論点/ユースケース/キーワード
- `research/source_index.md` — 更新（新規ソース追加）

### フェーズ完了時
`/compact Focus on: top use cases, major pain points, unmet needs, trend signals, key quotes; drop raw search results and full transcripts`

---

## Phase 4: 深層調査 Pass2（ギャップ補完）

### 目的
Pass1の穴埋め・反証・見落とし確認・新規発見。

### 手順

1. Pass1の成果物を精読し、以下をリスト化:
   - 未確定事項
   - 不明点
   - 矛盾する情報
   - カバーできていないソース/言語/コミュニティ

2. 上位20-40キーワードを再度深掘り:
   - **別ソース**（Pass1で使わなかったサイト）
   - **別言語**（中国語、韓国語のコミュニティも必要に応じて）
   - **別コミュニティ**（Discord, Slack, フォーラム等の公開情報）

3. 論文/技術ブログ/実装例/OSSを重点調査

4. 新たな発見（差分）だけを抽出して追記

### 成果物
- `research/pass2_deltas.md` — Pass1からの差分・追加発見
- `research/gaps_closed.md` — ギャップ潰しの証跡（何を調べ、何がわかったか）

### フェーズ完了時
`/compact Focus on: key deltas from pass2, resolved contradictions, remaining unknowns, confidence levels; drop redundant pass1 details`

---

## Phase 5: リポジトリ分析

### 目的
対象リポジトリの構造を棚卸しし、実現可能なシステム構築案に落とし込む。

### 手順

1. 対象リポジトリ（デフォルト: 現在のプロジェクト）を全体俯瞰:
   - エントリポイント
   - 設定ファイル/プラグイン拡張点
   - データ層
   - UI層
   - CI/CD
   - 既存の制約

2. 既存機能/プラグイン/コマンド/設定の棚卸し

3. 「このリポジトリで実現できる最大の提案」を現実的制約付きで設計:
   - 追加すべきモジュール/ディレクトリ
   - 必要な依存パッケージ
   - 運用（監視・テスト・セキュリティ）

### サブエージェント起動（推奨）

Agent tool で `repo-auditor` を起動（`references/agents.md` 参照）:
- subagent_type: `system-architect`
- model: `sonnet`

### 成果物
- `proposal/repo_findings.md` — リポジトリ分析結果

### フェーズ完了時
`/compact Focus on: repo structure summary, extension points, constraints, proposed modules; drop file listings and raw code`

---

## Phase 6: 最終提案書生成

### 目的
全成果を統合し、「作れる粒度」のシステム構築提案書を完成させる。

### 手順

1. 以下の成果物を統合:
   - `research/market_maps.md`
   - `keywords/keyword_universe.csv`
   - `research/social_signals.md`
   - `research/youtube_insights.md`
   - `research/pass2_deltas.md`
   - `proposal/repo_findings.md`

2. `references/schema.md` のテンプレートに従い、11セクション構成の提案書を生成

3. コンプライアンスチェック:
   - データ取得・保存・配布が規約/著作権/プライバシー/PII観点で問題ないか確認
   - 危険箇所は具体的に修正案を提示

4. 意思決定ポイント（Go/No-Go項目）を明確化

### サブエージェント起動（推奨）

以下を**順次**起動:

1. `system-architect`（Agent tool, subagent_type: `system-architect`, model: `opus`）
   - 全成果を統合し MASTER_PROPOSAL.md を生成

2. `compliance-checker`（Agent tool, subagent_type: `security-architect`, model: `sonnet`）
   - 提案のリスク・規約チェック
   - `proposal/risk_register.md` と `proposal/compliance_notes.md` を生成

### 成果物
- `proposal/MASTER_PROPOSAL.md` — **最終提案書（メイン成果物）**
- `proposal/risk_register.md` — リスク登録簿
- `proposal/compliance_notes.md` — コンプライアンスノート

### 提案書の必須セクション（11項目）

1. **Executive Summary** — 狙い/価値/差別化
2. **市場地図** — Skills/MCP/API/拡張機能の全体像
3. **Keyword Universe** — 関連/複合/急上昇/ニッチの根拠付き
4. **データ取得戦略** — API/スクレイピング/更新検知/規約順守
5. **正規化データモデル** — Skill/Tool/MCP/Extension/API Packageの統一スキーマ
6. **トレンド検知アルゴリズム** — 代理指標/評価指標/ランキング
7. **システムアーキテクチャ** — 図 + コンポーネント責務
8. **実装計画** — MVP→拡張、リポジトリ変更案、タスク分解
9. **セキュリティ/法務/運用** — 監査ログ、PII、レート制限、SLA
10. **リスクと代替案** — 取得不能ソース時の設計
11. **意思決定ポイント** — ユーザーが判断できるGo/No-Go項目

---

## セッション跨ぎの対応

### 途中停止時
- 現在のフェーズと進捗を `SESSION_HANDOFF.md` に記録
- 生成済みの成果物はそのまま残る

### 再開時
- `SESSION_HANDOFF.md` を読み、中断したフェーズから再開
- 既存の成果物を活用し、重複調査を避ける

## 品質基準

- 主観でなく、収集データと根拠に基づいた提案
- 「作れる」粒度（API/DB/キュー/ジョブ/画面/権限）まで落とす
- 抽象論だけで終わらせず、具体的なリポジトリ変更案・ファイル案・データスキーマを提示
- 推測と事実を明確に分離
