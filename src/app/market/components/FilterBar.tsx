'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FilterType, SortKey } from '../types';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'skill', label: 'Skills' },
  { value: 'mcp', label: 'MCP' },
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'installs', label: '설치순' },
  { value: 'stars', label: '별점순' },
  { value: 'name', label: '이름순' },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = (searchParams.get('type') ?? 'all') as FilterType;
  const currentSort = (searchParams.get('sort') ?? 'installs') as SortKey;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' && key === 'type') {
        params.delete('type');
      } else if (value === 'installs' && key === 'sort') {
        params.delete('sort');
      } else {
        params.set(key, value);
      }
      router.replace(`/market?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Type filter */}
      <div className="flex gap-1 rounded-lg bg-neutral-900 p-1">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant="ghost"
            size="sm"
            onClick={() => updateParam('type', f.value)}
            className={cn(
              'h-8 rounded-md px-3 text-xs font-medium transition-all',
              currentType === f.value
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-transparent'
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-1 rounded-lg bg-neutral-900 p-1">
        {SORTS.map((s) => (
          <Button
            key={s.value}
            variant="ghost"
            size="sm"
            onClick={() => updateParam('sort', s.value)}
            className={cn(
              'h-8 rounded-md px-3 text-xs font-medium transition-all',
              currentSort === s.value
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-transparent'
            )}
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
