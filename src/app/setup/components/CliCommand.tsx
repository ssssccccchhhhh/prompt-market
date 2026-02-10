'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Terminal } from 'lucide-react';

interface CliCommandProps {
  selectedSkills: string[];
}

export default function CliCommand({ selectedSkills }: CliCommandProps) {
  const [copied, setCopied] = useState(false);

  if (selectedSkills.length === 0) {
    return null;
  }

  const command = `npx jetsong install ${selectedSkills.join(' ')} --project <프로젝트_경로>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = command;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-100">
        Skill 설치 명령어
      </h3>

      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <Terminal className="h-4 w-4 shrink-0 text-neutral-500" />
          <code className="text-sm text-neutral-300">{command}</code>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 gap-1.5 text-neutral-400 hover:text-neutral-100"
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
          {'<프로젝트_경로>'}
        </code>
        를 실제 프로젝트 경로로 교체하세요.
      </p>
    </div>
  );
}
