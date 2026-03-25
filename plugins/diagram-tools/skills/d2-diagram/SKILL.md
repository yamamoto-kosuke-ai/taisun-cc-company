---
name: d2-diagram
description: |
  D2言語で高品質なフローチャート・アーキテクチャ図・システム構成図を生成しSVG/PNG/PDF出力する。
  Use when user says "きれいな図", "高品質フローチャート", "アーキテクチャ図",
  "システム構成図", "d2", "美しい図", "プロフェッショナルな図", "提案資料用の図",
  "大規模な図", "ネスト構造の図", "手書き風の図".
  Mermaidより見た目が洗練されており、提案資料やプレゼン用の図に最適。
  GitHub READMEへの直接埋め込みが必要な場合は mermaid-diagram を使用。
  Do NOT use for: 画像生成（nanobanana-pro）、ガントチャート・円グラフ（mermaid-diagram）。
argument-hint: "[図の内容の説明]"
allowed-tools: Read, Write, Edit, Bash, Glob
---

# D2 Diagram Generator

D2言語で高品質なダイアグラムを生成し、SVG/PNG/PDFに出力する。

## 前提条件

d2 CLIが必要。未インストールの場合は自動インストールを提案する。

```bash
# インストール確認
d2 --version

# Windows (winget)
winget install terrastruct.d2

# macOS (Homebrew)
brew install d2

# Linux (curl)
curl -fsSL https://d2lang.com/install.sh | sh -s --
```

## 実行フロー

### Step 1: ユーザー要件の理解

`$ARGUMENTS` から以下を判定:
- 図の内容（何を描くか）
- 方向（上→下 or 左→右）
- スタイル（ビジネス向け/手書き風/ダーク）
- 規模（ノード数の見積もり）

### Step 2: D2コード生成

`.d2` ファイルとして書き出す:

```d2
# 方向指定
direction: down  # down, right, left, up

# ノード定義（形状・スタイル指定可）
server: APIサーバー {
  shape: rectangle
  style.fill: "#e3f2fd"
  style.stroke: "#1565c0"
  style.border-radius: 8
  style.font-size: 16
}

# コンテナ（ネスト）
infrastructure: インフラ {
  db: PostgreSQL {shape: cylinder}
  cache: Redis {shape: hexagon}
}

# 接続
server -> infrastructure.db: SQL
server -> infrastructure.cache: キャッシュ
```

### Step 3: テーマとレイアウトの選択

#### テーマ（--theme）

| ID | テーマ名 | 用途 |
|----|---------|------|
| 0 | Default | 標準 |
| 1 | Neutral Grey | ビジネス資料 |
| 3 | Flagship Terrastruct | 公式テーマ（美しい） |
| 4 | Origami | 柔らかい印象 |
| 5 | Colorblind Clear | アクセシビリティ |
| 100 | Terminal | ターミナル風 |
| 200 | Dark Mauve | ダークモード |

#### レイアウトエンジン（--layout）

| エンジン | 特徴 | 用途 |
|---------|------|------|
| `dagre` | デフォルト。階層的レイアウト | 一般的なフローチャート |
| `elk` | ポート付きノードに最適 | ネットワーク図、データフロー |
| `tala` | ソフトウェアアーキテクチャ特化 | システム構成図（有料） |

### Step 4: SVG/PNG/PDF出力

```bash
# SVG出力（推奨・最高品質）
d2 --theme 3 output/diagrams/{name}.d2 output/diagrams/{name}.svg

# PNG出力
d2 --theme 3 output/diagrams/{name}.d2 output/diagrams/{name}.png

# PDF出力（提案資料に添付用）
d2 --theme 3 output/diagrams/{name}.d2 output/diagrams/{name}.pdf

# 手書き風（sketchモード）
d2 --sketch --theme 0 output/diagrams/{name}.d2 output/diagrams/{name}.svg

# ダークモード
d2 --theme 200 output/diagrams/{name}.d2 output/diagrams/{name}.svg
```

### Step 5: 結果報告

- 生成したファイルパスを報告
- テーマやスタイルの変更提案

## 出力ディレクトリ

```
output/diagrams/
├── {name}.d2      # D2ソース
├── {name}.svg     # SVG出力
├── {name}.png     # PNG出力（オプション）
└── {name}.pdf     # PDF出力（オプション）
```

## D2の強み（Mermaidとの使い分け）

| こんなとき | D2を使う |
|-----------|---------|
| 提案資料・プレゼンに入れる図 | ✅ テーマで美しく仕上がる |
| ネストした構造（マイクロサービス等） | ✅ コンテナの入れ子が得意 |
| 50ノード以上の大規模図 | ✅ レイアウトが崩れない |
| 手書き風の図（ホワイトボード風） | ✅ --sketch モード |
| PDF出力が必要 | ✅ 直接PDF出力可能 |

## D2構文リファレンス

### ノード形状

| 構文 | 形状 |
|------|------|
| `shape: rectangle` | 四角形（デフォルト） |
| `shape: diamond` | ひし形（判定） |
| `shape: oval` | 楕円 |
| `shape: cylinder` | 円柱（DB） |
| `shape: hexagon` | 六角形 |
| `shape: cloud` | クラウド |
| `shape: queue` | キュー |
| `shape: package` | パッケージ |
| `shape: circle` | 円 |

### 接続スタイル

```d2
a -> b: 通常矢印
a <-> b: 双方向
a -- b: 線のみ（矢印なし）
a -> b: ラベル {style.stroke-dash: 5}  # 点線
```

### スタイル指定

```d2
node: ラベル {
  style.fill: "#color"
  style.stroke: "#color"
  style.font-size: 16
  style.bold: true
  style.border-radius: 8
  style.opacity: 0.8
  style.shadow: true
}
```
