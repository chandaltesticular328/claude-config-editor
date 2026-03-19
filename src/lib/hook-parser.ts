import type { HookCard, HookType, HooksConfig } from '../types';

export const HOOK_TYPES: HookType[] = [
  'PreToolUse',
  'PostToolUse',
  'UserPromptSubmit',
  'Stop',
  'SubagentStop',
  'TaskCompleted',
  'Notification',
  'PreCompact',
];

export const HOOK_TYPE_COLORS: Record<HookType, string> = {
  PreToolUse: '#3b82f6',
  PostToolUse: '#10b981',
  UserPromptSubmit: '#a855f7',
  Stop: '#ef4444',
  SubagentStop: '#f97316',
  TaskCompleted: '#06b6d4',
  Notification: '#f59e0b',
  PreCompact: '#ec4899',
};

export const HOOK_TYPE_BG: Record<HookType, string> = {
  PreToolUse: 'rgba(59, 130, 246, 0.15)',
  PostToolUse: 'rgba(16, 185, 129, 0.15)',
  UserPromptSubmit: 'rgba(168, 85, 247, 0.15)',
  Stop: 'rgba(239, 68, 68, 0.15)',
  SubagentStop: 'rgba(249, 115, 22, 0.15)',
  TaskCompleted: 'rgba(6, 182, 212, 0.15)',
  Notification: 'rgba(245, 158, 11, 0.15)',
  PreCompact: 'rgba(236, 72, 153, 0.15)',
};

export function parseHooksToCards(hooksConfig: HooksConfig): HookCard[] {
  const cards: HookCard[] = [];
  let idCounter = 0;

  for (const hookType of HOOK_TYPES) {
    const entries = hooksConfig[hookType];
    if (!entries) continue;
    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      const entry = entries[entryIndex];
      for (let hookIndex = 0; hookIndex < entry.hooks.length; hookIndex++) {
        const hook = entry.hooks[hookIndex];
        cards.push({
          id: `${hookType}-${entryIndex}-${hookIndex}-${idCounter++}`,
          hookType: hookType as HookType,
          matcher: entry.matcher,
          command: hook.command,
          entryIndex,
          hookIndex,
          isActive: true,
        });
      }
    }
  }

  return cards;
}

export function cardsToHooksConfig(cards: HookCard[]): HooksConfig {
  const config: HooksConfig = {};

  for (const card of cards) {
    if (!card.isActive) continue;
    if (!config[card.hookType]) {
      config[card.hookType] = [];
    }

    const existing = config[card.hookType].find((e) => e.matcher === card.matcher);
    if (existing) {
      existing.hooks.push({ type: 'command', command: card.command });
    } else {
      config[card.hookType].push({
        matcher: card.matcher,
        hooks: [{ type: 'command', command: card.command }],
      });
    }
  }

  return config;
}

export function getCommandName(command: string): string {
  const parts = command.split('/');
  const filename = parts[parts.length - 1] ?? command;
  return filename.split(' ')[0] ?? filename;
}
