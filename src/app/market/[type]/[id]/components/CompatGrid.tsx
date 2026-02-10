import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import type { CompatibilityMap } from '@/app/market/types';

const TOOLS: { key: string; name: string; color: string }[] = [
  { key: 'claude-code', name: 'Claude Code', color: 'text-orange-400' },
  { key: 'cursor', name: 'Cursor', color: 'text-blue-400' },
  { key: 'codex', name: 'Codex', color: 'text-green-400' },
  { key: 'opencode', name: 'OpenCode', color: 'text-purple-400' },
  { key: 'antigravity', name: 'Antigravity', color: 'text-red-400' },
];

interface CompatGridProps {
  compatibility: CompatibilityMap;
}

export default function CompatGrid({ compatibility }: CompatGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {TOOLS.map((tool) => {
        const supported = compatibility[tool.key];
        return (
          <div
            key={tool.key}
            className={cn(
              'flex items-center gap-2 rounded-lg border p-3 transition-colors',
              supported
                ? 'border-neutral-800 bg-neutral-900'
                : 'border-neutral-800/50 bg-neutral-950'
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
                supported ? 'text-neutral-300' : 'text-neutral-600'
              )}
            >
              {tool.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
