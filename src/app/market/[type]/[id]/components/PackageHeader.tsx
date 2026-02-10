import { Badge } from '@/components/ui/badge';
import { Download, Star, User } from 'lucide-react';
import type { RegistryPackage } from '../../../types';

interface PackageHeaderProps {
  pkg: RegistryPackage;
}

export default function PackageHeader({ pkg }: PackageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      {/* Icon */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 text-4xl">
        {pkg.icon}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{pkg.name}</h1>
          <Badge
            variant="outline"
            className={
              pkg.type === 'mcp'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
            }
          >
            {pkg.type === 'mcp' ? 'MCP Server' : 'Skill'}
          </Badge>
          <Badge variant="outline" className="border-neutral-700 text-neutral-400">
            v{pkg.version}
          </Badge>
        </div>

        <p className="mt-2 text-neutral-400">{pkg.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {pkg.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            {pkg.stats.installs.toLocaleString()} 설치
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" />
            {pkg.stats.stars.toLocaleString()} 별점
          </span>
        </div>
      </div>
    </div>
  );
}
