import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface EnvField {
  key: string;
  default?: string;
  placeholder?: string;
  sensitive?: boolean;
  editable?: boolean;
}

export interface PackageStats {
  installs: number;
  stars: number;
}

export interface Compatibility {
  "claude-code": boolean;
  cursor: boolean;
  codex: boolean;
  opencode: boolean;
  antigravity: boolean;
}

export interface RegistryPackage {
  id: string;
  type: "mcp" | "skill";
  name: string;
  description: string;
  icon: string;
  version: string;
  author: string;
  tags: string[];
  compatibility: Compatibility;
  envFields?: EnvField[];
  tokenType?: string;
  tokenGuide?: string;
  stats: PackageStats;
  createdAt: string;
  updatedAt: string;
  path: string;
}

export interface Registry {
  generated: string;
  packages: RegistryPackage[];
}

/**
 * 프로젝트 루트 경로를 반환합니다.
 * dist/lib/ 에서 실행되므로 3단계 위로 올라갑니다.
 */
export function getProjectRoot(): string {
  return resolve(__dirname, "..", "..", "..");
}

/**
 * registry.json을 읽어서 Registry 객체를 반환합니다.
 */
export function loadRegistry(): Registry {
  const registryPath = resolve(getProjectRoot(), "registry.json");
  const content = readFileSync(registryPath, "utf-8");
  return JSON.parse(content) as Registry;
}

/**
 * ID로 패키지를 찾습니다.
 */
export function findPackage(id: string): RegistryPackage | undefined {
  const registry = loadRegistry();
  return registry.packages.find((pkg) => pkg.id === id);
}

/**
 * 타입 및 검색어로 패키지를 필터링합니다.
 */
export function filterPackages(
  type?: string,
  query?: string
): RegistryPackage[] {
  const registry = loadRegistry();
  let packages = registry.packages;

  if (type) {
    packages = packages.filter((pkg) => pkg.type === type);
  }

  if (query) {
    const q = query.toLowerCase();
    packages = packages.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(q) ||
        pkg.description.toLowerCase().includes(q) ||
        pkg.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  return packages;
}
