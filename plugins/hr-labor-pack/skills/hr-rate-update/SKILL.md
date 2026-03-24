# /hr-rate-update - 料率マスタ更新スキル

人事労務拡張パック: 料率マスタの初期設定・手動更新を行うスキル。

## 概要

rate-master.jsonの新規作成または既存更新を行う。
/hr-law-checkがリサーチ結果から更新案を生成するのに対し、
このスキルは直接的なマスタ操作を行う。

## 使い方

```bash
# 初期セットアップ（rate-master.json新規作成）
/hr-rate-update init

# 全料率を最新情報で更新
/hr-rate-update

# 特定項目のみ更新
/hr-rate-update 健康保険料率=9.9
/hr-rate-update 雇用保険被保険者率=0.55
```

## 実行フロー

### initモード（初回セットアップ）

1. プロジェクト内にrate-master.jsonが存在するか確認
2. 存在しない場合、plugins/hr-labor-pack/data/rate-master.jsonをテンプレートとしてコピー
3. コピー先: `.claude/hooks/data/hr-labor/rate-master.json`
4. WebSearchで最新料率を確認し、テンプレートの値が最新かチェック
5. 差分があればユーザー確認後に更新

### 更新モード（通常利用）

1. 現在のrate-master.jsonを読み込む
2. WebSearchで対象項目の最新情報を取得
3. 変更があればdiffを表示
4. ユーザー承認後にEditで更新
5. lastUpdated、nextReviewDateを更新

### 手動指定モード

```bash
/hr-rate-update 健康保険料率=10.0
```

1. 指定された値でrate-master.jsonを更新
2. 更新前に確認: 「健康保険料率を9.9%→10.0%に変更します。よろしいですか？」
3. 承認後に更新 + 出典の入力を求める

## rate-master.jsonの配置先

```
プロジェクトルート/
└── .claude/
    └── hooks/
        └── data/
            └── hr-labor/
                └── rate-master.json  ← ここに配置
```

hookスクリプト（hr-law-watcher.js, hr-payroll-validator.js）は
この場所を第一候補として参照する。

## 更新時の必須ルール

1. **値の変更は必ずユーザー承認を得る** - 自動更新しない
2. **出典URLを必ず記録する** - sourcesフィールドに追加
3. **effectiveDateを正確に記録する** - いつから適用される料率か
4. **lastUpdated/nextReviewDateを更新する** - 鮮度管理

## nextReviewDateの自動設定ロジック

更新時に次回レビュー日を自動設定:

| 現在月 | nextReviewDate | 理由 |
|--------|---------------|------|
| 1-2月 | 3月1日 | 健保料率改定 |
| 3月 | 4月1日 | 雇用保険料率改定 |
| 4-6月 | 7月1日 | 算定基礎届 |
| 7-9月 | 10月1日 | 最低賃金改定 |
| 10月 | 11月1日 | 年末調整準備 |
| 11-12月 | 翌年1月1日 | 源泉徴収税額表改定 |

## 関連スキル

- `/hr-law-check` - 法改正の徹底リサーチ（変更検出）
- `/hr-rate-update` - 料率マスタの直接更新（このスキル）
