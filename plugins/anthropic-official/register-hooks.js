#!/usr/bin/env node
/**
 * Anthropic Official Plugins - settings.json Hook自動登録スクリプト
 *
 * security_reminder_hook.py を PreToolUse に登録する。
 *
 * Usage: node register-hooks.js <settings.json path>
 */

const fs = require('fs');

const HOOKS = {
  PreToolUse: [
    {
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command: 'python3 .claude/hooks/security_reminder_hook.py',
          timeout: 5
        }
      ]
    }
  ]
};

function main() {
  const settingsPath = process.argv[2];

  if (!settingsPath || !fs.existsSync(settingsPath)) {
    console.error('Usage: node register-hooks.js <settings.json path>');
    process.exit(1);
  }

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    console.error(`Error: Failed to parse ${settingsPath}: ${e.message}`);
    process.exit(1);
  }

  if (!settings.hooks) settings.hooks = {};

  let added = 0;

  for (const [event, hookEntries] of Object.entries(HOOKS)) {
    if (!settings.hooks[event]) settings.hooks[event] = [];
    if (!Array.isArray(settings.hooks[event])) settings.hooks[event] = [];

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
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    console.log(`SAVED: ${settingsPath} (${added} hooks added)`);
  } else {
    console.log('NO CHANGES: All hooks already registered');
  }

  process.exit(0);
}

main();
