'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';
import { TOOL_CONFIG } from './CompatBadge';

export default function ToolFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTool = searchParams.get('tool') ?? '';

  const updateTool = useCallback(
    (tool: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tool === '') {
        params.delete('tool');
      } else {
        params.set('tool', tool);
      }
      router.replace(`/market?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-xs text-neutral-500">내 도구:</span>
      <div className="flex gap-1">
        {Object.entries(TOOL_CONFIG).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => updateTool(currentTool === key ? '' : key)}
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold transition-all',
              currentTool === key
                ? config.color
                : 'border-neutral-700/50 bg-neutral-800/50 text-neutral-500 hover:text-neutral-300'
            )}
            title={`${config.fullName} 호환 패키지만 보기`}
          >
            {config.fullName}
          </button>
        ))}
      </div>
      {currentTool && (
        <button
          type="button"
          onClick={() => router.push(`/setup?tool=${currentTool}`)}
          className="ml-2 inline-flex items-center gap-1 rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-400 transition-all hover:bg-orange-500/20"
          title="선택한 도구로 셋업 시작"
        >
          <Settings className="h-3 w-3" />
          셋업
        </button>
      )}
    </div>
  );
}
