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
    <div className="sticky top-14 z-40 -mx-4 border-b border-neutral-800/50 bg-neutral-950/90 px-4 py-2.5 backdrop-blur-md">
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-neutral-500">Agent:</span>
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
        <button
          type="button"
          onClick={() => currentTool && router.push(`/setup?tool=${currentTool}`)}
          disabled={!currentTool}
          className={cn(
            'ml-2 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-all',
            currentTool
              ? 'border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
              : 'cursor-not-allowed border-neutral-700/30 bg-neutral-800/30 text-neutral-600'
          )}
          title={currentTool ? '선택한 Agent로 셋업 시작' : 'Agent를 먼저 선택하세요'}
        >
          <Settings className="h-3 w-3" />
          셋업
        </button>
      </div>
    </div>
  );
}
