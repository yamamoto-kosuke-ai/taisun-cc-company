#!/usr/bin/env node
/**
 * Session Memory Persistence - セッション状態の自動保存・復元
 *
 * ECC (everything-claude-code) のSession Memory Persistenceを
 * Taisun CC Companyに組み込んだもの。
 *
 * 機能:
 * - SessionStart時: 前回のセッション状態を自動復元し、AIに注入
 * - Stop時: 現在のセッション状態を自動保存
 * - 7日超の古いスナップショットを自動アーカイブ
 *
 * Hook登録:
 * - SessionStart: セッション開始時に前回状態を復元
 * - Stop: 各レスポンス完了時に状態を保存
 *
 * @version 1.0.0
 * @origin everything-claude-code (Session Memory Persistence)
 */

const fs = require('fs');
const path = require('path');
const { readStdin } = require('./utils/read-stdin');

const PROJECT_DIR = process.cwd();

const CONFIG = {
  stateDir: path.join(PROJECT_DIR, '.claude/hooks/data/session-memory'),
  currentFile: path.join(PROJECT_DIR, '.claude/hooks/data/session-memory/current.json'),
  archiveDir: path.join(PROJECT_DIR, '.claude/hooks/data/session-memory/archive'),
  maxAgeDays: 7,
  maxSnapshots: 30
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadCurrentState() {
  try {
    if (fs.existsSync(CONFIG.currentFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.currentFile, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return null;
}

function saveCurrentState(state) {
  try {
    ensureDir(CONFIG.stateDir);
    fs.writeFileSync(CONFIG.currentFile, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) { /* ignore */ }
}

function archiveOldSnapshots() {
  try {
    ensureDir(CONFIG.archiveDir);
    const now = Date.now();
    const maxAge = CONFIG.maxAgeDays * 24 * 60 * 60 * 1000;

    // current.json が古ければアーカイブ
    if (fs.existsSync(CONFIG.currentFile)) {
      const stat = fs.statSync(CONFIG.currentFile);
      if (now - stat.mtimeMs > maxAge) {
        const archiveName = `session-${new Date(stat.mtimeMs).toISOString().slice(0, 10)}.json`;
        const archivePath = path.join(CONFIG.archiveDir, archiveName);
        fs.copyFileSync(CONFIG.currentFile, archivePath);
      }
    }

    // アーカイブが多すぎたら古いものを削除
    const archives = fs.readdirSync(CONFIG.archiveDir)
      .filter(f => f.endsWith('.json'))
      .sort();
    while (archives.length > CONFIG.maxSnapshots) {
      const oldest = archives.shift();
      fs.unlinkSync(path.join(CONFIG.archiveDir, oldest));
    }
  } catch (e) { /* ignore */ }
}

/**
 * SessionStart: 前回の状態を復元してAIコンテキストに注入
 */
function handleSessionStart() {
  archiveOldSnapshots();
  const state = loadCurrentState();

  if (!state) {
    // 初回セッション - 空の状態を作成
    saveCurrentState({
      lastUpdated: new Date().toISOString(),
      sessionCount: 1,
      activeTopics: [],
      recentDecisions: [],
      pendingTasks: [],
      workContext: ''
    });
    return;
  }

  // 前回からの経過時間
  const lastUpdated = new Date(state.lastUpdated);
  const hoursAgo = ((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60)).toFixed(1);

  // セッションカウント更新
  state.sessionCount = (state.sessionCount || 0) + 1;

  const parts = [];
  parts.push(`[Session Memory] 前回セッションから${hoursAgo}時間経過 (通算${state.sessionCount}回目)`);

  if (state.activeTopics && state.activeTopics.length > 0) {
    parts.push(`進行中トピック: ${state.activeTopics.join(', ')}`);
  }

  if (state.recentDecisions && state.recentDecisions.length > 0) {
    parts.push(`直近の決定: ${state.recentDecisions.slice(0, 3).join(' / ')}`);
  }

  if (state.pendingTasks && state.pendingTasks.length > 0) {
    parts.push(`未完了タスク: ${state.pendingTasks.slice(0, 5).join(', ')}`);
  }

  if (state.workContext) {
    parts.push(`作業コンテキスト: ${state.workContext}`);
  }

  // stdout: AIコンテキストに注入
  console.log(parts.join('\n'));

  // 状態を更新して保存
  state.lastUpdated = new Date().toISOString();
  saveCurrentState(state);
}

/**
 * Stop: セッション状態を保存
 */
function handleStop(input) {
  const state = loadCurrentState() || {
    lastUpdated: new Date().toISOString(),
    sessionCount: 1,
    activeTopics: [],
    recentDecisions: [],
    pendingTasks: [],
    workContext: ''
  };

  // Stop hookから得られる情報でstateを更新
  // （AIの最後のレスポンスから抽出する情報は限定的だが、タイムスタンプ更新は確実に行う）
  state.lastUpdated = new Date().toISOString();

  // .company/secretary/todos/ から未完了タスクを収集
  try {
    const todosDir = path.join(PROJECT_DIR, '.company/secretary/todos');
    if (fs.existsSync(todosDir)) {
      const todayFile = path.join(todosDir, `${new Date().toISOString().slice(0, 10)}.md`);
      if (fs.existsSync(todayFile)) {
        const content = fs.readFileSync(todayFile, 'utf8');
        const pending = content.match(/^- \[ \] .+/gm);
        if (pending) {
          state.pendingTasks = pending.map(t => t.replace('- [ ] ', '').split('|')[0].trim()).slice(0, 10);
        }
      }
    }
  } catch (e) { /* ignore */ }

  // ceo/decisions/ から直近の決定を収集
  try {
    const decisionsDir = path.join(PROJECT_DIR, '.company/ceo/decisions');
    if (fs.existsSync(decisionsDir)) {
      const files = fs.readdirSync(decisionsDir)
        .filter(f => f.endsWith('.md') && !f.startsWith('_'))
        .sort()
        .reverse()
        .slice(0, 3);
      state.recentDecisions = files.map(f => f.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, ''));
    }
  } catch (e) { /* ignore */ }

  saveCurrentState(state);
}

async function main() {
  try {
    const stdinData = await readStdin();
    let input = {};

    if (stdinData) {
      try {
        input = JSON.parse(stdinData);
      } catch (e) { /* not JSON */ }
    }

    // SessionStart or Stop を判別
    // SessionStart hookとして呼ばれた場合は復元、Stop hookとして呼ばれた場合は保存
    const hookEvent = input.hook_event || process.env.CLAUDE_HOOK_EVENT || '';

    if (hookEvent === 'Stop' || process.argv.includes('--stop')) {
      handleStop(input);
    } else {
      // デフォルトはSessionStart（復元）
      handleSessionStart();
    }
  } catch (e) {
    // エラーでもブロックしない
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { loadCurrentState, saveCurrentState, CONFIG };
