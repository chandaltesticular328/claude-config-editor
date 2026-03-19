interface DiffPreviewProps {
  diff: string;
  onClose: () => void;
}

export function DiffPreview({ diff, onClose }: DiffPreviewProps) {
  if (!diff) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">No changes detected</div>
    );
  }

  const lines = diff.split('\n');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-xs font-medium text-slate-300">Git Diff Preview</span>
        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-0.5 rounded hover:bg-white/5"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <pre className="text-xs font-mono leading-5">
          {lines.map((line, i) => {
            let color = '#94a3b8';
            let bg = 'transparent';
            if (line.startsWith('+') && !line.startsWith('+++')) {
              color = '#86efac';
              bg = 'rgba(34, 197, 94, 0.08)';
            } else if (line.startsWith('-') && !line.startsWith('---')) {
              color = '#fca5a5';
              bg = 'rgba(239, 68, 68, 0.08)';
            } else if (line.startsWith('@@')) {
              color = '#93c5fd';
              bg = 'rgba(59, 130, 246, 0.08)';
            } else if (line.startsWith('diff ') || line.startsWith('index ')) {
              color = '#cbd5e1';
            }
            return (
              <div key={i} style={{ color, background: bg }} className="px-2 rounded-sm">
                {line || ' '}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
