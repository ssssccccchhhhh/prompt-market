'use client';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExternalLink, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { RegistryPackage } from '@/app/market/types';

const TOOL_LABELS: Record<string, string> = {
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
  codex: 'Codex',
  opencode: 'OpenCode',
  antigravity: 'Antigravity',
};

interface TokenInputProps {
  packages: RegistryPackage[];
  selectedTools: string[];
  selectedMcps: string[];
  envValues: Record<string, Record<string, string>>;
  onChange: (envValues: Record<string, Record<string, string>>) => void;
}

export default function TokenInput({
  packages,
  selectedTools,
  selectedMcps,
  envValues,
  onChange,
}: TokenInputProps) {
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  const mcpPackages = packages.filter(
    (pkg) => pkg.type === 'mcp' && selectedMcps.includes(pkg.id)
  );

  const toggleVisibility = (fieldKey: string) => {
    setVisibleFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldKey)) {
        next.delete(fieldKey);
      } else {
        next.add(fieldKey);
      }
      return next;
    });
  };

  const handleChange = (mcpId: string, fieldKey: string, value: string) => {
    onChange({
      ...envValues,
      [mcpId]: {
        ...envValues[mcpId],
        [fieldKey]: value,
      },
    });
  };

  if (mcpPackages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-50">토큰 입력</h2>
          <p className="mt-2 text-sm text-neutral-400">
            MCP 서버를 선택하지 않았습니다. 다음 단계로 진행하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-neutral-50">
          토큰 및 환경 변수를 입력하세요
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          입력한 값은 브라우저에만 저장되며, 서버로 전송되지 않습니다
        </p>
      </div>

      <div className="space-y-6">
        {mcpPackages.map((mcp) => (
          <div
            key={mcp.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mcp.icon}</span>
                <span className="font-medium text-neutral-100">{mcp.name}</span>
                {mcp.tokenType && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0',
                      mcp.tokenType === 'personal'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                    )}
                  >
                    {mcp.tokenType === 'personal' ? '개인 토큰' : '공용 토큰'}
                  </Badge>
                )}
              </div>
              {mcp.tokenGuide && (
                <a
                  href={mcp.tokenGuide}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-neutral-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  토큰 발급 가이드
                </a>
              )}
            </div>

            {(() => {
              const unsupported = selectedTools.filter(
                (tool) => !mcp.compatibility[tool]
              );
              if (unsupported.length === 0) return null;
              return (
                <div className="mb-4 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-400">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>
                    {unsupported.map((t) => TOOL_LABELS[t] ?? t).join(', ')}{' '}
                    미지원 — 해당 도구의 설정에는 포함되지 않습니다
                  </span>
                </div>
              );
            })()}

            <div className="space-y-3">
              {(mcp.envFields ?? []).map((field) => {
                const isReadonly = field.editable === false;
                const isSensitive = field.sensitive === true;
                const fieldUniqueKey = `${mcp.id}.${field.key}`;
                const isVisible = visibleFields.has(fieldUniqueKey);
                const currentValue =
                  envValues[mcp.id]?.[field.key] ?? field.default ?? '';

                return (
                  <div key={field.key}>
                    <label className="mb-1.5 flex items-center gap-2 text-sm text-neutral-300">
                      <span className="font-mono text-xs text-neutral-500">
                        {field.key}
                      </span>
                      {isReadonly && (
                        <span className="text-[10px] text-neutral-600">
                          (읽기 전용)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        type={isSensitive && !isVisible ? 'password' : 'text'}
                        value={currentValue}
                        onChange={(e) =>
                          handleChange(mcp.id, field.key, e.target.value)
                        }
                        placeholder={field.placeholder ?? ''}
                        readOnly={isReadonly}
                        className={cn(
                          'border-neutral-700 bg-neutral-800/50 text-neutral-100 placeholder:text-neutral-600',
                          isReadonly && 'opacity-60 cursor-not-allowed',
                          isSensitive && 'pr-10'
                        )}
                      />
                      {isSensitive && (
                        <button
                          type="button"
                          onClick={() => toggleVisibility(fieldUniqueKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                        >
                          {isVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
