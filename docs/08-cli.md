# 08. CLI 구현 (npx jetsong)

> Phase 2.3 | 예상: 2일 | 선행: 06-registry-schema

## 목표

`npx jetsong install jira-mcp` 한 줄로 MCP/Skill 설치. 설치 수 카운팅. 리더보드 CLI 버전.

---

## 명령어 체계

```bash
npx jetsong install <package>        # 패키지 설치
npx jetsong install <pkg> --tool cursor  # 특정 도구에만
npx jetsong install <pkg> --project ~/workspace/api

npx jetsong list                     # 전체 패키지 목록
npx jetsong list --type mcp          # MCP만
npx jetsong list --type skill        # Skill만

npx jetsong info <package>           # 상세 정보

npx jetsong star <package>           # 스타 (Phase 2.5)

npx jetsong search <query>           # 검색

npx jetsong update                   # 설치된 패키지 업데이트 확인
```

## 디렉토리 구조

```
cli/
├── index.ts              ← 엔트리포인트 (commander)
├── commands/
│   ├── install.ts        ← install 로직
│   ├── list.ts           ← list/search
│   ├── info.ts           ← 상세 정보
│   ├── star.ts           ← 스타
│   └── update.ts         ← 업데이트 확인
├── lib/
│   ├── registry.ts       ← registry.json fetch + 캐시
│   ├── installer.ts      ← Skill 심링크 / MCP 설정 생성
│   ├── config-gen.ts     ← 도구별 설정 파일 생성 (JSON/TOML)
│   └── stats.ts          ← 설치 수 리포트
├── package.json
└── tsconfig.json
```

### package.json

```json
{
  "name": "jetsong",
  "version": "0.1.0",
  "bin": {
    "jetsong": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx cli/index.ts"
  },
  "dependencies": {
    "commander": "^12.x",
    "chalk": "^5.x",
    "ora": "^8.x"
  }
}
```

---

## install 커맨드 상세

### Skill 설치 플로우

```
npx jetsong install quick-review --project ~/workspace/api
  1. registry에서 패키지 정보 fetch
  2. skills/quick-review/ 경로 확인
  3. 타겟 프로젝트에 심링크 생성:
     ~/.claude/skills/quick-review → jetsong-toy/skills/quick-review
  4. --tool 옵션에 따라:
     - claude-code (기본): .claude/skills/
     - opencode: .opencode/skills/
     - all: 둘 다
  5. install count 증가 (stats.json or API)
  6. ✅ quick-review installed
```

### MCP 설치 플로우

```
npx jetsong install jira-mcp --tool cursor
  1. registry에서 패키지 정보 fetch
  2. envFields 확인 → 필요한 토큰 대화형 입력
     ? JIRA_EMAIL: you@jetsong.co.kr
     ? JIRA_API_TOKEN: ****
  3. 도구별 설정 파일 생성:
     - cursor → ~/.cursor/mcp.json에 jira 서버 추가
     - claude-code → 스니펫 출력 (수동 붙여넣기 안내)
     - codex → TOML 스니펫 출력
  4. .env 파일 저장 (~/.config/jetsong-mcp/.env.jira)
  5. install count 증가
  6. ✅ jira-mcp installed for cursor
```

### 대화형 토큰 입력

```typescript
import { input, password } from '@inquirer/prompts';

async function promptEnvFields(fields: EnvField[]) {
  const env: Record<string, string> = {};
  for (const field of fields) {
    if (field.editable === false) {
      env[field.key] = field.default!;
      continue;
    }
    const promptFn = field.sensitive ? password : input;
    env[field.key] = await promptFn({
      message: field.key,
      default: field.default,
    });
  }
  return env;
}
```

---

## list 커맨드

```bash
$ npx jetsong list

  🏪 Jetsong Packages (6)

  Type   Name            Version  ⬇   ⭐  CC Cu Cx
  ─────────────────────────────────────────────────
  MCP    🎫 Jira         0.1.0    38  10  ✅ ✅ ✅
  MCP    🦊 GitLab       0.1.0    28   7  ✅ ✅ ✅
  MCP    📊 Loki         0.1.0    32   9  ✅ ✅ ✅
  Skill  🔍 Quick Review 1.0.0    47  12  ✅ ✅ ❌
  Skill  ✅ Verify       1.0.0    35   8  ✅ ✅ ❌
  Skill  📝 Commit-PR    1.0.0    20   5  ✅ ✅ ❌
```

---

## 설치 수 카운팅 (Phase별)

| Phase | 방식 | 장단점 |
|-------|------|--------|
| Phase 1-2 | `stats.json` 로컬 파일 + git commit | DB 없이 동작, 정확도 낮음 |
| Phase 2+ | Next.js API Route (`POST /api/stats/install`) | 실시간, 사내망 접근 필요 |
| Phase 3 | Supabase/Turso DB | 스케일, 외부 사용자 |

Phase 2 API Route:

```typescript
// src/app/api/stats/install/route.ts
export async function POST(req: Request) {
  const { packageId } = await req.json();
  // stats.json 읽기 → count++ → 쓰기
  // 또는 DB 업데이트
  return Response.json({ ok: true });
}
```

CLI에서:

```typescript
await fetch(`${REGISTRY_URL}/api/stats/install`, {
  method: 'POST',
  body: JSON.stringify({ packageId: pkg.id }),
});
```

---

## npm 배포 (Phase 3)

사내에서 검증 후 npm에 `jetsong` 패키지로 배포:

```bash
npm publish        # → npx jetsong install ...
```

Phase 1-2에서는 로컬 실행:

```bash
cd jetsong-toy/cli
pnpm link --global  # → jetsong 커맨드 사용 가능
```

---

## 완료 조건

- [ ] `npx jetsong list` → 6개 패키지 출력
- [ ] `npx jetsong install quick-review --project ~/workspace/api` → 심링크 생성
- [ ] `npx jetsong install jira-mcp --tool cursor` → mcp.json 업데이트
- [ ] 대화형 토큰 입력 동작
- [ ] install count 증가 확인 (stats.json or API)
- [ ] `npx jetsong info jira-mcp` → 상세 정보 출력

---

## 다음

→ `09-setup-web-ui.md` (웹 온보딩 UI)
