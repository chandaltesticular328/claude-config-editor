import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface MarkdownEditorProps {
  content: string;
  filePath: string;
  onChange: (content: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function MarkdownEditor({ content, filePath, onChange, onSave, isSaving }: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString();
        contentRef.current = newContent;
        onChange(newContent);
      }
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        updateListener,
        EditorView.theme({
          '&': { height: '100%', background: 'transparent' },
          '.cm-content': { fontFamily: 'ui-monospace, monospace', fontSize: '13px' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-gutters': { background: 'transparent', border: 'none', color: '#4b5563' },
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath]);

  // Update editor content when content changes externally (file load)
  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
    }
  }, [filePath, content]);

  const fileName = filePath.split('/').pop() ?? filePath;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{fileName}</span>
          <span className="text-xs text-slate-600 font-mono truncate max-w-48">{filePath}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-2 py-1 rounded text-xs transition-colors"
            style={{
              background: showPreview ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)',
              color: showPreview ? '#c4b5fd' : '#94a3b8',
              border: showPreview ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {showPreview ? 'Editor' : 'Preview'}
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-3 py-1 rounded text-xs font-medium transition-all"
            style={{
              background: 'rgba(59,130,246,0.25)',
              color: '#93c5fd',
              border: '1px solid rgba(59,130,246,0.4)',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {showPreview ? (
          <div
            className="h-full overflow-auto p-4 text-sm text-slate-300 leading-relaxed"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            <PreviewContent content={contentRef.current} />
          </div>
        ) : (
          <div ref={editorRef} className="h-full" />
        )}
      </div>
    </div>
  );
}

interface PreviewContentProps {
  content: string;
}

function PreviewContent({ content }: PreviewContentProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-xl font-bold text-white mb-2 mt-4">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-lg font-semibold text-slate-200 mb-1.5 mt-3">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-base font-medium text-slate-300 mb-1 mt-2">{line.slice(4)}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<li key={key++} className="text-slate-400 ml-4 mb-0.5 list-disc">{line.slice(2)}</li>);
    } else if (line.startsWith('```')) {
      elements.push(<div key={key++} className="text-xs text-slate-500 italic">{line}</div>);
    } else if (line === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(<p key={key++} className="text-slate-400 mb-1">{line}</p>);
    }
  }

  return <>{elements}</>;
}
