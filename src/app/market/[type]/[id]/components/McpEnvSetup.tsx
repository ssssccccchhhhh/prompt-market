'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, KeyRound, Shield } from 'lucide-react';
import type { EnvField } from '../../../types';

interface McpEnvSetupProps {
  envFields: EnvField[];
  tokenType?: string;
  tokenGuide?: string;
}

export default function McpEnvSetup({
  envFields,
  tokenType,
  tokenGuide,
}: McpEnvSetupProps) {
  return (
    <div className="space-y-4">
      {/* Token type indicator */}
      {tokenType && (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Shield className="h-4 w-4" />
          <span>
            토큰 유형:{' '}
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-400"
            >
              {tokenType === 'personal' ? '개인 토큰' : '공유 토큰'}
            </Badge>
          </span>
        </div>
      )}

      {/* Env fields table */}
      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-500">변수명</TableHead>
              <TableHead className="text-neutral-500">기본값</TableHead>
              <TableHead className="text-neutral-500 text-center w-20">보안</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {envFields.map((field) => (
              <TableRow key={field.key} className="border-neutral-800/50">
                <TableCell className="font-mono text-sm text-neutral-300">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5 text-neutral-600" />
                    {field.key}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-neutral-500">
                  {field.default ?? field.placeholder ?? (
                    <span className="italic text-neutral-700">
                      직접 입력
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {field.sensitive ? (
                    <Badge
                      variant="outline"
                      className="border-red-500/30 bg-red-500/10 text-red-400 text-[10px]"
                    >
                      민감
                    </Badge>
                  ) : (
                    <span className="text-xs text-neutral-600">&mdash;</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Token guide link */}
      {tokenGuide && (
        <a
          href={tokenGuide}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          토큰 발급 가이드
        </a>
      )}

      {/* CSR notice */}
      <p className="text-xs text-neutral-600">
        * 모든 토큰은 브라우저에서만 처리되며 서버로 전송되지 않습니다.
      </p>
    </div>
  );
}
