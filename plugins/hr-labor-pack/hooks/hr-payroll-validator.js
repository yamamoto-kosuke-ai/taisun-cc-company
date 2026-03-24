#!/usr/bin/env node
/**
 * HR Payroll Validator - 給与計算バリデータ
 *
 * 人事労務拡張パック: 3段構えの法改正追従システム（第2段）
 *
 * 動作:
 * 1. Edit/Write後に対象ファイルが給与計算関連かチェック
 * 2. 給与計算関連なら料率マスタとの整合性を検証
 * 3. ハードコードされた料率・金額を検出して警告
 * 4. マイナンバー関連のセキュリティチェック
 *
 * Hook登録: PostToolUse (Edit|Write)
 *
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.cwd();

const CONFIG = {
  logFile: path.join(PROJECT_DIR, '.claude/hooks/data/hr-labor/payroll-validator.log'),
  rateMasterPaths: [
    path.join(PROJECT_DIR, '.claude/hooks/data/hr-labor/rate-master.json'),
    path.join(PROJECT_DIR, 'plugins/hr-labor-pack/data/rate-master.json')
  ]
};

// 給与計算関連ファイルの判定パターン
const HR_FILE_PATTERNS = [
  /payroll/i, /salary/i, /wage/i, /kyuyo/i, /給与/,
  /insurance/i, /hoken/i, /保険/,
  /tax/i, /zei/i, /税/, /源泉/,
  /pension/i, /nenkin/i, /年金/,
  /deduction/i, /koujyo/i, /控除/,
  /attendance/i, /kintai/i, /勤怠/,
  /mynumber/i, /マイナンバー/,
  /year.?end/i, /nenmatsu/i, /年末調整/,
  /hr[_-]?/i, /human.?resource/i, /人事/, /労務/
];

// ハードコードされた危険な数値パターン
const HARDCODED_RATES = [
  { pattern: /(?:0\.)?(?:18\.3|9\.15)\s*[%％]?/g, label: '厚生年金率(18.3%/折半9.15%)', field: 'socialInsurance.welfarePension.rate' },
  { pattern: /(?:0\.)?(?:9\.9[0-9]?|4\.9[0-9]?)\s*[%％]?/g, label: '健康保険率候補', field: 'socialInsurance.healthInsurance.rate' },
  { pattern: /(?:0\.)?1\.62\s*[%％]?/g, label: '介護保険率(1.62%)', field: 'socialInsurance.nursingCareInsurance.rate' },
  { pattern: /(?:0\.)?0\.55\s*[%％]?/g, label: '雇用保険被保険者率(0.55%)', field: 'employmentInsurance.general.employeeRate' },
  { pattern: /(?:0\.)?0\.23\s*[%％]?/g, label: '子育て支援金率(0.23%)', field: 'socialInsurance.childCareSupport.rate' },
  { pattern: /48\s*万|480000/g, label: '旧基礎控除額(48万→58万に変更済み)', severity: 'error' },
  { pattern: /55\s*万|550000/g, label: '旧給与所得控除最低額(55万→65万に変更済み)', severity: 'error' },
];

// マイナンバー関連の危険パターン
const MYNUMBER_DANGERS = [
  { pattern: /console\.(log|debug|info)\s*\(.*(?:mynumber|マイナンバー|my_number|個人番号)/gi, label: 'マイナンバーのコンソール出力', severity: 'error' },
  { pattern: /(?:localStorage|sessionStorage).*(?:mynumber|マイナンバー|my_number)/gi, label: 'マイナンバーのブラウザストレージ保存', severity: 'error' },
  { pattern: /(?:cookie|Cookie).*(?:mynumber|マイナンバー|my_number)/gi, label: 'マイナンバーのCookie保存', severity: 'error' },
  { pattern: /(?:log|logger|logging).*(?:mynumber|マイナンバー|my_number|個人番号)/gi, label: 'マイナンバーのログ出力', severity: 'error' },
];

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function log(msg) {
  try {
    ensureDir(CONFIG.logFile);
    fs.appendFileSync(CONFIG.logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) { /* ignore */ }
}

function isHRFile(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  return HR_FILE_PATTERNS.some(p => p.test(normalized));
}

function loadRateMaster() {
  for (const p of CONFIG.rateMasterPaths) {
    if (fs.existsSync(p)) {
      try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { /* ignore */ }
    }
  }
  return null;
}

function checkFile(filePath) {
  const issues = [];

  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch (e) { return issues; }

  const lines = content.split('\n');
  const relativePath = path.relative(PROJECT_DIR, filePath);

  // ハードコードされた料率の検出
  for (const { pattern, label, severity } of HARDCODED_RATES) {
    pattern.lastIndex = 0;
    lines.forEach((line, idx) => {
      pattern.lastIndex = 0;
      // コメント行は除外
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) return;

      if (pattern.test(line)) {
        issues.push({
          file: relativePath,
          line: idx + 1,
          label: `ハードコード検出: ${label}`,
          severity: severity || 'warn',
          suggestion: '料率マスタ(rate-master.json)から動的に取得してください'
        });
      }
    });
  }

  // マイナンバー関連のセキュリティチェック
  for (const { pattern, label, severity } of MYNUMBER_DANGERS) {
    pattern.lastIndex = 0;
    lines.forEach((line, idx) => {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        issues.push({
          file: relativePath,
          line: idx + 1,
          label: `セキュリティ違反: ${label}`,
          severity,
          suggestion: 'マイナンバーは暗号化保存し、ログ・コンソール・ブラウザストレージへの出力は禁止です'
        });
      }
    });
  }

  return issues;
}

function readStdin(timeout = 500) {
  return new Promise((resolve) => {
    let data = '';
    let resolved = false;
    const finish = () => { if (!resolved) { resolved = true; resolve(data); } };
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
    const stdinData = await readStdin();
    if (!stdinData) { process.exit(0); return; }

    let input;
    try { input = JSON.parse(stdinData); } catch (e) { process.exit(0); return; }

    const toolInput = input.tool_input || input.input || {};
    const filePath = toolInput.file_path || toolInput.filePath || '';

    if (!filePath || !isHRFile(filePath)) {
      process.exit(0);
      return;
    }

    // 給与計算関連ファイルを検出
    const issues = checkFile(filePath);
    const relativePath = path.relative(PROJECT_DIR, filePath);

    if (issues.length === 0) {
      // 問題なし。料率マスタの存在確認だけ行う
      const master = loadRateMaster();
      if (!master) {
        console.log(`[HR Validator] ${relativePath}: 人事労務ファイルを検出。料率マスタが未配置です。/hr-rate-update で初期設定してください。`);
      }
      process.exit(0);
      return;
    }

    const errors = issues.filter(i => i.severity === 'error');
    const warns = issues.filter(i => i.severity === 'warn');

    // stderr: ユーザー向け
    console.error('');
    console.error('\x1b[31m┌────────────────────────────────────────────────┐\x1b[0m');
    console.error('\x1b[31m│  HR Payroll Validator: 給与計算チェック         │\x1b[0m');
    console.error('\x1b[31m├────────────────────────────────────────────────┤\x1b[0m');
    console.error(`\x1b[31m│  対象: ${relativePath.substring(0, 40).padEnd(40)}│\x1b[0m`);

    if (errors.length > 0) {
      console.error(`\x1b[31m│  ❌ 重大: ${String(errors.length).padEnd(36)}│\x1b[0m`);
    }
    if (warns.length > 0) {
      console.error(`\x1b[33m│  ⚠  警告: ${String(warns.length).padEnd(36)}│\x1b[0m`);
    }

    issues.slice(0, 5).forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' : '⚠ ';
      console.error(`\x1b[31m│  ${icon} L${issue.line}: ${issue.label.substring(0, 40)}│\x1b[0m`);
    });

    console.error('\x1b[31m└────────────────────────────────────────────────┘\x1b[0m');
    console.error('');

    // stdout: AI向け注入
    const critical = [...errors, ...warns].slice(0, 3);
    const summary = critical.map(i => `L${i.line}:${i.label}`).join(', ');
    console.log(`[HR Validator] ${relativePath}: ${issues.length}件検出。${summary}。${errors.length > 0 ? '修正必須。' : ''}料率はrate-master.jsonから動的取得してください。`);

    log(`Checked ${relativePath}: ${errors.length} errors, ${warns.length} warns`);

  } catch (e) {
    log(`Error: ${e.message}`);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { isHRFile, checkFile, HR_FILE_PATTERNS, CONFIG };
