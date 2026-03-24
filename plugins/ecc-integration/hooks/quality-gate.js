#!/usr/bin/env node
/**
 * Quality Gate - コード変更後の自動品質チェック
 *
 * ECC (everything-claude-code) のQuality Gate Hooksを
 * Taisun CC Companyに組み込んだもの。
 *
 * 機能:
 * - Edit/Write後に対象ファイルの品質チェックを非同期実行
 * - console.log / console.error の検出（JS/TS）
 * - デバッグコード残留の検出（TODO, FIXME, HACK, debugger）
 * - 大きすぎる関数の警告（100行超）
 * - 結果はstderr（ユーザー通知）+ stdout（AI注入）で出力
 *
 * Hook登録: PostToolUse (Edit|Write) - 非同期
 *
 * @version 1.0.0
 * @origin everything-claude-code (Quality Gate Hooks)
 */

const fs = require('fs');
const path = require('path');
const { readStdin } = require('./utils/read-stdin');

const PROJECT_DIR = process.cwd();

const CONFIG = {
  logFile: path.join(PROJECT_DIR, '.claude/hooks/data/quality-gate.log'),
  // チェック対象の拡張子
  codeExtensions: ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'],
  // 検出するデバッグパターン
  debugPatterns: [
    { pattern: /\bconsole\.(log|debug|info)\b/g, label: 'console.log', severity: 'warn' },
    { pattern: /\bdebugger\b/g, label: 'debugger文', severity: 'error' },
  ],
  // 検出するTODO/FIXMEパターン（新規追加分のみ）
  todoPatterns: [
    { pattern: /\/\/\s*(TODO|FIXME|HACK|XXX)\b/gi, label: 'TODO/FIXME', severity: 'info' },
  ],
  // 関数の行数上限
  maxFunctionLines: 100,
  // チェックをスキップするパス
  ignorePaths: ['node_modules', '.claude/hooks', 'dist', 'build', '.git']
};

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

function shouldCheck(filePath) {
  if (!filePath) return false;

  // 無視パスチェック
  const normalized = filePath.replace(/\\/g, '/');
  for (const ignore of CONFIG.ignorePaths) {
    if (normalized.includes(ignore)) return false;
  }

  // 拡張子チェック
  const ext = path.extname(filePath).toLowerCase();
  return CONFIG.codeExtensions.includes(ext);
}

/**
 * ファイルの品質チェックを実行
 */
function checkFile(filePath) {
  const issues = [];

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return issues;
  }

  const lines = content.split('\n');
  const relativePath = path.relative(PROJECT_DIR, filePath);

  // デバッグパターン検出
  for (const { pattern, label, severity } of CONFIG.debugPatterns) {
    // パターンのlastIndexをリセット
    pattern.lastIndex = 0;
    lines.forEach((line, idx) => {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        // コメントアウトされている行は除外
        const trimmed = line.trim();
        if (trimmed.startsWith('//') && !trimmed.includes('debugger')) return;

        issues.push({
          file: relativePath,
          line: idx + 1,
          label,
          severity,
          content: line.trim().substring(0, 80)
        });
      }
    });
  }

  // TODO/FIXME検出
  for (const { pattern, label, severity } of CONFIG.todoPatterns) {
    pattern.lastIndex = 0;
    lines.forEach((line, idx) => {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        issues.push({
          file: relativePath,
          line: idx + 1,
          label,
          severity,
          content: line.trim().substring(0, 80)
        });
      }
    });
  }

  // 大きな関数の検出（簡易版: { } のネスト追跡）
  let braceDepth = 0;
  let functionStart = -1;
  const functionPattern = /^\s*(async\s+)?function\s|^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s+)?\(|^\s*(async\s+)?\w+\s*\([^)]*\)\s*\{/;

  lines.forEach((line, idx) => {
    if (functionPattern.test(line) && braceDepth === 0) {
      functionStart = idx;
    }

    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;
    braceDepth += opens - closes;

    if (braceDepth === 0 && functionStart >= 0) {
      const funcLength = idx - functionStart + 1;
      if (funcLength > CONFIG.maxFunctionLines) {
        issues.push({
          file: relativePath,
          line: functionStart + 1,
          label: `長い関数 (${funcLength}行)`,
          severity: 'warn',
          content: lines[functionStart].trim().substring(0, 80)
        });
      }
      functionStart = -1;
    }
  });

  return issues;
}

/**
 * 結果を出力
 */
function outputResults(issues, filePath) {
  if (issues.length === 0) return;

  const relativePath = path.relative(PROJECT_DIR, filePath);
  const errors = issues.filter(i => i.severity === 'error');
  const warns = issues.filter(i => i.severity === 'warn');
  const infos = issues.filter(i => i.severity === 'info');

  // stderr: ユーザー向けの視覚的な通知
  console.error('');
  console.error('\x1b[35m┌────────────────────────────────────────────────┐\x1b[0m');
  console.error('\x1b[35m│  Quality Gate: 品質チェック結果                │\x1b[0m');
  console.error('\x1b[35m├────────────────────────────────────────────────┤\x1b[0m');
  console.error(`\x1b[35m│  対象: ${relativePath.substring(0, 40).padEnd(40)}│\x1b[0m`);

  if (errors.length > 0) {
    console.error(`\x1b[31m│  ❌ エラー: ${String(errors.length).padEnd(35)}│\x1b[0m`);
  }
  if (warns.length > 0) {
    console.error(`\x1b[33m│  ⚠  警告: ${String(warns.length).padEnd(36)}│\x1b[0m`);
  }
  if (infos.length > 0) {
    console.error(`\x1b[36m│  ℹ  情報: ${String(infos.length).padEnd(36)}│\x1b[0m`);
  }

  // 上位5件まで表示
  issues.slice(0, 5).forEach(issue => {
    const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warn' ? '⚠ ' : 'ℹ ';
    const line = `${icon} L${issue.line}: ${issue.label}`;
    console.error(`\x1b[35m│  ${line.substring(0, 46).padEnd(46)}│\x1b[0m`);
  });

  if (issues.length > 5) {
    console.error(`\x1b[35m│  ... 他 ${String(issues.length - 5).padEnd(37)}件│\x1b[0m`);
  }

  console.error('\x1b[35m└────────────────────────────────────────────────┘\x1b[0m');
  console.error('');

  // stdout: AI向け注入（errorsとwarnsのみ）
  const actionable = [...errors, ...warns];
  if (actionable.length > 0) {
    const summary = actionable.slice(0, 3).map(i =>
      `${i.file}:${i.line} ${i.label}`
    ).join(', ');
    console.log(`[Quality Gate] ${relativePath}: ${actionable.length}件の問題検出。${summary}`);
  }

  log(`Checked ${relativePath}: ${errors.length} errors, ${warns.length} warns, ${infos.length} infos`);
}

async function main() {
  try {
    const stdinData = await readStdin();
    if (!stdinData) {
      process.exit(0);
      return;
    }

    let input;
    try {
      input = JSON.parse(stdinData);
    } catch (e) {
      process.exit(0);
      return;
    }

    // Edit/Write の対象ファイルパスを取得
    const toolInput = input.tool_input || input.input || {};
    const filePath = toolInput.file_path || toolInput.filePath || '';

    if (!shouldCheck(filePath)) {
      process.exit(0);
      return;
    }

    // 品質チェック実行
    const issues = checkFile(filePath);
    outputResults(issues, filePath);

  } catch (e) {
    log(`Error: ${e.message}`);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, shouldCheck, CONFIG };
