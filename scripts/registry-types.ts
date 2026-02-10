export interface EnvField {
  key: string;
  default?: string;
  placeholder?: string;
  sensitive?: boolean;
  editable?: boolean;
}

export interface Package {
  id: string;
  type: 'skill' | 'mcp';
  name: string;
  description: string;
  icon: string;
  version: string;
  author: string;
  tags: string[];
  compatibility: {
    'claude-code': boolean;
    'cursor': boolean;
    'codex': boolean;
    'opencode': boolean;
    'antigravity': boolean;
  };
  envFields?: EnvField[];
  tokenType?: 'shared' | 'personal';
  tokenGuide?: string;
  stats: {
    installs: number;
    stars: number;
  };
  changelog?: ChangelogEntry[];
  createdAt: string;
  updatedAt: string;
  path: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface Registry {
  generated: string;
  packages: Package[];
}
