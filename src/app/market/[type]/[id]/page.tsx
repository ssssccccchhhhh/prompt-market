import { notFound } from 'next/navigation';
import Link from 'next/link';
import registry from '@/../registry.json';
import type { RegistryPackage } from '../../types';
import PackageHeader from './components/PackageHeader';
import CompatGrid from './components/CompatGrid';
import InstallCommand from './components/InstallCommand';
import McpEnvSetup from './components/McpEnvSetup';
import { ArrowLeft } from 'lucide-react';

const packages = registry.packages as RegistryPackage[];

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export async function generateStaticParams() {
  return packages.map((pkg) => ({
    type: pkg.type,
    id: pkg.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { type, id } = await params;
  const pkg = packages.find((p) => p.type === type && p.id === id);
  if (!pkg) return { title: '패키지를 찾을 수 없습니다' };
  return {
    title: `${pkg.name} | Jetsong 마켓플레이스`,
    description: pkg.description,
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { type, id } = await params;
  const pkg = packages.find((p) => p.type === type && p.id === id);

  if (!pkg) {
    notFound();
  }

  return (
    <div className="dark min-h-screen bg-neutral-950 text-neutral-50 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link
            href="/market"
            className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" />
            마켓플레이스
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Package Header */}
        <PackageHeader pkg={pkg} />

        {/* Install Command */}
        <section className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            설치
          </h3>
          <InstallCommand packageId={pkg.id} />
        </section>

        {/* Compatibility */}
        <section className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            호환성
          </h3>
          <CompatGrid compatibility={pkg.compatibility} />
        </section>

        {/* MCP Env Setup (MCP only) */}
        {pkg.type === 'mcp' && pkg.envFields && pkg.envFields.length > 0 && (
          <section className="mt-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
              환경 설정
            </h3>
            <McpEnvSetup
              envFields={pkg.envFields}
              tokenType={pkg.tokenType}
              tokenGuide={pkg.tokenGuide}
            />
          </section>
        )}

        {/* Changelog */}
        {pkg.changelog && pkg.changelog.length > 0 && (
          <section className="mt-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Changelog
            </h3>
            <div className="space-y-4">
              {pkg.changelog.map((entry) => (
                <div key={entry.version} className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-neutral-200">
                      v{entry.version}
                    </span>
                    {entry.date && (
                      <span className="text-xs text-neutral-500">({entry.date})</span>
                    )}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-600" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {pkg.tags.length > 0 && (
          <section className="mt-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
              태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {pkg.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/50 py-6 text-center text-xs text-neutral-600">
        Jetsong Toy &mdash; MCP &amp; Skill Marketplace
      </footer>
    </div>
  );
}
