#!/usr/bin/env node
/**
 * HR Labor Pack - settings.json Hook自動登録スクリプト
 *
 * settings.jsonをJSONとして安全にパースし、
 * hr-law-watcher と hr-payroll-validator を登録する。
 * 既に登録済みの場合はスキップ。
 *
 * Usage: node register-hooks.js <settings.json path>
 */

const fs = require('fs');
const path = require('path');

const HR_HOOKS = {
  SessionStart: {
    matcher: '',
    hooks: [
      {
        type: 'command',
        command: 'node .claude/hooks/hr-law-watcher.js',
        timeout: 5
      }
    ]
  },
  PostToolUse: {
    matcher: 'Edit|Write',
    hooks: [
      {
        type: 'command',
        command: 'node .claude/hooks/hr-payroll-validator.js',
        timeout: 5
      }
    ]
  }
};

function main() {
  const settingsPath = process.argv[2];

  if (!settingsPath) {
    console.error('Usage: node register-hooks.js <settings.json path>');
    process.exit(1);
  }

  if (!fs.existsSync(settingsPath)) {
    console.error(`Error: ${settingsPath} not found`);
    process.exit(1);
  }

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    console.error(`Error: Failed to parse ${settingsPath}: ${e.message}`);
    process.exit(1);
  }

  // hooks セクションがなければ作成
  if (!settings.hooks) {
    settings.hooks = {};
  }

  let added = 0;

  for (const [event, hookEntry] of Object.entries(HR_HOOKS)) {
    // イベントセクションがなければ作成
    if (!settings.hooks[event]) {
      settings.hooks[event] = [];
    }

    // 既に登録済みかチェック（command文字列で判定）
    const commandStr = hookEntry.hooks[0].command;
    const alreadyExists = settings.hooks[event].some(entry => {
      if (!entry.hooks || !Array.isArray(entry.hooks)) return false;
      return entry.hooks.some(h => h.command === commandStr);
    });

    if (alreadyExists) {
      console.log(`SKIP: ${commandStr} (already registered in ${event})`);
    } else {
      settings.hooks[event].push(hookEntry);
      console.log(`ADDED: ${commandStr} -> ${event}`);
      added++;
    }
  }

  if (added > 0) {
    // バックアップ作成
    const backupPath = settingsPath + '.pre-hr-pack.backup';
    fs.copyFileSync(settingsPath, backupPath);
    console.log(`BACKUP: ${backupPath}`);

    // 書き込み
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    console.log(`SAVED: ${settingsPath} (${added} hooks added)`);
  } else {
    console.log('NO CHANGES: All hooks already registered');
  }

  process.exit(0);
}

main();
