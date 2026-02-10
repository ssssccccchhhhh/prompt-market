'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Terminal } from 'lucide-react';

interface InstallCommandProps {
  packageId: string;
}

export default function InstallCommand({ packageId }: InstallCommandProps) {
  const [copied, setCopied] = useState(false);
  const command = `npx jetsong install ${packageId}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = command;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [command]);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-3">
      <Terminal className="h-4 w-4 shrink-0 text-neutral-500" />
      <code className="flex-1 overflow-x-auto text-sm text-neutral-300 font-[family-name:var(--font-geist-mono)]">
        {command}
      </code>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-8 w-8 shrink-0 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
