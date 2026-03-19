export type Scope = 'user' | 'project';

export type HookType =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'UserPromptSubmit'
  | 'Stop'
  | 'SubagentStop'
  | 'TaskCompleted'
  | 'Notification'
  | 'PreCompact';

export interface HookCommand {
  type: 'command';
  command: string;
}

export interface HookEntry {
  matcher: string;
  hooks: HookCommand[];
}

export interface HooksConfig {
  [key: string]: HookEntry[];
}

export interface SettingsJson {
  env?: Record<string, string>;
  permissions?: {
    allow?: string[];
    deny?: string[];
    defaultMode?: string;
  };
  hooks?: HooksConfig;
  [key: string]: unknown;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface HookCard {
  id: string;
  hookType: HookType;
  matcher: string;
  command: string;
  entryIndex: number;
  hookIndex: number;
  isActive: boolean;
  scopeSource?: 'user' | 'project';
}

export interface Page {
  id: string;
  label: string;
  icon: string;
}

export interface DiffResult {
  diff: string;
  hasChanges: boolean;
}

// Pipeline item types for Hook canvas drag-and-drop
export type PipelineItemType = 'hook' | 'agent' | 'skill' | 'command';

export interface PipelineItem {
  id: string;
  itemType: PipelineItemType;
  name: string;
  filePath: string;
  description?: string;
}

// Memory-bank project entry
export interface ProjectEntry {
  cwd: string;
  project: string;
  lastAccessed: string;
  exchangeCount: number;
}
