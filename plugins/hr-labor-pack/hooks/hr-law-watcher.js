#!/usr/bin/env node
/**
 * HR Law Watcher - 法改正ウォッチャー
 *
 * 人事労務拡張パック: 3段構えの法改正追従システム（第1段）
 *
 * 【3段構え体制】
 * 第1段: このhook（SessionStart）- セッション開始時に料率マスタの鮮度チェック
 * 第2段: hr-payroll-validator.js（PostToolUse）- コード変更時に料率整合性チェック
 * 第3段: /hr-law-check スキル（手動）- 徹底リサーチで最新法改正を確認
 *
 * 動作:
 * 1. rate-master.json の lastUpdated と nextReviewDate を確認
 * 2. 期限切れ or 期限間近なら警告をAIコンテキストに注入
 * 3. 重要な改定月（1月:税制、3月:健保、4月:雇用保険）に強化警告
 *
 * Hook登録: SessionStart
 *
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.cwd();

// rate-master.json の探索パス（プロジェクト内 or taisun_agent内）
const RATE_MASTER_PATHS = [
  path.join(PROJECT_DIR, '.claude/hooks/data/hr-labor/rate-master.json'),
  path.join(PROJECT_DIR, 'plugins/hr-labor-pack/data/rate-master.json')
];

// 重要改定月とその内容
const CRITICAL_MONTHS = {
  1: '所得税・源泉徴収税額表の改定（1月適用）',
  3: '健康保険・介護保険料率の改定（3月分〜）',
  4: '雇用保険料率・子育て支援金の改定（4月分〜）',
  7: '算定基礎届の提出期限（7/10）',
  10: '最低賃金の改定（10月〜）',
  11: '年末調整の準備開始',
  12: '年末調整の計算・提出'
};

function findRateMaster() {
  for (const p of RATE_MASTER_PATHS) {
    if (fs.existsSync(p)) {
      try {
        return { path: p, data: JSON.parse(fs.readFileSync(p, 'utf8')) };
      } catch (e) { /* ignore */ }
    }
  }
  return null;
}

function checkFreshness(meta) {
  const now = new Date();
  const lastUpdated = new Date(meta.lastUpdated);
  const nextReview = new Date(meta.nextReviewDate);
  const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
  const daysUntilReview = Math.floor((nextReview - now) / (1000 * 60 * 60 * 24));

  return { daysSinceUpdate, daysUntilReview, lastUpdated, nextReview };
}

function getCriticalAlert() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed
  const day = now.getDate();

  const alerts = [];

  // 当月の重要事項
  if (CRITICAL_MONTHS[month]) {
    alerts.push(`今月の重要事項: ${CRITICAL_MONTHS[month]}`);
  }

  // 来月の重要事項（月末15日以降に予告）
  const nextMonth = month === 12 ? 1 : month + 1;
  if (day >= 15 && CRITICAL_MONTHS[nextMonth]) {
    alerts.push(`来月の予告: ${CRITICAL_MONTHS[nextMonth]}`);
  }

  return alerts;
}

function readStdin(timeout = 500) {
  return new Promise((resolve) => {
    let data = '';
    let resolved = false;
    const finish = () => {
      if (!resolved) { resolved = true; resolve(data); }
    };
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', finish);
    process.stdin.on('error', finish);
    setTimeout(finish, timeout);
    if (process.stdin.isTTY) finish();
  });
}

async function main() {
  try {
    await readStdin(); // hookプロトコル準拠

    const master = findRateMaster();
    const parts = [];

    if (!master) {
      // rate-master.json が未配置（初回 or 未セットアップ）
      parts.push('[HR Law Watcher] 料率マスタ未検出。人事労務関連の開発時は /hr-rate-update で最新料率を取得してください。');
    } else {
      const { daysSinceUpdate, daysUntilReview } = checkFreshness(master.data._meta);

      // 鮮度チェック
      if (daysUntilReview < 0) {
        // レビュー期限超過
        parts.push(`[HR Law Watcher] ⚠ 料率マスタのレビュー期限を${Math.abs(daysUntilReview)}日超過しています。/hr-law-check で最新情報を確認してください。`);
        console.error('\x1b[31m[HR Law Watcher] 料率マスタのレビュー期限超過！ /hr-law-check を実行してください\x1b[0m');
      } else if (daysUntilReview <= 7) {
        parts.push(`[HR Law Watcher] 料率マスタのレビュー期限まで${daysUntilReview}日。近日中に /hr-law-check での確認を推奨します。`);
      } else if (daysSinceUpdate > 30) {
        parts.push(`[HR Law Watcher] 料率マスタの最終更新から${daysSinceUpdate}日経過。定期確認を推奨します。`);
      }
    }

    // 重要改定月アラート
    const criticalAlerts = getCriticalAlert();
    if (criticalAlerts.length > 0) {
      parts.push(`[HR Law Watcher] ${criticalAlerts.join(' / ')}`);
    }

    // stdout: AIコンテキスト注入
    if (parts.length > 0) {
      console.log(parts.join('\n'));
    }

  } catch (e) {
    // エラーでもブロックしない
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { findRateMaster, checkFreshness, CRITICAL_MONTHS };
