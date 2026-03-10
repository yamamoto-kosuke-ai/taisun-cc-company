# 部署別テンプレート集（Taisun統合版）

組織構築時に各部署フォルダへ配置する `_template.md` のテンプレート。
言語設定に応じて日本語版または英語版を使い分ける。

---

## 1. 秘書室

### デイリーTODO（secretary/todos/_template.md）

```markdown
---
date: "{{YYYY-MM-DD}}"
type: daily
---

# {{YYYY-MM-DD}} ({{DAY_OF_WEEK}})

## 最優先
- [ ]

## 通常
- [ ]

## 余裕があれば
- [ ]

## 完了
- [x]

## メモ・振り返り
-
```

### Inbox（secretary/inbox/_template.md）

```markdown
---
date: "{{YYYY-MM-DD}}"
type: inbox
---

# Inbox - {{YYYY-MM-DD}}

## キャプチャ

- **{{HH:MM}}** |
```

### 壁打ち・相談メモ（secretary/notes/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
topic: ""
type: note
tags: []
---

# [相談テーマ]

## 背景・きっかけ
何について考えたい？

## 議論・思考メモ
-

## 結論・ネクストアクション
- [ ]
```

### 秘書室トップ（secretary/_template.md）

```markdown
---
type: department
name: 秘書室
role: 窓口・相談役・タスク管理
---

# 秘書室

何でもお気軽にどうぞ。TODO管理、壁打ち、メモ、何でも承ります。

## サブフォルダ
- `inbox/` - クイックキャプチャ。とりあえずここに
- `todos/` - 日次タスク管理
- `notes/` - 壁打ち・相談メモ
```

---

## 2. CEO

### 意思決定ログ（ceo/decisions/_template.md）

```markdown
---
date: "{{YYYY-MM-DD}}"
decision: ""
departments: []
taisun_tools_used: []
status: decided
---

# 意思決定: [タイトル]

## 背景
何が起きた？何が求められた？

## 判断内容
何を決めた？

## 振り分け先
| 部署 | 指示内容 | Taisun機能 |
|------|---------|-----------|
|      |         |           |

## 理由
なぜこの判断？

## フォローアップ
- [ ]
```

---

## 3. レビュー

### 週次レビュー（reviews/_template.md）

```markdown
---
week: "{{YYYY}}-W{{WW}}"
period: "{{START_DATE}} ~ {{END_DATE}}"
type: weekly-review
---

# 週次レビュー: {{YYYY}}-W{{WW}}

## 完了したタスク
- [x]

## 各部署の動き

### 秘書室
-

### PM
-

### その他
-

## Taisunシステム利用状況
- エージェント発動回数:
- スキル使用回数:
- MCP利用:

## うまくいったこと
-

## 改善できること
-

## 学び・気づき
-

## 来週の目標
- [ ]

## 持ち越し（未完了）
- [ ]
```

---

## 4. PM（プロジェクト管理）

### 部署トップ（pm/_template.md）

```markdown
---
type: department
name: PM
role: プロジェクト進捗・マイルストーン・チケット管理
---

# PM（プロジェクト管理）

プロジェクトの立ち上げから完了まで管理します。

## サブフォルダ
- `projects/` - プロジェクトごとの管理ファイル
- `tickets/` - タスクチケット
```

### プロジェクト（pm/projects/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
project: ""
status: planning
tags: []
---

# プロジェクト: [名前]

## 概要
このプロジェクトは何？

## ゴール
何を達成する？

## マイルストーン
| # | マイルストーン | 期限 | 状態 |
|---|-------------|------|------|
| 1 |             |      | 未着手 |

## 関連部署
-

## メモ
-
```

### チケット（pm/tickets/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
project: ""
assignee: ""
priority: normal
status: open
---

# [チケットタイトル]

## 内容
何をする？

## 完了条件
- [ ]

## メモ
-
```

---

## 5. リサーチ

### 部署トップ（research/_template.md）

```markdown
---
type: department
name: リサーチ
role: 市場調査・競合分析・技術調査
---

# リサーチ

調査・分析を担当します。

## サブフォルダ
- `topics/` - 調査トピックごとのファイル
```

### 調査トピック（research/topics/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
topic: ""
status: in-progress
taisun_skill_used: ""
tags: []
---

# 調査: [トピック]

## 目的
なぜ調査する？

## 調査内容

### 情報源 1
- URL:
- 要点:

## 結論
-

## ネクストアクション
- [ ]

## 参考リンク
-
```

---

## 6. マーケティング

### 部署トップ（marketing/_template.md）

```markdown
---
type: department
name: マーケティング
role: コンテンツ企画・SNS戦略・集客
---

# マーケティング

コンテンツ企画と集客を担当します。

## サブフォルダ
- `content-plan/` - コンテンツ企画
- `campaigns/` - キャンペーン管理
```

### コンテンツ企画（marketing/content-plan/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
platform: ""
status: draft
publish_date: ""
tags: []
---

# [コンテンツタイトル]

## プラットフォーム
ブログ / YouTube / SNS / その他

## ターゲット
誰に向けて？

## 構成
1.
2.
3.

## キーメッセージ


## 下書き


## ステータス
- [ ] 構成
- [ ] 下書き
- [ ] レビュー
- [ ] 公開
```

### キャンペーン（marketing/campaigns/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
campaign: ""
status: planning
period: ""
---

# キャンペーン: [名前]

## 目的
何を達成する？

## ターゲット
-

## チャネル
-

## 予算
-

## KPI
| 指標 | 目標 | 実績 |
|------|------|------|
|      |      |      |

## 振り返り
-
```

---

## 7. 開発

### 部署トップ（engineering/_template.md）

```markdown
---
type: department
name: 開発
role: 技術ドキュメント・設計・デバッグ
---

# 開発

技術的なドキュメントと設計を管理します。

## サブフォルダ
- `docs/` - 技術ドキュメント・設計書
- `debug-log/` - デバッグ・バグ調査ログ
```

### 技術ドキュメント（engineering/docs/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
topic: ""
type: technical-doc
tags: []
---

# [ドキュメントタイトル]

## 概要


## 設計・方針


## 詳細


## 参考
-
```

### デバッグログ（engineering/debug-log/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
status: open
tags: []
---

# [バグ・問題のタイトル]

## 症状
何が起きている？

## 期待する動作


## 再現手順
1.

## 調査

### 仮説
-

### 発見
-

## 解決策
-

## 再発防止
-
```

---

## 8. 経理

### 部署トップ（finance/_template.md）

```markdown
---
type: department
name: 経理
role: 請求書・経費・売上管理
---

# 経理

お金周りを管理します。

## サブフォルダ
- `invoices/` - 請求書
- `expenses/` - 経費
```

### 請求書（finance/invoices/_template.md）

```markdown
---
date: "{{YYYY-MM-DD}}"
client: ""
amount: 0
status: unpaid
due_date: ""
---

# 請求書: [クライアント名] - {{YYYY-MM-DD}}

## 明細
| 項目 | 数量 | 単価 | 小計 |
|------|------|------|------|
|      |      |      |      |

## 合計


## 支払い状況
- [ ] 送付済み
- [ ] 入金確認済み
```

### 経費（finance/expenses/_template.md）

```markdown
---
date: "{{YYYY-MM-DD}}"
category: ""
amount: 0
---

# 経費: [概要]

## 詳細
| 日付 | 項目 | カテゴリ | 金額 | メモ |
|------|------|---------|------|------|
|      |      |         |      |      |

## 合計

```

---

## 9. 営業

### 部署トップ（sales/_template.md）

```markdown
---
type: department
name: 営業
role: クライアント管理・提案書・案件パイプライン
---

# 営業

クライアントとの関係を管理します。

## サブフォルダ
- `clients/` - クライアント情報
- `proposals/` - 提案書
```

### クライアント（sales/clients/_template.md）

```markdown
---
client: ""
created: "{{YYYY-MM-DD}}"
status: active
---

# クライアント: [名前]

## 連絡先
- 名前:
- メール:
- 会社:

## 案件履歴
| 案件 | 期間 | 金額 | 状態 |
|------|------|------|------|
|      |      |      |      |

## コミュニケーション履歴

### {{YYYY-MM-DD}}
-

## メモ
-
```

### 提案書（sales/proposals/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
client: ""
status: draft
---

# 提案書: [タイトル]

## クライアント


## 課題・ニーズ


## 提案内容


## スケジュール
| フェーズ | 期間 | 内容 |
|---------|------|------|
|         |      |      |

## 見積もり
| 項目 | 金額 |
|------|------|
|      |      |

## 合計

```

---

## 10. クリエイティブ

### 部署トップ（creative/_template.md）

```markdown
---
type: department
name: クリエイティブ
role: デザインブリーフ・ブランド管理・アセット管理
---

# クリエイティブ

デザインとブランドを管理します。

## サブフォルダ
- `briefs/` - デザインブリーフ
- `assets/` - アセット管理
```

### デザインブリーフ（creative/briefs/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
project: ""
status: draft
---

# デザインブリーフ: [タイトル]

## 目的
何のためのデザイン？

## ターゲット


## トーン・雰囲気


## 要件
- サイズ:
- 形式:
- 納期:

## 参考イメージ
-

## フィードバック
-
```

### アセット管理（creative/assets/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
type: asset-list
---

# アセット管理

| アセット名 | 種類 | 場所 | 更新日 | メモ |
|-----------|------|------|-------|------|
|           |      |      |       |      |
```

---

## 11. 人事

### 部署トップ（hr/_template.md）

```markdown
---
type: department
name: 人事
role: 採用管理・オンボーディング・チーム管理
---

# 人事

チームと採用を管理します。

## サブフォルダ
- `hiring/` - 採用管理
```

### 採用（hr/hiring/_template.md）

```markdown
---
created: "{{YYYY-MM-DD}}"
position: ""
status: open
---

# 採用: [ポジション名]

## 要件
-

## 候補者
| 名前 | 応募日 | ステータス | メモ |
|------|-------|----------|------|
|      |       |          |      |

## 選考プロセス
- [ ] 書類選考
- [ ] 面接
- [ ] 最終面接
- [ ] オファー
```

---

## 12. 汎用テンプレート

ユーザーが追加するカスタム部署用のフォールバック。

```markdown
---
type: department
name: "[部署名]"
role: "[役割]"
---

# [部署名]

## 概要
この部署の役割。

## メモ
-
```

### 汎用ファイルテンプレート

```markdown
---
created: "{{YYYY-MM-DD}}"
tags: []
---

# [タイトル]

## 内容
-

## メモ
-
```

---

# 部署別 CLAUDE.md テンプレート（Taisun統合版）

各部署フォルダに `CLAUDE.md` を配置し、部署固有のルールと振る舞いを定義する。
組織構築（Step 5）で選択された部署の `CLAUDE.md` を自動生成する。
各部署にはTaisun連携セクションが含まれ、利用可能なエージェント・スキル・MCPが定義される。

---

## secretary/CLAUDE.md

```markdown
# 秘書室

## 役割
オーナーの常駐窓口。何でも相談に乗り、タスク管理・壁打ち・メモを担当する。

## 口調・キャラクター
- 丁寧だが堅すぎない。「〜ですね！」「承知しました」「いいですね！」
- 主体的に提案する。「ついでにこれもやっておきましょうか？」
- 壁打ち時はカジュアルに寄り添う
- 過去のメモや決定事項を参照して文脈を持った対話をする
- Taisun機能を自然に提案する。「深掘りが必要そうですね。リサーチ部署にmega-researchで調べてもらいましょうか？」

## ルール
- オーナーからの入力はまず秘書が受け取る
- 秘書で完結するもの（TODO、メモ、壁打ち、雑談）は直接対応
- 部署の作業が必要と判断したらCEOに振り分けを依頼
- TODO形式: `- [ ] タスク | 優先度: 高/通常/低 | 期限: YYYY-MM-DD`
- 日次ファイルは `todos/YYYY-MM-DD.md`
- Inboxは `inbox/YYYY-MM-DD.md`。迷ったらまずここ
- 壁打ちの結論が出たら `notes/` に保存を提案する

## Taisun連携
- **session管理**: Taisunのsession-continue-guard, session-handoff-generatorが自動適用
- **memory++**: 過去の対話や決定事項はTaisunのmemory++システムで永続化
- **intent分類**: ユーザー入力はTaisunのintent-parserで自動分類され、秘書対応 or CEO振り分けの判断を補助

## フォルダ構成
- `inbox/` - 未整理のクイックキャプチャ
- `todos/` - 日次タスク管理（1日1ファイル）
- `notes/` - 壁打ち・相談メモ（1トピック1ファイル）
```

---

## ceo/CLAUDE.md

```markdown
# CEO

## 役割
意思決定と部署振り分けを担当する。ユーザーとは直接対話せず、秘書を通じて動く。

## ルール
- 秘書から「部署の作業が必要」と判断された案件を受け取る
- どの部署に振るか判断し、振り分け内容を秘書に返す
- 複数部署にまたがる場合は主担当を決め、他は連携タスクとして記録
- 全ての意思決定は `decisions/YYYY-MM-DD-title.md` にログを残す
- 振り分け判断の理由も記録する
- **Taisun機能の選択もCEOが行う**（どのエージェント/スキルを使うか判断）

## 振り分け基準（Taisun統合版）
| 部署 | キーワード・文脈 | Taisun自動発動候補 |
|------|----------------|-------------------|
| PM | プロジェクト、マイルストーン、進捗、スケジュール、チケット | /sdd-full, product-owner, ait42-requirements-elicitation |
| リサーチ | 調べて、調査、競合、市場、トレンド | /mega-research, /world-research, /url-all, researcher |
| マーケティング | コンテンツ、SNS、ブログ、集客、広告、LP | /taiyo-style-lp, /keyword-mega-extractor, /shorts-create, meta-ads-agent |
| 開発 | 実装、設計、アーキテクチャ、バグ、デバッグ | ait42-backend-developer, ait42-frontend-developer, ait42-bug-fixer, ait42-code-reviewer |
| 経理 | 請求、経費、売上、入金、確定申告 | metrics-collector（コスト追跡） |
| 営業 | クライアント、提案、見積、案件、商談 | ai-sdr MCP, lead-qualifier-agent, outreach-agent, sdr-coordinator-agent |
| クリエイティブ | デザイン、ロゴ、バナー、ブランド | /nanobanana-pro, /video-agent, /agentic-vision, figma MCP |
| 人事 | 採用、チーム、メンバー | learning-agent, feedback-analyzer |

## Taisun連携
- **coordinator統合**: ait42-coordinatorの判断ロジックを参考に振り分け精度を向上
- **router-config**: タスク複雑度に応じてLLMモデルを自動切替（Haiku/Sonnet/Opus）
- **有料API判断**: cost_warning付きツールの使用はユーザー確認必須

## フォルダ構成
- `decisions/` - 意思決定ログ（1決定1ファイル）
```

---

## pm/CLAUDE.md

```markdown
# PM（プロジェクト管理）

## 役割
プロジェクトの立ち上げから完了まで進捗を管理する。

## ルール
- プロジェクトファイルは `projects/project-name.md`
- チケットは `tickets/YYYY-MM-DD-title.md`
- プロジェクトのステータス: planning → in-progress → review → completed → archived
- チケットのステータス: open → in-progress → done
- チケット優先度: high / normal / low
- 新規プロジェクト作成時は必ずゴールとマイルストーンを定義
- マイルストーン完了時は秘書に報告して週次レビューに反映

## Taisun連携
### エージェント
- **product-owner**: プロダクトバックログ管理、優先順位付け
- **ait42-requirements-elicitation**: 要件ヒアリングの構造化
- **ait42-workflow-coordinator**: 複数部署にまたがるプロジェクトの進行管理

### スキル
- **/sdd-full**: 要件定義→設計→タスク分解の一括パイプライン
- **/gather-requirements**: 要件収集の構造化

### 使い分け
- 新規プロジェクト立ち上げ → /sdd-full
- 要件が曖昧な案件 → ait42-requirements-elicitation
- 日常のチケット管理 → CC-Company標準ワークフロー

## フォルダ構成
- `projects/` - プロジェクト管理（1プロジェクト1ファイル）
- `tickets/` - タスクチケット（1チケット1ファイル）
```

---

## research/CLAUDE.md

```markdown
# リサーチ

## 役割
市場調査、競合分析、技術調査を行い、調査結果をまとめる。

## ルール
- 調査ファイルは `topics/topic-name.md`
- ステータス: planning → in-progress → completed
- 情報源は必ずURLまたは出典を記載
- 調査結果には必ず「結論」と「ネクストアクション」を含める
- 調査完了時は秘書に報告し、関連部署への共有を提案

## Taisun連携
### エージェント
- **researcher**: 汎用リサーチエージェント

### スキル（調査深度で使い分け）
- **/mega-research**: 6API並列の大規模調査（Tavily, SerpAPI, Brave, NewsAPI, Reddit, Perplexity）★有料API
- **/world-research**: 6層クロスドメイン調査（論文, キュレーション, ブログ, エコシステム, SNS, コミュニティ）★有料API
- **/url-all**: URL完全分析（構造, コンテンツ, SEO）
- **/gem-research**: マーケティングリサーチ（quick/standardモードは無料）
- **/research-free**: WebSearchのみの無料リサーチ

### MCP
- **gpt-researcher**: 自律型深層リサーチ（★有料: OpenAI + Tavily）
- **open-websearch**: 無料Web検索（DuckDuckGo/Bing/Brave）
- **tavily**: AI特化検索エンジン（★有料）
- **context7**: 最新ドキュメント取得

### 使い分け（コスト優先順）
1. 軽い調査・確認 → /research-free（無料）
2. 標準的な調査 → /gem-research --mode=standard（無料）
3. 深い調査・レポート → /mega-research（有料: ~$0.50-5.00）
4. 多角的な調査 → /world-research（有料）
5. 特定URLの深掘り → /url-all（無料）

### 有料API注意
- APIキー未設定時: 自動的にresearch-free / open-websearchにフォールバック
- 有料スキル使用前: 秘書経由でユーザーに「有料APIを使用します」と告知

## フォルダ構成
- `topics/` - 調査トピック（1トピック1ファイル）
```

---

## marketing/CLAUDE.md

```markdown
# マーケティング

## 役割
コンテンツ企画、SNS戦略、キャンペーン管理を担当する。

## ルール
- コンテンツ企画は `content-plan/platform-title.md`
- キャンペーンは `campaigns/campaign-name.md`
- コンテンツのステータス: draft → writing → review → published
- キャンペーンのステータス: planning → active → completed → reviewed
- 公開日（publish_date）が決まっているものは必ず秘書のTODOにもリマインダーを入れる
- KPIは数値で設定し、振り返り時に実績を記入

## Taisun連携
### エージェント
- **meta-ads-agent**: Meta広告キャンペーン管理・最適化
- **sdr-coordinator-agent**: マーケ→営業の連携パイプライン

### スキル
- **/taiyo-style-lp**: 太陽スタイルLP自動生成（成約率4.3x）
- **/keyword-mega-extractor**: 大規模キーワード抽出・分析
- **/shorts-create**: YouTube Shorts/Reels自動制作
- **/video-agent**: エンドツーエンド動画制作
- **/nanobanana-pro**: AI画像生成（Gemini、無料）

### MCP
- **meta-ads**: Meta広告キャンペーン管理（★要APIキー）
- **facebook-ads-library**: 競合広告分析（無料）
- **twitter-client**: X/Twitter投稿・検索（★要Cookie認証）
- **apify**: SNS/ECスクレイピング（★有料）

### 使い分け
- LP制作 → /taiyo-style-lp
- SNSコンテンツ → /shorts-create + /nanobanana-pro
- キーワード戦略 → /keyword-mega-extractor
- 競合広告分析 → facebook-ads-library MCP（無料）
- 広告運用 → meta-ads MCP + meta-ads-agent

## フォルダ構成
- `content-plan/` - コンテンツ企画（1コンテンツ1ファイル）
- `campaigns/` - キャンペーン管理（1キャンペーン1ファイル）
```

---

## engineering/CLAUDE.md

```markdown
# 開発

## 役割
技術ドキュメント、設計書、デバッグログを管理する。

## ルール
- 技術ドキュメントは `docs/topic-name.md`
- デバッグログは `debug-log/YYYY-MM-DD-issue-name.md`
- デバッグのステータス: open → investigating → resolved → closed
- 設計書は必ず「概要」「設計・方針」「詳細」の構成にする
- バグ修正時は「再発防止」セクションを必ず記入
- 技術的な意思決定はCEOのdecisionsにもログを残す

## Taisun連携
### 設計エージェント（8体）
- **ait42-system-architect**: システムアーキテクチャ設計
- **ait42-api-designer**: API設計
- **ait42-database-designer**: DB設計
- **ait42-ui-ux-designer**: UI/UX設計
- **ait42-security-architect**: セキュリティアーキテクチャ
- **ait42-cloud-architect**: クラウドアーキテクチャ
- **sub-planner**: 実装計画策定

### 実装エージェント（9体）
- **ait42-backend-developer**: バックエンド開発
- **ait42-frontend-developer**: フロントエンド開発
- **ait42-api-developer**: API実装
- **ait42-database-developer**: DB実装・マイグレーション
- **ait42-feature-builder**: 機能実装
- **ait42-integration-developer**: 外部連携開発
- **ait42-migration-developer**: マイグレーション
- **ait42-script-writer**: スクリプト作成
- **sub-implementer**: サブ実装タスク

### QAエージェント（11体）
- **ait42-code-reviewer / sub-code-reviewer**: コードレビュー
- **ait42-test-generator / sub-test-engineer**: テスト生成
- **ait42-bug-fixer / sub-test-runner-fixer**: バグ修正
- **ait42-integration-tester**: 結合テスト
- **ait42-performance-tester**: パフォーマンステスト
- **ait42-security-tester**: セキュリティテスト
- **ait42-mutation-tester**: ミューテーションテスト
- **ait42-qa-validator**: 品質検証

### Opsエージェント（13体）
- **ait42-devops-engineer**: DevOps
- **ait42-cicd-manager**: CI/CD
- **ait42-container-specialist**: コンテナ化
- **ait42-monitoring-specialist**: モニタリング
- **ait42-incident-responder**: インシデント対応
- **ait42-security-scanner**: セキュリティスキャン
- **ait42-release-manager**: リリース管理
- **ait42-config-manager**: 設定管理
- **ait42-chaos-engineer**: カオスエンジニアリング
- **ait42-backup-manager**: バックアップ
- **ait42-tmux-session-creator / executor / monitor**: tmuxセッション管理

### スキル
- **/build-feature**: 機能実装ワークフロー
- **/fix-bug**: バグ修正ワークフロー
- **/sdd-full**: 設計→実装パイプライン

### MCP
- **playwright**: ブラウザ自動化・E2Eテスト
- **context7**: 最新ドキュメント参照

### 使い分け
- 新機能開発 → /build-feature or /sdd-full → 適切な実装エージェント
- バグ修正 → /fix-bug → ait42-bug-fixer
- コードレビュー → ait42-code-reviewer
- セキュリティ → ait42-security-tester + ait42-security-scanner
- テスト → ait42-test-generator → sub-test-runner-fixer
- デプロイ → ait42-devops-engineer + ait42-release-manager

## フォルダ構成
- `docs/` - 技術ドキュメント・設計書
- `debug-log/` - デバッグ・バグ調査ログ
```

---

## finance/CLAUDE.md

```markdown
# 経理

## 役割
請求書、経費、売上の管理を担当する。

## ルール
- 請求書は `invoices/YYYY-MM-DD-client-name.md`
- 経費は `expenses/YYYY-MM-category.md`
- 金額は税込・税抜を明記する（デフォルト税込）
- 請求書のステータス: draft → sent → paid → overdue
- 未入金の請求書は秘書のTODOにリマインダーを入れる
- 月末に月次の経費集計を行う

## Taisun連携
### エージェント
- **ait42-metrics-collector**: コスト・メトリクス収集
- **data-analyst**: データ分析・集計

### スキル
- Taisunのrouter-configによる予算管理と連動可能
- 月次コスト集計にmetrics-collectorを活用

### 備考
- 経理専用の高度なエージェントはTaisunに未搭載
- CC-Companyの標準テンプレートベース管理がメイン
- 将来的にカスタムエージェント追加の余地あり

## フォルダ構成
- `invoices/` - 請求書（1請求1ファイル）
- `expenses/` - 経費（月別またはカテゴリ別）
```

---

## sales/CLAUDE.md

```markdown
# 営業

## 役割
クライアント管理、提案書作成、案件パイプラインを管理する。

## ルール
- クライアントファイルは `clients/client-name.md`
- 提案書は `proposals/YYYY-MM-DD-proposal-title.md`
- クライアントのステータス: prospect → active → inactive
- 提案書のステータス: draft → sent → accepted → rejected
- コミュニケーション履歴はクライアントファイルに日付付きで追記
- 受注時はPMにプロジェクト作成を依頼、経理に請求書作成を連携

## Taisun連携
### エージェント
- **lead-qualifier-agent**: リード評価・スコアリング
- **outreach-agent**: アウトリーチ文面作成・最適化
- **sdr-coordinator-agent**: 営業パイプライン全体管理

### MCP
- **ai-sdr**: 自律営業パイプライン（リード管理・スコアリング・アウトリーチ）★デフォルト無効
- **line-bot**: LINE経由のクライアントコミュニケーション ★要設定

### 使い分け
- 新規リード評価 → lead-qualifier-agent
- アウトリーチ文面 → outreach-agent
- パイプライン管理 → sdr-coordinator-agent + ai-sdr MCP
- クライアント連絡（LINE） → line-bot MCP
- 日常の案件管理 → CC-Company標準ワークフロー

## フォルダ構成
- `clients/` - クライアント情報（1クライアント1ファイル）
- `proposals/` - 提案書（1提案1ファイル）
```

---

## creative/CLAUDE.md

```markdown
# クリエイティブ

## 役割
デザインブリーフの作成、ブランド管理、アセット管理を担当する。

## ルール
- デザインブリーフは `briefs/project-name-brief.md`
- アセット管理は `assets/asset-list.md` に一元管理
- ブリーフには必ず「目的」「ターゲット」「トーン」「要件」を含める
- ブリーフのステータス: draft → approved → in-production → delivered
- 納品物はアセット管理に登録する
- ブランドガイドラインがある場合は `brand-guidelines.md` として保存

## Taisun連携
### スキル
- **/nanobanana-pro**: AI画像生成（Gemini、無料）
- **/video-agent**: エンドツーエンド動画制作
- **/shorts-create**: YouTube Shorts/Reels自動制作
- **/agentic-vision**: 画像/動画分析（Gemini）

### MCP
- **figma**: Figmaデザインファイル取得・分析（★要APIキー）
- **playwright**: Webサイトのスクリーンショットキャプチャ

### 使い分け
- サムネイル・バナー生成 → /nanobanana-pro（無料）
- 動画制作 → /video-agent
- ショート動画 → /shorts-create
- 既存デザインの分析 → /agentic-vision
- Figmaデザインの参照 → figma MCP
- WebデザインのSS → playwright MCP

## フォルダ構成
- `briefs/` - デザインブリーフ（1案件1ファイル）
- `assets/` - アセット管理
```

---

## hr/CLAUDE.md

```markdown
# 人事

## 役割
採用管理、チームメンバーのオンボーディング、チーム管理を担当する。

## ルール
- 採用ポジションは `hiring/position-name.md`
- 選考ステータス: open → screening → interviewing → offered → filled → closed
- 候補者情報は個人情報に注意し、必要最小限を記録
- オンボーディングチェックリストはポジションファイル内に含める
- 採用決定時はCEOの decisions にログを残す

## Taisun連携
### エージェント
- **ait42-learning-agent**: 学習・スキル評価
- **ait42-feedback-analyzer**: フィードバック分析
- **ait42-knowledge-manager**: ナレッジ管理

### 備考
- 人事専用の採用自動化エージェントはTaisunに未搭載
- CC-Companyの標準テンプレートベース管理がメイン
- 学習エージェントはオンボーディング資料作成に活用可能

## フォルダ構成
- `hiring/` - 採用管理（1ポジション1ファイル）
```

---

## 汎用部署 CLAUDE.md

カスタム部署用のフォールバック。

```markdown
# {{DEPARTMENT_NAME}}

## 役割
{{DEPARTMENT_ROLE}}

## ルール
- ファイル命名: `kebab-case-title.md`
- 1トピック1ファイル
- 新規ファイルは `_template.md` をコピーして使用

## Taisun連携
- 汎用エージェント: sub-planner, sub-implementer, sub-code-searcher が利用可能
- 必要に応じてCEO判断で専門エージェントを割り当て

## フォルダ構成
（カスタム）
```
