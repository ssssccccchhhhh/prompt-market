'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import PackageTable from './PackageTable';
import PackageCard from './PackageCard';
import type { RegistryPackage, FilterType, SortKey } from '../types';

interface MarketContentProps {
  packages: RegistryPackage[];
}

export default function MarketContent({ packages }: MarketContentProps) {
  const searchParams = useSearchParams();

  const query = searchParams.get('q')?.toLowerCase() ?? '';
  const filterType = (searchParams.get('type') ?? 'all') as FilterType;
  const sortKey = (searchParams.get('sort') ?? 'installs') as SortKey;
  const filterTool = searchParams.get('tool') ?? '';

  const filtered = useMemo(() => {
    let result = [...packages];

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((pkg) => pkg.type === filterType);
    }

    // Filter by tool compatibility
    if (filterTool) {
      result = result.filter((pkg) => pkg.compatibility[filterTool]);
    }

    // Filter by search query
    if (query) {
      result = result.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(query) ||
          pkg.description.toLowerCase().includes(query) ||
          pkg.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortKey) {
        case 'installs':
          return b.stats.installs - a.stats.installs;
        case 'stars':
          return b.stats.stars - a.stats.stars;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [packages, filterType, filterTool, query, sortKey]);

  return (
    <>
      <PackageTable packages={filtered} />
      <PackageCard packages={filtered} />
    </>
  );
}
