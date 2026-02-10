'use client';

import { cn } from '@/lib/utils';

const TOOL_CONFIG: Record<string, { label: string; fullName: string; color: string }> = {
  'claude-code': { label: 'CC', fullName: 'Claude Code', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  cursor: { label: 'Cu', fullName: 'Cursor', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  codex: { label: 'Cx', fullName: 'Codex', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  opencode: { label: 'OC', fullName: 'OpenCode', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  antigravity: { label: 'AG', fullName: 'Antigravity', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

interface CompatBadgeProps {
  compatibility: Record<string, boolean>;
  showAll?: boolean;
}

export default function CompatBadge({ compatibility, showAll = false }: CompatBadgeProps) {
  const tools = Object.entries(TOOL_CONFIG);

  return (
    <div className="flex flex-wrap gap-1">
      {tools.map(([key, config]) => {
        const supported = compatibility[key];
        if (!showAll && !supported) return null;

        return (
          <span
            key={key}
            className={cn(
              'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none transition-colors',
              supported
                ? config.color
                : 'bg-neutral-800/50 text-neutral-600 border-neutral-700/50'
            )}
            title={`${config.fullName} ${supported ? '지원' : '미지원'}`}
          >
            {config.label}
          </span>
        );
      })}
    </div>
  );
}

export { TOOL_CONFIG };
