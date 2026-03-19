import type { PipelineItem, PipelineItemType } from '../types';

export const ITEM_TYPE_COLORS: Record<PipelineItemType, string> = {
  hook: '#3b82f6',
  agent: '#a855f7',
  skill: '#06b6d4',
  command: '#f59e0b',
};

export const ITEM_TYPE_BG: Record<PipelineItemType, string> = {
  hook: 'rgba(59, 130, 246, 0.15)',
  agent: 'rgba(168, 85, 247, 0.15)',
  skill: 'rgba(6, 182, 212, 0.15)',
  command: 'rgba(245, 158, 11, 0.15)',
};

export const ITEM_TYPE_ICONS: Record<PipelineItemType, string> = {
  hook: '⚡',
  agent: '🤖',
  skill: '🎯',
  command: '⌘',
};

const DRAG_DATA_KEY = 'application/cc-sync';

interface DraggablePaletteItemProps {
  item: PipelineItem;
}

function DraggablePaletteItem({ item }: DraggablePaletteItemProps) {
  const color = ITEM_TYPE_COLORS[item.itemType];
  const bg = ITEM_TYPE_BG[item.itemType];
  const icon = ITEM_TYPE_ICONS[item.itemType];

  function handleDragStart(e: React.DragEvent) {
    const data = JSON.stringify({ kind: 'palette', item });
    e.dataTransfer.setData(DRAG_DATA_KEY, data);
    e.dataTransfer.effectAllowed = 'copyMove';
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-grab transition-all text-xs select-none"
      style={{
        background: bg,
        border: `1px solid ${color}30`,
      }}
    >
      <span
        className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
        style={{
          background: `${color}25`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {icon}
      </span>
      <span className="truncate font-medium" style={{ color }}>
        {item.name}
      </span>
    </div>
  );
}

interface PipelinePaletteProps {
  items: PipelineItem[];
  isLoading: boolean;
}

export function PipelinePalette({ items, isLoading }: PipelinePaletteProps) {
  const agents = items.filter((i) => i.itemType === 'agent');
  const skills = items.filter((i) => i.itemType === 'skill');
  const commands = items.filter((i) => i.itemType === 'command');

  const sections: Array<{ label: string; type: PipelineItemType; items: PipelineItem[] }> = [
    { label: 'Agents', type: 'agent', items: agents },
    { label: 'Skills', type: 'skill', items: skills },
    { label: 'Commands', type: 'command', items: commands },
  ];

  return (
    <div className="flex flex-col gap-2 shrink-0 overflow-auto" style={{ width: '180px' }}>
      <div className="text-xs font-medium text-slate-400 px-1">Palette</div>
      {isLoading && (
        <div className="text-xs text-slate-600 px-1 animate-pulse">Loading...</div>
      )}
      {!isLoading && items.length === 0 && (
        <div className="text-xs text-slate-600 px-1">No items found</div>
      )}
      {sections.map((section) => {
        if (section.items.length === 0) return null;
        const color = ITEM_TYPE_COLORS[section.type];
        return (
          <div key={section.type} className="flex flex-col gap-1">
            <div
              className="text-[10px] font-medium uppercase tracking-wider px-1"
              style={{ color }}
            >
              {section.label}
            </div>
            {section.items.map((item) => (
              <DraggablePaletteItem key={item.id} item={item} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
