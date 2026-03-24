#!/usr/bin/env node
/**
 * ECC Integration - settings.json Hook自動登録スクリプト
 *
 * settings.jsonをJSONとして安全にパースし、
 * ECC統合3機能（Session Memory, Continuous Learning, Quality Gate）を登録する。
 * 既に登録済みの場合はスキップ。
 *
 * Usage: node register-hooks.js <settings.json path>
 */

const fs = require('fs');

const ECC_HOOKS = {
  SessionStart: [
    {
      matcher: '',
      hooks: [
        {
          type: 'command',
          command: 'node .claude/hooks/session-memory-persistence.js',
          timeout: 5
        }
      ]
    }
  ],
  PostToolUse: [
    {
      matcher: 'Edit|Write|Bash',
      hooks: [
        {
          type: 'command',
          command: 'node .claude/hooks/continuous-learning.js',
          timeout: 3
        }
      ]
    },
    {
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command: 'node .claude/hooks/quality-gate.js',
          timeout: 5
        }
      ]
    }
  ],
  Stop: [
    {
      matcher: '',
      hooks: [
        {
          type: 'command',
          command: 'node .claude/hooks/session-memory-persistence.js --stop',
          timeout: 3
        }
      ]
    }
  ]
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

  if (!settings.hooks) {
    settings.hooks = {};
  }

  let added = 0;

  for (const [event, hookEntries] of Object.entries(ECC_HOOKS)) {
    if (!settings.hooks[event]) {
      settings.hooks[event] = [];
    }

    // Stop が空配列の場合も対応
    if (!Array.isArray(settings.hooks[event])) {
      settings.hooks[event] = [];
    }

    for (const hookEntry of hookEntries) {
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
  }

  if (added > 0) {
    const backupPath = settingsPath + '.pre-ecc.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(settingsPath, backupPath);
      console.log(`BACKUP: ${backupPath}`);
    }

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    console.log(`SAVED: ${settingsPath} (${added} hooks added)`);
  } else {
    console.log('NO CHANGES: All hooks already registered');
  }

  process.exit(0);
}

main();
