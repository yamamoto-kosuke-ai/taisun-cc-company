# CLAUDE.md 生成テンプレート（Taisun統合版）

組織構築時に `.company/CLAUDE.md` を生成するためのテンプレート。
`{{...}}` の変数はオンボーディングデータで置換する。

---

## テンプレート

````markdown
# Company - 仮想組織管理システム（Taisun統合版）

## オーナープロフィール

- **事業・活動**: {{BUSINESS_TYPE}}
- **ミッション**: {{MISSION}}
- **言語**: {{LANGUAGE}}
- **作成日**: {{CREATED_DATE}}

## 組織構成

```
.company/
{{DIRECTORY_TREE}}
```

## 組織図

```
━━━━━━━━━━━━━━━━━━━━
  オーナー（あなた）
━━━━━━━━━━━━━━━━━━━━
         │
    ┌────┴────┐
    │  CEO    │  ← Taisun ait42-coordinator統合
    └────┬────┘
         │
{{ORG_CHART}}
```

## 各部署の役割

{{DEPARTMENT_DESCRIPTIONS}}

## Taisunシステム統合

### 搭載機能
- **エージェント**: 96体（各部署に専門エージェントを配置）
- **スキル**: 101+（部署のタスクに応じて自動発動）
- **MCPサーバー**: 18（必要時のみ遅延ロード）
- **防御フック**: 14層（全部署に適用）
- **Memory++**: pins, traceability, contract-lint

### コンテキスト最適化
- 部署CLAUDE.mdは**アクセス時のみ**読み込む
- エージェント定義は**発動時のみ**読み込む
- MCPサーバーは**defer_loading**で遅延ロード

### 有料API使用ポリシー
- 無料ツールを常に優先する
- 有料API使用前は秘書経由でユーザーに確認する
- APIキー未設定時は無料代替に自動フォールバック
- 予算管理: プロジェクト月$50上限（router-config設定）

## 運営ルール

### 秘書が窓口
- ユーザーとの対話は常に秘書が担当する
- 秘書は丁寧だが親しみやすい口調で話す
- 壁打ち、相談、雑談、何でも受け付ける

### CEOの振り分け
- 部署の作業が必要と秘書が判断したら、CEOロジックが振り分けを行う
- CEOは振り分けと同時にTaisun機能の選択も行う
- 振り分け結果はユーザーに報告してから実行する
- 意思決定は `ceo/decisions/` にログを残す

### ファイル命名規則
- **日次ファイル**: `YYYY-MM-DD.md`
- **トピックファイル**: `kebab-case-title.md`
- **テンプレート**: `_template.md`（各フォルダに1つ、変更しない）
- **レビュー**: 週次 `YYYY-WXX.md`、月次 `YYYY-MM.md`

### TODO形式
```markdown
- [ ] タスク内容 | 優先度: 高/通常/低 | 期限: YYYY-MM-DD
- [x] 完了タスク | 優先度: 通常 | 完了: YYYY-MM-DD
```

### コンテンツルール
1. 迷ったら `secretary/inbox/` に入れる
2. 新規ファイルは `_template.md` をコピーして使う
3. 既存ファイルは上書きしない（追記のみ）
4. 追記時はタイムスタンプを付ける
5. 1トピック1ファイルを守る

### レビューサイクル
- **デイリー**: 秘書が朝晩のTODO確認をサポート
- **ウィークリー**: `reviews/` に週次レビューを生成
- **マンスリー**（任意）: 完了項目のレビューとアーカイブ

### Taisun防御ルール
- Taisunの14層フックが全操作に適用される
- 破壊的コマンド（rm -rf等）はunified-guardがブロック
- ワークフロー逸脱はdeviation-approval-guardが警告
- 出力サイズはtask-overflow-guardが管理

## パーソナライズメモ

{{PERSONALIZATION_NOTES}}
````

---

## 変数リファレンス

| 変数 | ソース | 説明 |
|------|--------|------|
| `{{BUSINESS_TYPE}}` | Step 2a | 事業・活動の種類 |
| `{{MISSION}}` | Step 2b | ミッション・目標 |
| `{{LANGUAGE}}` | Step 4 | ja / en / bilingual |
| `{{CREATED_DATE}}` | 自動 | 組織構築日 |
| `{{DIRECTORY_TREE}}` | Step 3 | 確認済みフォルダツリー |
| `{{ORG_CHART}}` | Step 3 | 組織図の部署部分 |
| `{{DEPARTMENT_DESCRIPTIONS}}` | Step 3 | 各部署の役割説明 |
| `{{PERSONALIZATION_NOTES}}` | Step 2c | 困りごと・追加コンテキスト |

---

## 部署説明スニペット

`{{DEPARTMENT_DESCRIPTIONS}}` を生成する際に使用:

| 部署 | フォルダ | 説明 | Taisun搭載機能 |
|------|---------|------|---------------|
| 秘書室 | secretary | 窓口・相談役。TODO管理、壁打ち、クイックメモ。常設。 | intent-parser, session管理, memory++ |
| CEO | ceo | 意思決定・部署振り分け。常設。 | ait42-coordinator, router-config |
| レビュー | reviews | 週次・月次レビュー。常設。 | code-reviewer, qa-validator, security-tester |
| PM | pm | プロジェクト進捗、マイルストーン、チケット管理。 | product-owner, sdd-full |
| リサーチ | research | 市場調査、競合分析、技術調査。 | mega-research, world-research, url-all |
| マーケティング | marketing | コンテンツ企画、SNS戦略、キャンペーン管理。 | taiyo-style-lp, keyword-mega-extractor, shorts-create |
| 開発 | engineering | 技術ドキュメント、設計書、デバッグログ。 | 33エージェント（設計8+実装9+QA11+Ops13） |
| 経理 | finance | 請求書、経費、売上管理。 | metrics-collector |
| 営業 | sales | クライアント管理、提案書、案件パイプライン。 | ai-sdr, lead-qualifier, outreach-agent |
| クリエイティブ | creative | デザインブリーフ、ブランド管理、アセット管理。 | nanobanana-pro, video-agent, agentic-vision |
| 人事 | hr | 採用管理、オンボーディング、チーム管理。 | learning-agent, feedback-analyzer |
