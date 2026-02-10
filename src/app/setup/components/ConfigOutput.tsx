'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, FolderOpen } from 'lucide-react';
import { generateJsonConfig, generateTomlConfig } from '../lib/config-generators';
import type { RegistryPackage } from '@/app/market/types';

interface ConfigOutputProps {
  packages: RegistryPackage[];
  selectedTools: string[];
  selectedMcps: string[];
  envValues: Record<string, Record<string, string>>;
}

const JSON_TOOLS = ['claude-code', 'cursor', 'opencode', 'antigravity'];
const JSON_TOOL_LABELS: Record<string, string> = {
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
  opencode: 'OpenCode',
  antigravity: 'Antigravity',
};

export default function ConfigOutput({
  packages,
  selectedTools,
  selectedMcps,
  envValues,
}: ConfigOutputProps) {
  const hasJsonTools = selectedTools.some((t) => JSON_TOOLS.includes(t));
  const hasCodex = selectedTools.includes('codex');

  type TabId = 'json' | 'toml';
  const tabs = useMemo(() => {
    const result: { id: TabId; label: string }[] = [];
    if (hasJsonTools) {
      const names = selectedTools
        .filter((t) => JSON_TOOLS.includes(t))
        .map((t) => JSON_TOOL_LABELS[t])
        .join(' / ');
      result.push({ id: 'json', label: names });
    }
    if (hasCodex) {
      result.push({ id: 'toml', label: 'Codex' });
    }
    return result;
  }, [selectedTools, hasJsonTools, hasCodex]);

  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]?.id ?? 'json');
  const [copied, setCopied] = useState(false);
  const [projectRoot, setProjectRoot] = useState('');

  const mcpPackages = packages.filter(
    (pkg) => pkg.type === 'mcp' && selectedMcps.includes(pkg.id)
  );

  const effectiveRoot = projectRoot.trim() || '{PROJECT_ROOT}';

  const getConfig = useCallback(() => {
    if (mcpPackages.length === 0) return '// MCP 서버가 선택되지 않았습니다';
    if (activeTab === 'toml') {
      return generateTomlConfig(mcpPackages, envValues, effectiveRoot);
    }
    return generateJsonConfig(mcpPackages, envValues, effectiveRoot);
  }, [activeTab, mcpPackages, envValues, effectiveRoot]);

  const handleCopy = async () => {
    const config = getConfig();
    try {
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-100">
        MCP 설정 파일
      </h3>

      {/* Tab bar — only show if both JSON and TOML tabs exist */}
      {tabs.length > 1 && (
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/50 p-1">
          {tabs.map((tab) => (
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
                {tab.id}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Single tab label when only one format */}
      {tabs.length === 1 && (
        <p className="text-sm text-neutral-400">
          {tabs[0].label}
          <span className="ml-1.5 text-xs text-neutral-500 uppercase">
            {tabs[0].id}
          </span>
        </p>
      )}

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

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs text-neutral-400">
          <FolderOpen className="h-3.5 w-3.5" />
          프로젝트 루트 경로
        </label>
        <Input
          type="text"
          value={projectRoot}
          onChange={(e) => setProjectRoot(e.target.value)}
          placeholder="/home/user/workspace/my-project"
          className="border-neutral-700 bg-neutral-800/50 font-mono text-sm text-neutral-100 placeholder:text-neutral-600"
        />
        <p className="text-[11px] text-neutral-500">
          {projectRoot.trim()
            ? '입력한 경로가 설정에 반영됩니다.'
            : '경로를 입력하면 {PROJECT_ROOT} 가 자동으로 치환됩니다.'}
        </p>
      </div>
    </div>
  );
}
