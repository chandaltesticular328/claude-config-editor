import type { FileNode, SettingsJson, DiffResult, PipelineItem, ProjectEntry } from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchFileTree(
  scope: 'user' | 'project',
  projectPath?: string
): Promise<{ baseDir: string; tree: FileNode[] }> {
  const params = new URLSearchParams({ scope });
  if (projectPath) params.set('projectPath', projectPath);
  const res = await fetch(`${BASE_URL}/tree?${params}`);
  return handleResponse(res);
}

export async function fetchFile(filePath: string): Promise<{ path: string; content: string }> {
  const params = new URLSearchParams({ path: filePath });
  const res = await fetch(`${BASE_URL}/file?${params}`);
  return handleResponse(res);
}

export async function saveFile(filePath: string, content: string): Promise<{ success: boolean; path: string }> {
  const res = await fetch(`${BASE_URL}/file`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: filePath, content }),
  });
  return handleResponse(res);
}

export async function fetchSettings(
  scope: 'user' | 'project',
  projectPath?: string
): Promise<{ settings: SettingsJson; path: string }> {
  const params = new URLSearchParams({ scope });
  if (projectPath) params.set('projectPath', projectPath);
  const res = await fetch(`${BASE_URL}/settings?${params}`);
  return handleResponse(res);
}

export async function saveSettings(
  scope: 'user' | 'project',
  settings: SettingsJson,
  projectPath?: string
): Promise<{ success: boolean; path: string }> {
  const res = await fetch(`${BASE_URL}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, settings, projectPath }),
  });
  return handleResponse(res);
}

export async function fetchDiff(filePath: string): Promise<DiffResult> {
  const params = new URLSearchParams({ path: filePath });
  const res = await fetch(`${BASE_URL}/diff?${params}`);
  return handleResponse(res);
}

export async function fetchAvailableHooks(): Promise<{ hooks: string[] }> {
  const res = await fetch(`${BASE_URL}/hooks/available`);
  return handleResponse(res);
}

export async function fetchPipelineItems(
  scope: 'user' | 'project',
  projectPath?: string
): Promise<{ items: PipelineItem[] }> {
  const params = new URLSearchParams({ scope });
  if (projectPath) params.set('projectPath', projectPath);
  const res = await fetch(`${BASE_URL}/pipeline-items?${params}`);
  return handleResponse(res);
}

export async function fetchProjects(): Promise<{ projects: ProjectEntry[] }> {
  const res = await fetch(`${BASE_URL}/projects`);
  return handleResponse(res);
}
