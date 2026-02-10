'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { RegistryPackage } from '@/app/market/types';
import { ExternalLink } from 'lucide-react';

interface McpSelectorProps {
  packages: RegistryPackage[];
  selectedTools: string[];
  selected: string[];
  onChange: (mcps: string[]) => void;
}

export default function McpSelector({
  packages,
  selectedTools,
  selected,
  onChange,
}: McpSelectorProps) {
  const mcpPackages = packages.filter((pkg) => {
    if (pkg.type !== 'mcp') return false;
    // Show only MCPs compatible with at least one selected tool
    return selectedTools.some((tool) => pkg.compatibility[tool]);
  });

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((m) => m !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-neutral-50">
          설치할 MCP 서버를 선택하세요
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          선택한 도구와 호환되는 MCP 서버만 표시됩니다
        </p>
      </div>

      {mcpPackages.length === 0 ? (
        <p className="py-8 text-center text-neutral-500">
          호환되는 MCP 서버가 없습니다
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mcpPackages.map((pkg) => {
            const isSelected = selected.includes(pkg.id);
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => toggle(pkg.id)}
                className={cn(
                  'flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all',
                  'hover:bg-neutral-800/50',
                  isSelected
                    ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.12)]'
                    : 'border-neutral-800 bg-neutral-900/50'
                )}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pkg.icon}</span>
                    <div>
                      <span className="font-medium text-neutral-100">
                        {pkg.name}
                      </span>
                      <span className="ml-2 text-xs text-neutral-500">
                        v{pkg.version}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500'
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
                </div>

                <p className="text-sm text-neutral-400">{pkg.description}</p>

                <div className="flex flex-wrap items-center gap-2">
                  {pkg.tokenType && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] px-1.5 py-0',
                        pkg.tokenType === 'personal'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                      )}
                    >
                      {pkg.tokenType === 'personal' ? '개인' : '공용'}
                    </Badge>
                  )}
                  {pkg.tokenGuide && (
                    <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                      <ExternalLink className="h-3 w-3" />
                      토큰 가이드
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
