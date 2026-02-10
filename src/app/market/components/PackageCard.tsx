'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Star } from 'lucide-react';
import CompatBadge from './CompatBadge';
import type { RegistryPackage } from '../types';

interface PackageCardProps {
  packages: RegistryPackage[];
}

export default function PackageCard({ packages }: PackageCardProps) {
  const router = useRouter();

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500 md:hidden">
        <p className="text-lg">검색 결과가 없습니다</p>
        <p className="mt-1 text-sm">다른 검색어를 시도해보세요</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:hidden">
      {packages.map((pkg, index) => (
        <Card
          key={pkg.id}
          className="cursor-pointer border-neutral-800 bg-neutral-900/50 transition-colors hover:bg-neutral-900 hover:border-neutral-700"
          onClick={() => router.push(`/market/${pkg.type}/${pkg.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-neutral-600 font-mono text-xs w-5 shrink-0">
                  {index + 1}
                </span>
                <span className="text-2xl shrink-0">{pkg.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-100">{pkg.name}</span>
                    <Badge
                      variant="outline"
                      className={
                        pkg.type === 'mcp'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0'
                          : 'border-sky-500/30 bg-sky-500/10 text-sky-400 text-[10px] px-1.5 py-0'
                      }
                    >
                      {pkg.type === 'mcp' ? 'MCP' : 'Skill'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {pkg.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <CompatBadge compatibility={pkg.compatibility} />
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {pkg.stats.installs.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {pkg.stats.stars.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
