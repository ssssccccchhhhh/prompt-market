# 06. 패키지 메타데이터 스키마 + registry.json 자동 생성

> Phase 2.1 | 예상: 1일 | 선행: 05-team-onboarding (Phase 1 완료)

## 목표

MCP/Skill 패키지의 메타데이터 스키마를 확정하고, `prebuild` 스크립트로 registry.json을 자동 생성한다. 마켓 UI와 CLI의 데이터 소스.

---

## 스키마 정의

### Package (공통)

```typescript
// scripts/registry-types.ts

interface Package {
  id: string;                        // "quick-review" | "jira-mcp"
  type: 'skill' | 'mcp';
  name: string;                      // displayName
  description: string;
  icon: string;                      // emoji
  version: string;                   // semver
  author: string;
  tags: string[];
  
  compatibility: {
    'claude-code': boolean;
    'cursor': boolean;
    'codex': boolean;
    'opencode': boolean;
    'antigravity': boolean;
  };
  
  // MCP 전용
  envFields?: EnvField[];
  tokenType?: 'shared' | 'personal';
  tokenGuide?: string;
  
  // 소셜 (Phase 2.5)
  stats: {
    installs: number;
    stars: number;
  };
  
  // 메타
  createdAt: string;
  updatedAt: string;
  path: string;                      // 레포 내 경로
}

interface EnvField {
  key: string;
  default?: string;
  placeholder?: string;
  sensitive?: boolean;
  editable?: boolean;                // false면 UI에서 비활성
}
```

## generate-registry.ts

```typescript
// scripts/generate-registry.ts
// prebuild에서 실행: mcp/*/package.json + skills/*/SKILL.md 스캔 → registry.json

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';    // SKILL.md frontmatter 파싱

const ROOT = process.cwd();
const MCP_DIR = path.join(ROOT, 'mcp');
const SKILLS_DIR = path.join(ROOT, 'skills');
const OUT = path.join(ROOT, 'registry.json');

function scanMcps(): Package[] { /* mcp/*-mcp/package.json → jetsong 필드 추출 */ }
function scanSkills(): Package[] { /* skills/*/SKILL.md frontmatter + package.json */ }

const registry = {
  generated: new Date().toISOString(),
  packages: [...scanMcps(), ...scanSkills()],
};

fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
```

### 실행 시점

```json
// package.json
{
  "scripts": {
    "predev": "tsx scripts/generate-registry.ts",
    "prebuild": "tsx scripts/generate-registry.ts"
  }
}
```

`npm run dev` → registry.json 갱신 → `/market` 페이지가 import → 자동 반영.

---

## registry.json 예시

```json
{
  "generated": "2026-02-10T12:00:00.000Z",
  "packages": [
    {
      "id": "jira",
      "type": "mcp",
      "name": "Jira",
      "description": "Jira 티켓 검색/생성/상태 변경",
      "icon": "🎫",
      "version": "0.1.0",
      "author": "songdonghyun",
      "tags": ["jira", "project-management", "tickets"],
      "compatibility": {
        "claude-code": true, "cursor": true, "codex": true,
        "opencode": true, "antigravity": true
      },
      "envFields": [
        { "key": "JIRA_URL", "default": "https://jetsong.atlassian.net", "editable": false },
        { "key": "JIRA_EMAIL", "placeholder": "you@jetsong.co.kr" },
        { "key": "JIRA_API_TOKEN", "sensitive": true },
        { "key": "JIRA_PROJECT_KEY", "default": "IT2026", "editable": false }
      ],
      "tokenType": "personal",
      "tokenGuide": "https://id.atlassian.com/manage-profile/security/api-tokens",
      "stats": { "installs": 0, "stars": 0 },
      "path": "mcp/jira-mcp"
    },
    {
      "id": "quick-review",
      "type": "skill",
      "name": "Quick Review",
      "description": "변경사항 빠른 리뷰 (5분 컷)",
      "icon": "🔍",
      "version": "1.0.0",
      "author": "songdonghyun",
      "tags": ["review", "code-quality", "mybatis"],
      "compatibility": {
        "claude-code": true, "cursor": true, "codex": false,
        "opencode": true, "antigravity": false
      },
      "stats": { "installs": 0, "stars": 0 },
      "path": "skills/quick-review"
    }
  ]
}
```

---

## 추상화 레이어 (Phase 3 대비)

```typescript
// src/lib/registry.ts
interface RegistryProvider {
  list(filter?: { type?: 'skill' | 'mcp'; tag?: string }): Promise<Package[]>;
  get(id: string): Promise<Package | null>;
  incrementInstall(id: string): Promise<void>;
  toggleStar(id: string, userId: string): Promise<void>;
  addReview(id: string, review: Review): Promise<void>;
}

// Phase 1-2: JSON 파일 기반
class JsonRegistry implements RegistryProvider { ... }

// Phase 3: DB 기반 (Supabase/Turso)
class DbRegistry implements RegistryProvider { ... }
```

---

## 완료 조건

- [ ] `tsx scripts/generate-registry.ts` 실행 시 registry.json 생성됨
- [ ] MCP 3개 + Skill 3개 = 6개 패키지 정상 파싱
- [ ] `pnpm dev` 시 자동 실행 (predev)
- [ ] registry.json을 Next.js 에서 import 가능 확인

---

## 다음

→ `07-market-ui.md` (마켓플레이스 웹 UI)
