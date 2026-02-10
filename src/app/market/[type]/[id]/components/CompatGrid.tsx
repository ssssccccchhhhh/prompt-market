'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import type { CompatibilityMap } from '@/app/market/types';

const TOOLS: { key: string; name: string; color: string; selectedBg: string }[] = [
  { key: 'claude-code', name: 'Claude Code', color: 'text-orange-400', selectedBg: 'border-orange-500/50 bg-orange-500/10 ring-1 ring-orange-500/30' },
  { key: 'cursor', name: 'Cursor', color: 'text-blue-400', selectedBg: 'border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/30' },
  { key: 'codex', name: 'Codex', color: 'text-green-400', selectedBg: 'border-green-500/50 bg-green-500/10 ring-1 ring-green-500/30' },
  { key: 'opencode', name: 'OpenCode', color: 'text-purple-400', selectedBg: 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' },
  { key: 'antigravity', name: 'Antigravity', color: 'text-red-400', selectedBg: 'border-red-500/50 bg-red-500/10 ring-1 ring-red-500/30' },
];

interface CompatGridProps {
  compatibility: CompatibilityMap;
}

export default function CompatGrid({ compatibility }: CompatGridProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    if (!compatibility[key]) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {TOOLS.map((tool) => {
        const supported = compatibility[tool.key];
        const isSelected = selected.has(tool.key);
        return (
          <button
            key={tool.key}
            type="button"
            disabled={!supported}
            onClick={() => toggle(tool.key)}
            className={cn(
              'flex items-center gap-2 rounded-lg border p-3 transition-all',
              !supported
                ? 'cursor-not-allowed border-neutral-800/50 bg-neutral-950'
                : isSelected
                  ? tool.selectedBg
                  : 'cursor-pointer border-neutral-800 bg-neutral-900 hover:border-neutral-700'
            )}
          >
            {supported ? (
              <Check className={cn('h-4 w-4 shrink-0', tool.color)} />
            ) : (
              <X className="h-4 w-4 shrink-0 text-neutral-700" />
            )}
            <span
              className={cn(
                'text-sm',
                !supported
                  ? 'text-neutral-600'
                  : isSelected
                    ? 'text-neutral-100'
                    : 'text-neutral-300'
              )}
            >
              {tool.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
