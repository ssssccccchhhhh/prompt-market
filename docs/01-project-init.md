# 01. Next.js 프로젝트 초기화 + 모노레포 구조

> Phase 1.1 | 예상: 0.5일 | 선행: 없음

## 목표

jetsong-toy Next.js 프로젝트를 생성하고 pnpm workspace 기반 모노레포로 구성한다.

---

## 작업 항목

### 1. Next.js 프로젝트 생성

```bash
pnpm create next-app jetsong-toy --typescript --tailwind --app --src-dir
cd jetsong-toy
```

옵션:
- TypeScript: Yes
- Tailwind CSS: Yes
- App Router: Yes
- src/ directory: Yes
- ESLint: Yes

### 2. pnpm workspace 설정

```yaml
# pnpm-workspace.yaml
packages:
  - 'mcp/*-mcp'
  - 'cli'
```

MCP 서버들과 CLI를 독립 패키지로 관리. Next.js 앱은 루트.

### 3. 디렉토리 스캐폴딩

```bash
mkdir -p mcp/{shared,jira-mcp/src,gitlab-mcp/src,loki-mcp/src}
mkdir -p skills/{quick-review,verify,commit-push-pr}
mkdir -p cli/commands
mkdir -p scripts
mkdir -p src/app/{market,setup}
```

### 4. 공통 의존성 설치

```bash
# 루트
pnpm add -D typescript @types/node tsx

# shadcn/ui (마켓 UI용 — Phase 2 대비)
pnpm dlx shadcn@latest init
```

### 5. GitLab 레포 생성 + 초기 커밋

```bash
git init
git remote add origin https://gitlab.jetsong.co.kr/it-dev/jetsong-toy.git
```

### 6. .gitignore 설정

```gitignore
node_modules/
.next/
dist/
*.env
*.env.*
.config/jetsong-mcp/
registry.json          # 빌드 시 생성되지만 커밋 대상 (Phase 2)
```

### 7. package.json 기본 스크립트

```json
{
  "name": "jetsong-toy",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "predev": "tsx scripts/generate-registry.ts",
    "prebuild": "tsx scripts/generate-registry.ts",
    "mcp:build": "pnpm -r --filter '*-mcp' run build"
  }
}
```

---

## 완료 조건

- [ ] `pnpm dev` 로 Next.js 기본 페이지 뜸
- [ ] `mcp/`, `skills/`, `cli/` 디렉토리 존재
- [ ] pnpm workspace에서 `pnpm -r list` 시 MCP 패키지 인식됨
- [ ] GitLab에 초기 커밋 push 완료

---

## 다음

→ `02-mcp-servers.md` (MCP 서버 3종 구현)
