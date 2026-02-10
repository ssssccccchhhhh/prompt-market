'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Star } from 'lucide-react';
import CompatBadge from './CompatBadge';
import type { RegistryPackage } from '../types';

interface PackageTableProps {
  packages: RegistryPackage[];
}

export default function PackageTable({ packages }: PackageTableProps) {
  const router = useRouter();

  return (
    <div className="hidden md:block">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="border-neutral-800 hover:bg-transparent">
            <TableHead className="w-12 text-neutral-500">#</TableHead>
            <TableHead className="text-neutral-500">패키지</TableHead>
            <TableHead className="w-20 text-neutral-500">유형</TableHead>
            <TableHead className="w-44 text-neutral-500">호환성</TableHead>
            <TableHead className="w-16 text-right text-neutral-500">
              <Download className="ml-auto h-4 w-4" />
            </TableHead>
            <TableHead className="w-16 text-right text-neutral-500">
              <Star className="ml-auto h-4 w-4" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg, index) => (
            <TableRow
              key={pkg.id}
              className="cursor-pointer border-neutral-800/50 transition-colors hover:bg-neutral-900/50"
              onClick={() => router.push(`/market/${pkg.type}/${pkg.id}`)}
            >
              <TableCell className="font-mono text-sm text-neutral-600">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{pkg.icon}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-neutral-100">{pkg.name}</div>
                    <div className="truncate text-xs text-neutral-500">
                      {pkg.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    pkg.type === 'mcp'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                  }
                >
                  {pkg.type === 'mcp' ? 'MCP' : 'Skill'}
                </Badge>
              </TableCell>
              <TableCell>
                <CompatBadge compatibility={pkg.compatibility} />
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-neutral-400">
                {pkg.stats.installs.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-neutral-400">
                {pkg.stats.stars.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {packages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
          <p className="text-lg">검색 결과가 없습니다</p>
          <p className="mt-1 text-sm">다른 검색어를 시도해보세요</p>
        </div>
      )}
    </div>
  );
}
