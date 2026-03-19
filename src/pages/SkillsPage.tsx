import { useCallback, useEffect, useState } from 'react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { fetchFileTree, fetchFile, saveFile } from '../lib/claude-fs';
import type { FileNode, Scope } from '../types';

interface SkillsPageProps {
  scope: Scope;
}

interface SkillGroup {
  name: string;
  files: FileNode[];
}

export function SkillsPage({ scope }: SkillsPageProps) {
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
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
      const skillsDir = result.tree.find((n) => n.name === 'skills');
      if (!skillsDir?.children) {
        setSkillGroups([]);
        return;
      }

      const groups: SkillGroup[] = [];
      for (const child of skillsDir.children) {
        if (child.type === 'directory') {
          const mdFiles = child.children?.filter((f) => f.name.endsWith('.md')) ?? [];
          if (mdFiles.length > 0) {
            groups.push({ name: child.name, files: mdFiles });
          }
        } else if (child.name.endsWith('.md')) {
          groups.push({ name: '.', files: [child] });
        }
      }
      setSkillGroups(groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
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
      <div className="w-52 shrink-0 flex flex-col gap-1 overflow-auto">
        <h3 className="text-xs font-medium text-slate-400 px-2 py-1 shrink-0">Skills</h3>
        {isLoading && <div className="text-xs text-slate-600 px-2 animate-pulse">Loading...</div>}
        {error && <div className="text-xs text-red-400 px-2">{error}</div>}
        {skillGroups.map((group) => (
          <div key={group.name}>
            {group.name !== '.' && (
              <div className="text-xs text-slate-600 px-2 py-0.5 font-medium">{group.name}</div>
            )}
            {group.files.map((file) => (
              <button
                key={file.path}
                onClick={() => handleFileSelect(file)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all truncate"
                style={{
                  background: selectedFile?.path === file.path ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.03)',
                  color: selectedFile?.path === file.path ? '#67e8f9' : '#94a3b8',
                  border: selectedFile?.path === file.path ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  marginTop: '2px',
                }}
              >
                {file.name}
              </button>
            ))}
          </div>
        ))}
        {!isLoading && skillGroups.length === 0 && (
          <div className="text-xs text-slate-600 px-2">No skills found</div>
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
            Select a skill to edit
          </div>
        )}
      </div>
    </div>
  );
}
