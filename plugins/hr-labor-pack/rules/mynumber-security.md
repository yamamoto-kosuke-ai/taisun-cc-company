# マイナンバー安全管理ルール

## 概要
マイナンバー（個人番号）を取り扱うコードの開発時に遵守すべきセキュリティルール。
番号法（行政手続における特定の個人を識別するための番号の利用等に関する法律）に基づく。

**違反時のリスク**: 行政指導、最大4年以下の懲役または200万円以下の罰金

---

## 絶対禁止事項（MUST NOT）

### 1. マイナンバーの平文保存禁止
```
❌ db.save({ mynumber: "123456789012" })
✅ db.save({ mynumber_encrypted: encrypt(mynumber, key) })
```

### 2. ログ・コンソールへの出力禁止
```
❌ console.log(`マイナンバー: ${mynumber}`)
❌ logger.info({ mynumber })
❌ console.debug(employeeData)  // マイナンバーを含むオブジェクト全体
✅ logger.info({ employeeId: emp.id, action: 'mynumber_updated' })
```

### 3. ブラウザストレージへの保存禁止
```
❌ localStorage.setItem('mynumber', value)
❌ sessionStorage.setItem('mynumber', value)
❌ document.cookie = `mynumber=${value}`
✅ サーバーサイドのみで処理し、ブラウザに送信しない
```

### 4. URLパラメータ・パスへの含有禁止
```
❌ /api/employees/123456789012
❌ /api/mynumber?number=123456789012
✅ /api/employees/{employeeId}/mynumber（認証+暗号化通信必須）
```

### 5. メール・チャットでの送信禁止
```
❌ sendEmail({ body: `マイナンバー: ${mynumber}` })
✅ セキュアなシステム内でのみ閲覧可能にする
```

---

## 必須実装事項（MUST）

### 1. 暗号化
- 保存時は必ずAES-256-GCM以上の暗号化を適用
- 暗号鍵はマイナンバーデータとは別の安全な場所に保管
- 暗号鍵のローテーション機能を実装

### 2. アクセス制御
- マイナンバーへのアクセスは「利用目的に必要な最小限の者」に限定
- RBAC（Role-Based Access Control）で管理
- アクセスログを必ず記録（誰が・いつ・何の目的で閲覧したか）

### 3. 表示制御
- 画面表示時はマスキング: `****-****-7890`（下4桁のみ表示）
- 全桁表示は「確認」ボタン+再認証後のみ
- 表示後は一定時間で自動マスキングに戻す

### 4. 廃棄
- 利用目的を達成し不要になった場合は速やかに廃棄
- 退職者のマイナンバーは法定保存期間（7年）経過後に確実に削除
- 削除時はデータベースからの物理削除 + バックアップからの削除

### 5. 通信
- マイナンバーの送受信は必ずTLS 1.2以上で暗号化
- API経由の場合は追加でペイロード暗号化を推奨

---

## データベース設計ルール

### テーブル分離
```sql
-- ✅ マイナンバーは従業員テーブルとは別テーブルに分離
CREATE TABLE employee_mynumber (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id),
  mynumber_encrypted BYTEA NOT NULL,  -- 暗号化済みデータ
  encryption_key_id VARCHAR(50) NOT NULL,  -- 暗号鍵の識別子
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  accessed_at TIMESTAMP,  -- 最終アクセス日時
  accessed_by VARCHAR(100),  -- 最終アクセス者
  UNIQUE(employee_id)
);

-- アクセスログ
CREATE TABLE mynumber_access_log (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL,
  accessed_by VARCHAR(100) NOT NULL,
  access_purpose VARCHAR(200) NOT NULL,  -- 利用目的
  access_type VARCHAR(20) NOT NULL,  -- view/export/submit
  accessed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### バックアップ
- マイナンバーを含むバックアップも暗号化必須
- バックアップの保存場所・アクセス権も本体と同等の管理

---

## テストコードのルール

### テスト用マイナンバー
```
✅ テストでは固定のダミー番号を使用: "000000000000"
✅ テスト環境には本番マイナンバーを絶対に入れない
❌ 本番データをテスト環境にコピーしない
```

### テストで確認すべき項目
- [ ] 暗号化して保存されているか
- [ ] 平文でログに出力されていないか
- [ ] APIレスポンスに平文で含まれていないか
- [ ] マスキング表示が正しく動作するか
- [ ] アクセスログが記録されているか
- [ ] 権限のないユーザーがアクセスできないか
- [ ] 廃棄処理が正しく動作するか

---

## コードレビューチェックポイント

レビュー時にこのファイルの内容に違反するコードがあれば、**即座にブロック**して修正を求める。
特に以下は重点チェック:

1. `mynumber` `マイナンバー` `my_number` `個人番号` を含む変数名の周辺コード
2. ログ出力・コンソール出力の引数
3. APIレスポンスのフィールド
4. フロントエンドでのデータ保持方法
5. テストデータに本番データが混入していないか
