# サブエージェント定義

`/mission` の各フェーズで起動するサブエージェントの定義。
Claude CodeのAgent toolで起動する。

## エージェント一覧

### 1. marketplace-scanner（Phase 1で使用）

- **役割**: Seed URLsを起点に、マーケット/ディレクトリの情報構造・取得方法・規約・更新頻度・主要カテゴリ/タグを棚卸し
- **Agent tool設定**:
  - subagent_type: `Explore`
  - model: `sonnet`
  - run_in_background: `true`
- **プロンプト要約**: OSINTとプロダクトリサーチの専門家として、seed_urlsをサイト別に調査。(1)カテゴリ体系 (2)検索/フィルタ (3)取得できるメタデータ (4)API有無 (5)利用規約/robots/レート制限 (6)更新頻度 (7)差別化点 を表形式でまとめる。出典URLと確認日を必ず残す。全文転載は禁止、要点のみ。
- **成果物**: `research/market_maps.md`, `research/source_index.md`

### 2. keyword-miner（Phase 2で使用）

- **役割**: Skillベースで関連/複合/急上昇/ニッチキーワードを抽出し、タクソノミとkeyword_universeを作る
- **Agent tool設定**:
  - subagent_type: `general-purpose`
  - model: `sonnet`
  - run_in_background: `true`
- **プロンプト要約**: 情報検索(IR)とSEO/トレンド分析の専門家として、marketplace-scannerが集めたカテゴリ/タグ/クエリ例と追加検索から、(related|compound|rising|niche)に分類したキーワード宇宙を作る。risingは代理指標(投稿増/スター増/新リリース等)を添える。出典URL/日付を残す。
- **成果物**: `keywords/keyword_universe.csv`, `keywords/taxonomy.yaml`

### 3. social-signal-analyst（Phase 3で使用）

- **役割**: X/Reddit/HN/note/YouTube等の公開情報から議論・需要・ペインをクラスタリングして抽出
- **Agent tool設定**:
  - subagent_type: `general-purpose`
  - model: `sonnet`
  - run_in_background: `true`
- **プロンプト要約**: コミュニティ分析の専門家として、キーワード上位群から公開情報を収集し、(1)ユースケース (2)課題/不満 (3)成功事例 (4)未解決ニーズ (5)用語の揺れ をクラスタリング。YouTubeは可能なら字幕/文字起こしを参照し、要点を抽出（全文転載禁止、短い引用のみ）。
- **成果物**: `research/social_signals.md`, `research/youtube_insights.md`

### 4. repo-auditor（Phase 5で使用）

- **役割**: target_repoを読んで、拡張点/不足/実装可能範囲を特定し、提案をリポジトリ前提に落とし込む
- **Agent tool設定**:
  - subagent_type: `system-architect`
  - model: `sonnet`
- **プロンプト要約**: シニアソフトウェアアーキテクトとして、target_repoを全体把握。(1)構成 (2)エントリポイント (3)設定/プラグイン/コマンド (4)データ層 (5)CI/CD (6)既存の制約 を棚卸し。新規に追加すべきモジュール/ディレクトリ/設定/テストを具体案として列挙。
- **成果物**: `proposal/repo_findings.md`

### 5. system-architect（Phase 6で使用）

- **役割**: 全成果を統合し、「作れる粒度」のシステム構築提案（MVP→拡張）を完成させる
- **Agent tool設定**:
  - subagent_type: `system-architect`
  - model: `opus`
- **プロンプト要約**: Principal Architectとして、market_maps、keyword_universe、social_signals、repo_findingsを統合し、MASTER_PROPOSAL.mdを完成させる。データモデル、パイプライン、更新検知、ランキング/トレンド、検索UI、API、運用(監視/監査/PII/レート制限)まで落とす。抽象論禁止。必要ならMermaidでアーキ図を出す。
- **成果物**: `proposal/MASTER_PROPOSAL.md`

### 6. compliance-checker（Phase 6で使用）

- **役割**: 規約・著作権・プライバシー・運用リスクをチェックし、取得手法の代替案を提示
- **Agent tool設定**:
  - subagent_type: `security-architect`
  - model: `sonnet`
- **プロンプト要約**: プロダクト法務/セキュリティ担当として、提案のデータ取得・保存・配布が規約/著作権/プライバシー/PII観点で危険でないか確認。危険箇所は具体的に修正案(代替ソース、API利用、サンプリング、メタデータのみ、キャッシュ期限など)を提示。
- **成果物**: `proposal/risk_register.md`, `proposal/compliance_notes.md`

## 起動順序

```
Phase 1: marketplace-scanner（バックグラウンド）
Phase 2: keyword-miner（バックグラウンド、Phase 1完了後）
Phase 3: social-signal-analyst（バックグラウンド、Phase 2完了後）
Phase 4: メインセッションで実行（Pass2はPhase 3の穴埋め）
Phase 5: repo-auditor（フォアグラウンド）
Phase 6: system-architect → compliance-checker（順次実行）
```

## 共通ルール

- 全エージェントの結果は**500文字以内で要約**して返す
- 詳細はファイルに書き出し、メインセッションでは要約のみ受け取る
- バックグラウンド実行完了後、成果物ファイルをRead toolで確認（offset/limitで部分読み）
