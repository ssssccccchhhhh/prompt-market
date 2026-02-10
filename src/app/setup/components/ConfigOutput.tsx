'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { generateJsonConfig, generateTomlConfig } from '../lib/config-generators';
import type { RegistryPackage } from '@/app/market/types';

interface ConfigOutputProps {
  packages: RegistryPackage[];
  selectedTools: string[];
  selectedMcps: string[];
  envValues: Record<string, Record<string, string>>;
}

interface ToolTab {
  id: string;
  label: string;
  format: 'json' | 'toml';
}

const TOOL_TABS: ToolTab[] = [
  { id: 'claude-code', label: 'Claude Code', format: 'json' },
  { id: 'cursor', label: 'Cursor', format: 'json' },
  { id: 'codex', label: 'Codex', format: 'toml' },
  { id: 'opencode', label: 'OpenCode', format: 'json' },
  { id: 'antigravity', label: 'Antigravity', format: 'json' },
];

export default function ConfigOutput({
  packages,
  selectedTools,
  selectedMcps,
  envValues,
}: ConfigOutputProps) {
  const visibleTabs = TOOL_TABS.filter((tab) => selectedTools.includes(tab.id));
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id ?? '');
  const [copied, setCopied] = useState(false);

  const mcpPackages = packages.filter(
    (pkg) => pkg.type === 'mcp' && selectedMcps.includes(pkg.id)
  );

  const activeToolTab = TOOL_TABS.find((t) => t.id === activeTab);

  const getConfig = useCallback(() => {
    if (!activeToolTab) return '';
    if (mcpPackages.length === 0) return '// MCP 서버가 선택되지 않았습니다';

    if (activeToolTab.format === 'toml') {
      return generateTomlConfig(mcpPackages, envValues);
    }
    return generateJsonConfig(mcpPackages, envValues);
  }, [activeToolTab, mcpPackages, envValues]);

  const handleCopy = async () => {
    const config = getConfig();
    try {
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = config;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-100">
        MCP 설정 파일
      </h3>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/50 p-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setCopied(false);
            }}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-neutral-700 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-200'
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] text-neutral-500 uppercase">
              {tab.format}
            </span>
          </button>
        ))}
      </div>

      {/* Config block */}
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <code className="text-sm text-neutral-300">{getConfig()}</code>
        </pre>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute right-2 top-2 h-8 gap-1.5 text-neutral-400 hover:text-neutral-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400">복사됨</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">복사</span>
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-neutral-500">
        <code className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-400">
          {'{PROJECT_ROOT}'}
        </code>
        를 실제 프로젝트 루트 경로로 교체하세요.
      </p>
    </div>
  );
}
