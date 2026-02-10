'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import registryData from '@/../registry.json';
import SetupStepper from './components/SetupStepper';
import type { RegistryPackage } from '@/app/market/types';
import { ArrowLeft, Settings } from 'lucide-react';

const packages = registryData.packages as RegistryPackage[];

function SetupContent() {
  const searchParams = useSearchParams();
  const initialTool = searchParams.get('tool') ?? undefined;

  return <SetupStepper packages={packages} initialTool={initialTool} />;
}

export default function SetupPage() {
  return (
    <div className="dark min-h-screen bg-neutral-950 text-neutral-50 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">홈</span>
          </Link>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-neutral-400" />
            <h1 className="text-lg font-bold">셋업 위자드</h1>
          </div>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Suspense>
          <SetupContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/50 py-6 text-center text-xs text-neutral-600">
        Jetsong Toy &mdash; MCP &amp; Skill Setup Wizard
      </footer>
    </div>
  );
}
