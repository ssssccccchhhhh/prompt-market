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

export interface CompatibilityMap {
  [key: string]: boolean;
  'claude-code': boolean;
  cursor: boolean;
  codex: boolean;
  opencode: boolean;
  antigravity: boolean;
}

export interface RegistryPackage {
  id: string;
  type: 'mcp' | 'skill';
  name: string;
  description: string;
  icon: string;
  version: string;
  author: string;
  tags: string[];
  compatibility: CompatibilityMap;
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

export type SortKey = 'installs' | 'stars' | 'name';
export type FilterType = 'all' | 'mcp' | 'skill';
