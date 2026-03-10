# Taisun × CC-Company 統合プラグイン

Claude Code上で動作する**仮想会社組織システム**です。
CC-Companyの「秘書に話しかけるだけ」のシンプルなUIと、Taisun Agentの96エージェント・101スキル・18 MCPサーバーを統合しています。

---

## 搭載機能一覧

| カテゴリ | 数量 | 内容 |
|---------|------|------|
| AIエージェント | 96体 | 設計・実装・QA・DevOps・リサーチ・マーケ・営業など |
| スキル | 101+ | LP自動生成、6API並列リサーチ、動画制作、キーワード抽出など |
| MCPサーバー | 18 | ブラウザ自動化、Web検索、Figma、Meta広告、LINE Bot、音声AIなど |
| 防御フック | 14層 | 破壊的操作ブロック、入力サニタイズ、ワークフロー逸脱警告など |
| 仮想会社部署 | 14 | 秘書室・CEO・PM・リサーチ・マーケ・開発・経理・営業・クリエイティブ・人事・レビューなど |

---

## 初期セットアップ手順

### 前提条件

| 必要なもの | 確認方法 | 備考 |
|-----------|---------|------|
| Claude Code CLI | `claude --version` | [公式サイト](https://claude.ai/claude-code)からインストール |
| Node.js 18以上 | `node --version` | Taisunのフック・MCP実行に必要 |
| Git | `git --version` | バージョン管理 |
| GitHubアカウント | - | taisun_agentリポジトリへのアクセス権が必要 |
| Windows開発者モード（Windowsのみ） | 設定→開発者向け→開発者モード | シンボリックリンク作成に必要 |

---

### 初回セットアップ（PCに1回だけ実行）

以下を**1行ずつ**ターミナルにコピペして実行してください。

**Windows（PowerShell）の場合:**

```powershell
cd ~
git clone https://github.com/taiyousan15/taisun_agent.git
cd taisun_agent
npm install
npm run build
cd ~
git clone https://github.com/yamamoto-kosuke-ai/taisun-cc-company.git
```

**Mac / Linux（ターミナル）の場合:**

```bash
cd ~ && git clone https://github.com/taiyousan15/taisun_agent.git && cd taisun_agent && npm install && npm run build && cd ~ && git clone https://github.com/yamamoto-kosuke-ai/taisun-cc-company.git
```

実行結果:
```
~/taisun_agent/        ← Taisun Agent本体（96エージェント・101スキル等）
~/taisun-cc-company/   ← 統合プラグイン（セットアップスクリプト含む）
```

**これでPCへの導入は完了です。この手順は二度と実行する必要はありません。**

---

### プロジェクトへの導入（新しいプロジェクトごとに実行）

新しいプロジェクトを始めるとき、以下をコピペしてください。

**Windows（PowerShell）の場合:**

```powershell
cd ~/my-project
git init
bash ~/taisun-cc-company/setup.sh
```

**Mac / Linux（ターミナル）の場合:**

```bash
cd ~/my-project && git init && bash ~/taisun-cc-company/setup.sh
```

> `~/my-project` の部分だけ、実際のプロジェクトパスに置き換えてください。
> 既にgit initされているプロジェクトの場合は `cd` と `bash ~/taisun-cc-company/setup.sh` だけでOKです。

セットアップスクリプトが自動で行うこと:

```
[1/5] 前提条件チェック
  ✅ taisun_agent の存在確認
  ✅ Git の確認

[2/5] プロジェクト初期化
  ✅ git リポジトリ確認

[3/5] Taisun Agent シンボリックリンク作成
  ✅ .claude → ~/taisun_agent/.claude
  ✅ .mcp.json → ~/taisun_agent/.mcp.json

[4/5] 統合プラグインのセットアップ
  ✅ プラグインファイル配置

[5/5] 検証
  ✅ 全リンク正常
  ✅ 全ファイル存在確認
```

---

### 仮想会社の構築（プロジェクト導入後に1回だけ）

プロジェクトへの導入が完了したら、Claude Codeを起動して仮想会社を構築します。

```bash
claude
```

Claude Code内で以下を入力:

```
/company
```

秘書が対話形式であなたの事業をヒアリングし、最適な部署構成を提案します:

```
秘書：はじめまして！あなたの秘書になります。
      まず、あなたの事業や活動について教えてください。

あなた：フリーランスのWeb開発をしています

秘書：今取り組んでいること、目指していることを教えてください。

あなた：SaaSを作って月10万の収益を目指してる

秘書：日々の業務で困っていることはありますか？

あなた：タスクが散らかる、リサーチが中途半端

秘書：あなたのお話を踏まえて、以下の部署構成をおすすめします:
      1. 秘書室 ※常設
      2. PM（プロジェクト管理）
      3. リサーチ ★Taisun: mega-research搭載
      4. 開発 ★Taisun: 33エージェント搭載
      5. マーケティング ★Taisun: LP自動生成搭載
      番号で選んでください（例: "2,3,4,5"）
```

**セットアップ完了後は `/company` の入力は不要です。**
Claude Codeを起動したら、そのまま普通に話しかけるだけで秘書が対応します。

```bash
claude
# → そのまま「今日やること教えて」と話しかければOK
```

---

### まとめ: 全手順の早見表

| # | 手順 | どこで実行？ | 実行タイミング |
|---|------|------------|--------------|
| 1 | PC初回セットアップ（上記コマンド群） | ターミナル（PowerShell / bash） | PCに1回だけ |
| 2 | プロジェクト導入（`bash ~/taisun-cc-company/setup.sh`） | ターミナル（PowerShell / bash） | プロジェクトごと |
| 3 | 仮想会社構築（`/company`） | Claude Code内 | プロジェクトごと（初回のみ） |
| 4 | 日常利用（そのまま話しかける） | Claude Code内 | 毎回 |

> **手順1・2はターミナル（PowerShellまたはbash）で実行します。**
> **手順3・4はClaude Code内で実行します。**

---

## 利用方法

### 基本: 秘書に話しかけるだけ

部署名もエージェント名もスキル名も覚える必要はありません。
すべて秘書に話しかければ、CEOが適切な部署とツールを自動選択します。

```
┌────────────────────────────────────────────────┐
│  あなた → 秘書 → CEO（自動振り分け）→ 部署     │
│                                                │
│  「調べて」→ リサーチ部署 → mega-research発動   │
│  「LP作って」→ マーケ+クリエ → taiyo-style-lp  │
│  「バグ直して」→ 開発部署 → bug-fixer発動      │
└────────────────────────────────────────────────┘
```

### シーン別の利用例

#### タスク管理
```
あなた：「今日やることを整理したい」
秘書  ：「承知しました！今日のTODOを確認しますね。
         - [ ] LP案のワイヤーフレーム | 優先度: 高
         - [ ] 競合調査のまとめ | 優先度: 通常
         他に追加したいタスクはありますか？」
```

#### リサーチ
```
あなた：「AIエージェント市場の最新動向を調べて」
秘書  ：「リサーチ部署に回しますね。調査の深さはどうしますか？
         1. ライト（無料・WebSearch）
         2. スタンダード（無料・複数ソース）
         3. ディープ（有料API使用・6ソース並列・〜$1-3）」
あなた：「2で」
  → Taisun /gem-research --mode=standard が自動発動
  → 結果は research/topics/ に自動保存
```

#### LP制作
```
あなた：「新しいSaaSのLPを作りたい」
秘書  ：「複数の部署で連携して進めましょう。
         → PM: プロジェクト作成
         → マーケ: キーワード抽出（Taisun /keyword-mega-extractor）
         → クリエイティブ: LP生成（Taisun /taiyo-style-lp）
         この進め方でよろしいですか？」
```

#### バグ修正
```
あなた：「ログイン機能でエラーが出てる」
秘書  ：「開発部署にすぐ回します。
         → Taisun ait42-bug-fixer エージェントが自動分析・修正提案」
```

#### 画像生成
```
あなた：「YouTubeのサムネイルを作って」
秘書  ：「クリエイティブ部署に依頼しますね。
         → Taisun /nanobanana-pro で生成します（無料）」
```

#### 営業
```
あなた：「見込み客にアプローチしたい」
秘書  ：「営業部署に依頼しますね。
         → Taisun lead-qualifier-agent でリード評価
         → Taisun outreach-agent でアウトリーチ文面作成」
```

#### 壁打ち・ブレスト
```
あなた：「新しいサービスのアイデアを考えたい」
秘書  ：「いいですね！壁打ちしましょう。
         まず、どんな課題を解決したいですか？」
  → 対話が進み、まとまったらリサーチ部署や開発部署への展開を提案
```

#### 週次レビュー
```
あなた：「今週の振り返りしたい」
秘書  ：「週次レビューを生成しますね。
         → 全部署の進捗を集計
         → reviews/ にレビューファイルを保存」
```

### 上級者向け: エージェント直接指名

秘書を経由せず、Taisunのエージェントを直接呼ぶこともできます:

```
@ait42-code-reviewer このPRをレビューして
@ait42-bug-fixer src/auth.ts のエラーを修正して
```

**秘書経由（自動選択）と直接指名を状況に応じて使い分けられます。**

---

## 有料APIについて

一部のリサーチ・マーケティング機能は外部APIを利用します。
以下の安全策が組み込まれているため、意図しない課金は発生しません。

| 安全策 | 内容 |
|-------|------|
| APIキー未設定 | 有料機能は自動的に無料代替にフォールバック。APIキーを設定しなければ一切課金されない |
| 事前確認 | 有料API使用時は秘書が「有料APIを使用します」と事前に告知 |
| 予算上限 | プロジェクト月$50、日$5の自動上限。超過時は無料モデルにフォールバック |
| コスト警告 | 実行前に3秒間の警告表示。Ctrl+Cでキャンセル可能 |

### 無料で使える主な機能

| 機能 | 使うツール |
|------|----------|
| Web検索 | open-websearch（DuckDuckGo/Bing/Brave） |
| ライトリサーチ | /research-free, /gem-research --mode=standard |
| AI画像生成 | /nanobanana-pro（Gemini） |
| ブラウザ自動操作 | Playwright MCP |
| URL分析 | /url-all |
| コードレビュー | ait42-code-reviewer |
| バグ修正 | ait42-bug-fixer |
| 全タスク管理 | CC-Company標準機能 |

### 有料APIが必要な機能（オプション）

| 機能 | コスト目安 | 必要なAPIキー |
|------|----------|-------------|
| /mega-research（6API並列） | $0.50-5.00/回 | TAVILY, SERPAPI, BRAVE, NEWSAPI, PERPLEXITY |
| /world-research（6層調査） | $0.50-5.00/回 | 同上 |
| gpt-researcher MCP | $0.10-1.00/回 | OPENAI, TAVILY |
| Meta広告管理 | 広告予算次第 | META_ACCESS_TOKEN |
| LINE Bot | 無料枠あり | LINE_CHANNEL_ACCESS_TOKEN |
| 音声AI通話 | $0.01-1.00/通話 | TWILIO, OPENAI_REALTIME |

---

## CC-Company単体との違い

CC-Companyだけでもタスク管理や部署運営はできますが、統合版では各部署に**実行力**が加わります。

| やりたいこと | CC-Company単体 | 統合版 |
|------------|---------------|--------|
| リサーチ | 秘書が自力でWebSearchするだけ | 6API並列のmega-research等が利用可能 |
| LP制作 | テキストベースの企画書作成のみ | /taiyo-style-lp で高成約率LP自動生成 |
| 画像生成 | 不可 | /nanobanana-pro で無料AI画像生成 |
| 動画制作 | 不可 | /video-agent, /shorts-create で動画自動制作 |
| コードレビュー | 不可 | 11体のQAエージェントが品質検証 |
| バグ修正 | デバッグログを手動で書くだけ | ait42-bug-fixer が自動分析・修正提案 |
| セキュリティ | 防御なし | 14層フックが破壊的操作をブロック |
| 営業自動化 | テンプレートでの手動管理 | AI SDRがリード評価・アウトリーチを自動化 |
| コスト管理 | なし | 月$50上限の自動予算制御 |
| 記憶の永続化 | なし | Memory++でセッション横断の記憶保持 |
| キーワード分析 | 不可 | /keyword-mega-extractor で大規模抽出 |
| 競合広告分析 | 不可 | Facebook Ad Library MCPで無料分析 |

**一言で言うと:**
CC-Company単体 = 「ファイルの整理整頓ツール」
統合版 = 「実行力を持った仮想会社」

---

## Taisun Agent単体との違い

Taisun Agentだけでも高度な開発・マーケティングができますが、統合版では**使いやすさ**と**業務管理**が加わります。

| 観点 | Taisun単体 | 統合版 |
|------|-----------|--------|
| 使い始め方 | `@agent-name` でエージェント名を直接指定 | 秘書に話しかけるだけ。名前を覚える必要なし |
| 学習コスト | 96エージェント・101スキル・190コマンドを把握する必要がある | 秘書が自動選択。学習コストゼロ |
| タスク管理 | なし | 日次TODO、Inbox、プロジェクト管理が完備 |
| 成果物の整理 | 出力先がバラバラ | 部署ごとのフォルダに構造化して自動保存 |
| 意思決定の記録 | なし | ceo/decisions/ に全判断がログとして残る |
| レビューサイクル | なし | 週次・月次の自動レビュー生成 |
| 壁打ち・相談 | 技術的な対話のみ | 秘書が何でも相談に乗る。事業相談、アイデア整理、雑談もOK |
| 非エンジニアの利用 | 困難（技術的知識が前提） | 秘書が自然言語で仲介するため誰でも利用可能 |
| 複数ツールの連携 | 手動で順番に呼ぶ必要がある | CEOが複数部署に自動振り分け＋連携管理 |
| 請求書・経費管理 | 不可 | 経理部署で構造化管理 |
| クライアント管理 | 不可 | 営業部署でCRM的に管理 |
| コンテンツカレンダー | 不可 | マーケ部署で企画・スケジュール管理 |

**一言で言うと:**
Taisun単体 = 「超高性能だが操縦が難しいレースカー」
統合版 = 「運転手（秘書）付きのレースカー」

---

## 統合版でしかできないこと

両方を個別に使っても実現しない、統合独自の価値があります。

| 価値 | 説明 |
|------|------|
| 自然言語→最適ツール自動選択 | 「調べて」→CEOが調査深度を判断→最適なリサーチスキルを自動選択。ユーザーはmega-researchとresearch-freeの違いを知らなくていい |
| コスト意識のルーティング | CEOが無料ツールを優先し、有料ツールは事前確認する。この判断基準はTaisun単体にはない |
| 成果物の組織的蓄積 | Taisunの出力が research/topics/ や marketing/campaigns/ に自動整理される。Taisun単体では出力先が不定 |
| 部署間連携の自動管理 | LP制作でPM+マーケ+クリエイティブが連携した記録がceo/decisions/に残り、次回の参考になる |
| 2つの入口の使い分け | 秘書経由（自動選択）と @agent-name（直接指名）を状況に応じて切り替えられる |

---

## 各部署に搭載されているTaisun機能

### 秘書室（常設）
- Taisun intent-parser（ユーザー意図の自動分類）
- Taisun session管理フック（セッション継続・引き継ぎ）
- Taisun Memory++（会話履歴の永続化）

### CEO（常設）
- Taisun ait42-coordinator（振り分け精度向上）
- Taisun router-config（タスク複雑度に応じてLLMモデル自動切替）
- 有料API使用の事前判断

### PM
- product-owner エージェント
- /sdd-full スキル（要件定義→設計→タスク分解）
- ait42-requirements-elicitation エージェント

### リサーチ
- /mega-research（6API並列調査）★有料オプション
- /world-research（6層クロスドメイン調査）★有料オプション
- /gem-research（マーケティングリサーチ、standard以下は無料）
- /research-free（WebSearchのみ、無料）
- /url-all（URL完全分析、無料）
- gpt-researcher MCP ★有料オプション
- open-websearch MCP（無料）

### マーケティング
- /taiyo-style-lp（高成約率LP自動生成）
- /keyword-mega-extractor（大規模キーワード抽出）
- /shorts-create（YouTube Shorts/Reels制作）
- meta-ads MCP（Meta広告管理）
- facebook-ads-library MCP（競合広告分析、無料）
- twitter-client MCP（X/Twitter）

### 開発（33エージェント搭載）
- 設計8体: system-architect, api-designer, database-designer, ui-ux-designer, security-architect, cloud-architect 等
- 実装9体: backend-developer, frontend-developer, api-developer, feature-builder 等
- QA11体: code-reviewer, test-generator, bug-fixer, security-tester, performance-tester 等
- Ops13体: devops-engineer, cicd-manager, container-specialist, release-manager 等
- Playwright MCP（ブラウザ自動化・E2Eテスト）

### 経理
- metrics-collector エージェント（コスト追跡）
- router-configの予算管理と連動

### 営業
- lead-qualifier-agent（リード評価・スコアリング）
- outreach-agent（アウトリーチ文面最適化）
- sdr-coordinator-agent（営業パイプライン管理）
- ai-sdr MCP（自律営業パイプライン）
- line-bot MCP（LINEコミュニケーション）

### クリエイティブ
- /nanobanana-pro（AI画像生成、Gemini、無料）
- /video-agent（動画制作）
- /shorts-create（ショート動画制作）
- /agentic-vision（画像/動画分析）
- figma MCP（Figmaデザイン取得）

### 人事
- learning-agent（学習・スキル評価）
- feedback-analyzer（フィードバック分析）

### レビュー（常設）
- ait42-code-reviewer（コードレビュー）
- ait42-qa-validator（品質検証）
- ait42-security-tester（セキュリティテスト）

---

## こんな人におすすめ

| 利用者タイプ | メリット |
|-------------|---------|
| 個人開発者 | コードを書く以外の業務（タスク管理、リサーチ、LP制作、経理）もすべて秘書に任せられる |
| フリーランス | 営業、提案書作成、請求書管理、コンテンツ制作まで一人で回せる仮想チーム |
| スタートアップ | PMから開発、マーケ、営業まで全部署が96エージェントで武装。少人数でも大企業並みのオペレーション |
| コンテンツクリエイター | キーワード分析→コンテンツ企画→画像/動画生成→公開管理が一気通貫 |
| 非エンジニア | 秘書との対話だけで高度なAIツールを利用可能。技術知識は不要 |

---

## トラブルシューティング

### セットアップスクリプトが「taisun_agentが見つかりません」と表示される

```bash
# taisun_agentの場所がデフォルト(~/taisun_agent)と異なる場合:
TAISUN_HOME=/path/to/taisun_agent bash ~/taisun-cc-company/setup.sh
```

### Windowsでシンボリックリンクが作成できない

1. 設定 → 開発者向け → 開発者モード を ON にする
2. ターミナルを再起動してからsetup.shを再実行

### `/company` で秘書が起動しない

```bash
# プラグインが正しく配置されているか確認:
ls plugins/company/skills/company/SKILL.md

# シンボリックリンクが正常か確認:
ls -la .claude
ls -la .mcp.json
```

### 2回目以降のセッションで秘書が自動起動しない

`.company/` が正常に構築されているか確認:
```bash
ls .company/CLAUDE.md
ls .company/secretary/CLAUDE.md
```

プロジェクトルートの `CLAUDE.md` に自動起動ルールが追記されているか確認:
```bash
grep "仮想カンパニー自動起動" CLAUDE.md
```

---

## ライセンス

MIT License
