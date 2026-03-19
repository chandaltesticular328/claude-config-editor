import { useCallback, useEffect, useState } from 'react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { fetchFileTree, fetchFile, saveFile } from '../lib/claude-fs';
import type { FileNode, Scope } from '../types';

/* ── Agent categorization ── */

type AgentCategory = 'orchestrator' | 'specialist' | 'utility';

interface AgentInfo {
  name: string;
  file: FileNode;
  category: AgentCategory;
}

const ORCHESTRATOR_KEYWORDS = ['orchestrator', 'manager', 'team', 'coordinator'];
const SPECIALIST_KEYWORDS = [
  'specialist', 'frontend', 'backend', 'flutter', 'designer',
  'developer', 'engineer', 'tester', 'reviewer', 'fixer',
];

function categorizeAgent(name: string): AgentCategory {
  const lower = name.toLowerCase();
  if (ORCHESTRATOR_KEYWORDS.some((k) => lower.includes(k))) return 'orchestrator';
  if (SPECIALIST_KEYWORDS.some((k) => lower.includes(k))) return 'specialist';
  return 'utility';
}

function getShortName(fileName: string): string {
  return fileName.replace(/\.md$/, '');
}

/* ── Workflow Diagram ── */

interface AgentNodeProps {
  agent: AgentInfo;
  isSelected: boolean;
  onClick: (agent: AgentInfo) => void;
}

function AgentNode({ agent, isSelected, onClick }: AgentNodeProps) {
  const categoryConfig = {
    orchestrator: { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', icon: '◆' },
    specialist: { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.35)', icon: '✦' },
    utility: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', icon: '⊙' },
  };
  const cfg = categoryConfig[agent.category];

  return (
    <button
      onClick={() => onClick(agent)}
      className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
      style={{
        background: isSelected ? cfg.bg.replace('0.15', '0.3').replace('0.12', '0.25').replace('0.1', '0.2') : cfg.bg,
        border: isSelected ? `2px solid ${cfg.color}` : `1px solid ${cfg.border}`,
        minWidth: '100px',
        maxWidth: '140px',
        boxShadow: isSelected ? `0 0 16px ${cfg.color}30` : 'none',
      }}
    >
      <span className="text-lg">{cfg.icon}</span>
      <span className="text-[10px] font-medium text-center leading-tight" style={{ color: cfg.color }}>
        {getShortName(agent.file.name)}
      </span>
    </button>
  );
}

/* ── Workflow Lane ── */

interface WorkflowLaneProps {
  title: string;
  subtitle: string;
  color: string;
  agents: AgentInfo[];
  selectedAgent: AgentInfo | null;
  onAgentClick: (agent: AgentInfo) => void;
}

function WorkflowLane({ title, subtitle, color, agents, selectedAgent, onAgentClick }: WorkflowLaneProps) {
  if (agents.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-lg"
          style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
        >
          {title}
        </span>
        <span className="text-[10px]" style={{ color: '#4a5568' }}>{subtitle}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {agents.map((agent) => (
          <AgentNode
            key={agent.file.path}
            agent={agent}
            isSelected={selectedAgent?.file.path === agent.file.path}
            onClick={onAgentClick}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Arrow connector ── */

function FlowArrow() {
  return (
    <div className="flex items-center justify-center px-2 shrink-0">
      <div className="flex flex-col items-center gap-1">
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
        <span className="text-slate-600 text-xs">▼</span>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
      </div>
    </div>
  );
}

/* ── Workflow Diagram (top section) ── */

interface WorkflowDiagramProps {
  agents: AgentInfo[];
  selectedAgent: AgentInfo | null;
  onAgentClick: (agent: AgentInfo) => void;
}

function WorkflowDiagram({ agents, selectedAgent, onAgentClick }: WorkflowDiagramProps) {
  const orchestrators = agents.filter((a) => a.category === 'orchestrator');
  const specialists = agents.filter((a) => a.category === 'specialist');
  const utilities = agents.filter((a) => a.category === 'utility');

  if (agents.length === 0) return null;

  return (
    <div
      className="shrink-0 rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Agent Workflow
        </h3>
        <span className="text-[10px] text-slate-600">{agents.length} agents</span>
      </div>
      <div className="flex flex-col gap-1">
        {orchestrators.length > 0 && (
          <WorkflowLane
            title="Orchestrators"
            subtitle="route & coordinate"
            color="#a855f7"
            agents={orchestrators}
            selectedAgent={selectedAgent}
            onAgentClick={onAgentClick}
          />
        )}
        {orchestrators.length > 0 && specialists.length > 0 && <FlowArrow />}
        {specialists.length > 0 && (
          <WorkflowLane
            title="Specialists"
            subtitle="implement & execute"
            color="#22d3ee"
            agents={specialists}
            selectedAgent={selectedAgent}
            onAgentClick={onAgentClick}
          />
        )}
        {(orchestrators.length > 0 || specialists.length > 0) && utilities.length > 0 && (
          <FlowArrow />
        )}
        {utilities.length > 0 && (
          <WorkflowLane
            title="Utilities"
            subtitle="support & tooling"
            color="#94a3b8"
            agents={utilities}
            selectedAgent={selectedAgent}
            onAgentClick={onAgentClick}
          />
        )}
      </div>
    </div>
  );
}

/* ── Agent List Item ── */

interface AgentListItemProps {
  agent: AgentInfo;
  isSelected: boolean;
  onClick: (agent: AgentInfo) => void;
}

function AgentListItem({ agent, isSelected, onClick }: AgentListItemProps) {
  const categoryConfig = {
    orchestrator: { color: '#a855f7', icon: '◆' },
    specialist: { color: '#22d3ee', icon: '✦' },
    utility: { color: '#94a3b8', icon: '⊙' },
  };
  const cfg = categoryConfig[agent.category];

  return (
    <button
      onClick={() => onClick(agent)}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all text-left"
      style={{
        background: isSelected ? `${cfg.color}18` : 'rgba(255,255,255,0.02)',
        color: isSelected ? cfg.color : '#94a3b8',
        border: isSelected ? `1px solid ${cfg.color}30` : '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <span style={{ color: cfg.color }}>{cfg.icon}</span>
      <span className="truncate">{getShortName(agent.file.name)}</span>
    </button>
  );
}

/* ── Main AgentsPage ── */

interface AgentsPageProps {
  scope: Scope;
}

export function AgentsPage({ scope }: AgentsPageProps) {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await fetchFileTree(scope);
      const agentsDir = result.tree.find((n) => n.name === 'agents');
      const agentFiles =
        agentsDir?.children?.filter((f) => f.type === 'file' && f.name.endsWith('.md')) ?? [];

      const agentInfos: AgentInfo[] = agentFiles.map((file) => ({
        name: getShortName(file.name),
        file,
        category: categorizeAgent(file.name),
      }));

      // Sort: orchestrators first, then specialists, then utilities
      const order: Record<AgentCategory, number> = { orchestrator: 0, specialist: 1, utility: 2 };
      agentInfos.sort((a, b) => order[a.category] - order[b.category] || a.name.localeCompare(b.name));

      setAgents(agentInfos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleAgentClick = async (agent: AgentInfo) => {
    setSelectedAgent(agent);
    try {
      const result = await fetchFile(agent.file.path);
      setContent(result.content);
    } catch {
      setContent('# Error\n\nCould not load file.');
    }
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    setIsSaving(true);
    try {
      await saveFile(selectedAgent.file.path, content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-slate-500 animate-pulse">Loading agents...</div>
      </div>
    );
  }

  const orchestrators = agents.filter((a) => a.category === 'orchestrator');
  const specialists = agents.filter((a) => a.category === 'specialist');
  const utilities = agents.filter((a) => a.category === 'utility');

  const agentGroups: Array<{ label: string; items: AgentInfo[] }> = [
    { label: 'Orchestrators', items: orchestrators },
    { label: 'Specialists', items: specialists },
    { label: 'Utilities', items: utilities },
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Section 1: Workflow Diagram */}
      <WorkflowDiagram
        agents={agents}
        selectedAgent={selectedAgent}
        onAgentClick={handleAgentClick}
      />

      {error && (
        <div
          className="text-xs text-red-400 px-3 py-2 rounded-lg shrink-0"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Section 2+3: List + Editor */}
      <div className="flex flex-1 overflow-hidden gap-3 min-h-0">
        {/* Section 2: Agent list (grouped) */}
        <div
          className="w-52 shrink-0 flex flex-col gap-2 overflow-auto rounded-xl p-3"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {agentGroups.map(
            ({ label, items }) =>
              items.length > 0 && (
                <div key={label} className="flex flex-col gap-1">
                  <div
                    className="text-[10px] font-semibold uppercase tracking-widest px-1 py-0.5"
                    style={{ color: '#4a5568' }}
                  >
                    {label}
                  </div>
                  {items.map((agent) => (
                    <AgentListItem
                      key={agent.file.path}
                      agent={agent}
                      isSelected={selectedAgent?.file.path === agent.file.path}
                      onClick={handleAgentClick}
                    />
                  ))}
                </div>
              )
          )}
          {agents.length === 0 && (
            <div className="text-xs text-slate-600 px-2">No agents found</div>
          )}
        </div>

        {/* Section 3: Editor */}
        <div
          className="flex-1 rounded-xl overflow-hidden"
          style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {selectedAgent ? (
            <MarkdownEditor
              key={selectedAgent.file.path}
              content={content}
              filePath={selectedAgent.file.path}
              onChange={setContent}
              onSave={handleSave}
              isSaving={isSaving}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600 text-sm">
              Select an agent to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
