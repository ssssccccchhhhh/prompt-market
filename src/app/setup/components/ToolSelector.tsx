'use client';

import { cn } from '@/lib/utils';
import {
  Terminal,
  MousePointerClick,
  Code2,
  Braces,
  Rocket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Tool {
  id: string;
  label: string;
  icon: LucideIcon;
}

const TOOLS: Tool[] = [
  { id: 'claude-code', label: 'Claude Code', icon: Terminal },
  { id: 'cursor', label: 'Cursor', icon: MousePointerClick },
  { id: 'codex', label: 'Codex', icon: Code2 },
  { id: 'opencode', label: 'OpenCode', icon: Braces },
  { id: 'antigravity', label: 'Antigravity', icon: Rocket },
];

interface ToolSelectorProps {
  selected: string[];
  onChange: (tools: string[]) => void;
}

export default function ToolSelector({ selected, onChange }: ToolSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-neutral-50">
          사용할 AI 코딩 도구를 선택하세요
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          여러 개를 선택할 수 있습니다
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TOOLS.map((tool) => {
          const isSelected = selected.includes(tool.id);
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggle(tool.id)}
              className={cn(
                'flex flex-col items-center gap-3 rounded-xl border p-6 transition-all',
                'hover:bg-neutral-800/50',
                isSelected
                  ? 'border-orange-500/60 bg-orange-500/10 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                  : 'border-neutral-800 bg-neutral-900/50'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg',
                  isSelected
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-neutral-800 text-neutral-400'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-orange-300' : 'text-neutral-300'
                )}
              >
                {tool.label}
              </span>
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                  isSelected
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-neutral-600 bg-transparent'
                )}
              >
                {isSelected && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
