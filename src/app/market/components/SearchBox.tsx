'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const updateQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      router.replace(`/market?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      <Input
        type="text"
        placeholder="패키지 검색..."
        defaultValue={query}
        onChange={(e) => updateQuery(e.target.value)}
        className="h-10 bg-neutral-900 border-neutral-800 pl-9 text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-neutral-700"
      />
    </div>
  );
}
