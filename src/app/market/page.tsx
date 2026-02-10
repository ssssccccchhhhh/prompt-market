import { Suspense } from 'react';
import Link from 'next/link';
import registry from '@/../registry.json';
import SearchBox from './components/SearchBox';
import ToolFilter from './components/ToolFilter';
import FilterBar from './components/FilterBar';
import MarketContent from './components/MarketContent';
import type { RegistryPackage } from './types';
import { ArrowLeft, Package } from 'lucide-react';

const packages = registry.packages as RegistryPackage[];

export const metadata = {
  title: '마켓플레이스 | Jetsong',
  description: 'MCP 서버와 Skill을 검색하고 설치하세요',
};

export default function MarketPage() {
  return (
    <div className="dark min-h-screen bg-neutral-950 text-neutral-50 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">홈</span>
          </Link>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-neutral-400" />
            <h1 className="text-lg font-bold">마켓플레이스</h1>
          </div>
          <div className="w-12" /> {/* spacer for centering */}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            AI Agent를 위한
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              MCP 서버 &amp; Skills
            </span>
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            {packages.length}개의 패키지가 등록되어 있습니다
          </p>
        </div>

        {/* Search + Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex justify-center">
            <Suspense>
              <SearchBox />
            </Suspense>
          </div>
          <Suspense>
            <ToolFilter />
          </Suspense>
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        {/* Leaderboard */}
        <Suspense
          fallback={
            <div className="flex justify-center py-16 text-neutral-500">
              불러오는 중...
            </div>
          }
        >
          <MarketContent packages={packages} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/50 py-6 text-center text-xs text-neutral-600">
        Jetsong Toy &mdash; MCP &amp; Skill Marketplace
      </footer>
    </div>
  );
}
