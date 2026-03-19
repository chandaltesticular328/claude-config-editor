import { useCallback, useEffect, useState } from 'react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { fetchFileTree, fetchFile, saveFile } from '../lib/claude-fs';
import type { FileNode, Scope } from '../types';

interface RulesPageProps {
  scope: Scope;
}

export function RulesPage({ scope }: RulesPageProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await fetchFileTree(scope);
      const rulesDir = result.tree.find((n) => n.name === 'rules');
      const ruleFiles = rulesDir?.children?.filter((f) => f.type === 'file' && f.name.endsWith('.md')) ?? [];
      setFiles(ruleFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rules');
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileSelect = async (file: FileNode) => {
    setSelectedFile(file);
    try {
      const result = await fetchFile(file.path);
      setContent(result.content);
    } catch {
      setContent('# Error\n\nCould not load file.');
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      await saveFile(selectedFile.path, content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full gap-3">
      {/* File list */}
      <div className="w-48 shrink-0 flex flex-col gap-1">
        <h3 className="text-xs font-medium text-slate-400 px-2 py-1">Rules</h3>
        {isLoading && <div className="text-xs text-slate-600 px-2 animate-pulse">Loading...</div>}
        {error && <div className="text-xs text-red-400 px-2">{error}</div>}
        {files.map((file) => (
          <button
            key={file.path}
            onClick={() => handleFileSelect(file)}
            className="text-left px-2 py-1.5 rounded-lg text-xs transition-all truncate"
            style={{
              background: selectedFile?.path === file.path ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
              color: selectedFile?.path === file.path ? '#fcd34d' : '#94a3b8',
              border: selectedFile?.path === file.path ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {file.name}
          </button>
        ))}
        {!isLoading && files.length === 0 && (
          <div className="text-xs text-slate-600 px-2">No rules found</div>
        )}
      </div>

      {/* Editor */}
      <div
        className="flex-1 rounded-xl overflow-hidden"
        style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {selectedFile ? (
          <MarkdownEditor
            key={selectedFile.path}
            content={content}
            filePath={selectedFile.path}
            onChange={setContent}
            onSave={handleSave}
            isSaving={isSaving}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">
            Select a rule to edit
          </div>
        )}
      </div>
    </div>
  );
}
