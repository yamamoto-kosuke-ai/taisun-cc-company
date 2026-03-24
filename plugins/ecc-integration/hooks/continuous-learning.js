#!/usr/bin/env node
/**
 * Continuous Learning System - パターン自動抽出・スキル昇華
 *
 * ECC (everything-claude-code) のContinuous Learningを
 * Taisun CC Companyに組み込んだもの。
 *
 * 機能:
 * - PostToolUse時にツール使用パターンを記録
 * - 同一パターンの出現回数・成功率を追跡
 * - 閾値（3回以上 + 成功率80%以上）でスキル化を提案
 * - 学習データはJSONで永続化
 *
 * Hook登録: PostToolUse (Edit|Write|Bash)
 *
 * @version 1.0.0
 * @origin everything-claude-code (Continuous Learning)
 */

const fs = require('fs');
const path = require('path');
const { readStdin } = require('./utils/read-stdin');

const PROJECT_DIR = process.cwd();

const CONFIG = {
  dataFile: path.join(PROJECT_DIR, '.claude/hooks/data/learning/patterns.json'),
  logFile: path.join(PROJECT_DIR, '.claude/hooks/data/learning/learning.log'),
  minOccurrences: 3,
  minSuccessRate: 0.8,
  maxPatterns: 200,
  cooldownMs: 300000 // 同一パターンの提案は5分に1回まで
};

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadPatterns() {
  try {
    if (fs.existsSync(CONFIG.dataFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return { patterns: {}, meta: { totalRecords: 0, lastCleanup: null } };
}

function savePatterns(data) {
  try {
    ensureDir(CONFIG.dataFile);
    fs.writeFileSync(CONFIG.dataFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) { /* ignore */ }
}

function log(msg) {
  try {
    ensureDir(CONFIG.logFile);
    fs.appendFileSync(CONFIG.logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) { /* ignore */ }
}

/**
 * ツール使用からパターンキーを生成
 * 例: "Edit:src/api/*.ts:error-handling" のような粒度
 */
function extractPatternKey(input) {
  const toolName = input.tool_name || input.toolName || 'unknown';
  const toolInput = input.tool_input || input.input || {};

  let target = '';

  if (toolName === 'Edit' || toolName === 'Write') {
    // ファイルパスからディレクトリ + 拡張子でパターン化
    const filePath = toolInput.file_path || toolInput.filePath || '';
    if (filePath) {
      const ext = path.extname(filePath);
      const dir = path.dirname(filePath).split(path.sep).slice(-2).join('/');
      target = `${dir}/*${ext}`;
    }
  } else if (toolName === 'Bash') {
    // コマンドの先頭部分でパターン化
    const command = toolInput.command || '';
    const cmdBase = command.split(/\s+/).slice(0, 2).join(' ');
    target = cmdBase.substring(0, 50);
  }

  if (!target) return null;
  return `${toolName}:${target}`;
}

/**
 * パターンを記録
 */
function recordPattern(data, patternKey, input) {
  const isSuccess = !input.tool_error && !input.error;

  if (!data.patterns[patternKey]) {
    data.patterns[patternKey] = {
      key: patternKey,
      occurrences: 0,
      successes: 0,
      failures: 0,
      firstSeen: new Date().toISOString(),
      lastSeen: null,
      lastSuggested: null,
      promoted: false // スキル化済みフラグ
    };
  }

  const pattern = data.patterns[patternKey];
  pattern.occurrences++;
  pattern.lastSeen = new Date().toISOString();

  if (isSuccess) {
    pattern.successes++;
  } else {
    pattern.failures++;
  }

  data.meta.totalRecords++;
  return pattern;
}

/**
 * スキル化提案の判定
 */
function shouldSuggest(pattern) {
  if (pattern.promoted) return false;
  if (pattern.occurrences < CONFIG.minOccurrences) return false;

  const successRate = pattern.successes / pattern.occurrences;
  if (successRate < CONFIG.minSuccessRate) return false;

  // クールダウンチェック
  if (pattern.lastSuggested) {
    const elapsed = Date.now() - new Date(pattern.lastSuggested).getTime();
    if (elapsed < CONFIG.cooldownMs) return false;
  }

  return true;
}

/**
 * 古いパターンのクリーンアップ
 */
function cleanup(data) {
  const keys = Object.keys(data.patterns);
  if (keys.length <= CONFIG.maxPatterns) return;

  // 出現回数が少なく、最終使用が古いものから削除
  const sorted = keys
    .map(k => ({ key: k, ...data.patterns[k] }))
    .sort((a, b) => {
      // promoted は残す
      if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
      // 出現回数で昇順
      if (a.occurrences !== b.occurrences) return a.occurrences - b.occurrences;
      // 最終使用日で昇順
      return new Date(a.lastSeen) - new Date(b.lastSeen);
    });

  // 半分まで削減
  const toRemove = sorted.slice(0, Math.floor(keys.length / 2));
  toRemove.forEach(item => {
    delete data.patterns[item.key];
  });

  data.meta.lastCleanup = new Date().toISOString();
  log(`Cleanup: removed ${toRemove.length} patterns, ${Object.keys(data.patterns).length} remaining`);
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

    const patternKey = extractPatternKey(input);
    if (!patternKey) {
      process.exit(0);
      return;
    }

    // パターン記録
    const data = loadPatterns();
    const pattern = recordPattern(data, patternKey, input);

    // クリーンアップ
    cleanup(data);

    // スキル化提案チェック
    if (shouldSuggest(pattern)) {
      const successRate = ((pattern.successes / pattern.occurrences) * 100).toFixed(0);

      // stderr: ユーザー向け通知
      console.error('');
      console.error('\x1b[33m┌────────────────────────────────────────────────┐\x1b[0m');
      console.error('\x1b[33m│  Continuous Learning: パターン検出             │\x1b[0m');
      console.error('\x1b[33m├────────────────────────────────────────────────┤\x1b[0m');
      console.error(`\x1b[33m│  パターン: ${pattern.key.substring(0, 36).padEnd(36)}│\x1b[0m`);
      console.error(`\x1b[33m│  出現: ${String(pattern.occurrences).padEnd(3)}回 / 成功率: ${successRate.padEnd(3)}%              │\x1b[0m`);
      console.error('\x1b[33m│  → /learn でスキル化を検討してください         │\x1b[0m');
      console.error('\x1b[33m└────────────────────────────────────────────────┘\x1b[0m');
      console.error('');

      // stdout: AI向け注入
      console.log(`[Learning] 繰り返しパターン検出: "${pattern.key}" (${pattern.occurrences}回, 成功率${successRate}%)。/learn でスキル化を検討してください。`);

      pattern.lastSuggested = new Date().toISOString();
      log(`Suggested skill creation for: ${pattern.key} (${pattern.occurrences} occurrences, ${successRate}% success)`);
    }

    savePatterns(data);
  } catch (e) {
    // エラーでもブロックしない
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { loadPatterns, savePatterns, extractPatternKey, CONFIG };
