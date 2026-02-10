# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**prompt-market** (internal name: jetsong-toy) is a monorepo + internal marketplace for managing MCP servers and Skills for AI coding tools (Claude Code, Cursor, Codex, OpenCode, Antigravity). The differentiator is **Skill + MCP unified registry with private/enterprise support**.

Three-phase roadmap:
- **Phase 1**: Team setup automation (setup.sh + install.sh)
- **Phase 2**: Web marketplace + CLI (`npx jetsong install`)
- **Phase 3**: Open-source release

### Phase 진행 상태

| Phase | 내용 | 상태 |
|-------|------|------|
| 1.1 | 프로젝트 초기화 | ✅ 완료 |
| 1.2 | MCP 서버 3종 (Jira 7, GitLab 6, Loki 4 = 17도구) | ✅ 완료 |
| 1.3 | Skills 3종 (SKILL.md + package.json) | ✅ 완료 |
| 1.4 | setup.sh + install.sh | ✅ 완료 |
| 1.5 | 팀원 온보딩 + 피드백 | 수동 작업 (별도) |
| 2.1 | Registry (generate-registry.ts → registry.json) | ✅ 완료 |
| 2.2 | Market UI (리더보드 + 상세 + Agent 필터) | ✅ 완료 |
| 2.3 | CLI 구현 (npx jetsong install/list/info/search) | ✅ 완료 |
| 2.4 | Setup Web UI (/setup 5단계 Stepper) | ✅ 완료 |
| 2.5 | 소셜 기능 (stars, reviews, stats) | 📌 추후 작업 예정 |
| 2.6 | 버전 관리 + CHANGELOG.md 파싱 | ✅ 완료 |

Detailed design docs live in `docs/00-overview.md` through `docs/11-versioning.md`.

---

## 현재 작업 상태 (세션 이관용)

> 최종 업데이트: 2026-02-11 | 최신 커밋: `e996b46`
> `pnpm build` 통과 확인 완료

### ✅ 완료

**Phase 1 전체 (인프라)**
- MCP 서버 3종: `mcp/jira-mcp`, `mcp/gitlab-mcp`, `mcp/loki-mcp` (각각 빌드 완료)
- Skills 3종: `skills/quick-review`, `skills/verify`, `skills/commit-push-pr` (SKILL.md frontmatter + package.json)
- `scripts/generate-registry.ts`: MCP 3 + Skill 3 = 6개 패키지 → `registry.json` 자동 생성
- `setup.sh` (5단계 대화형), `skills/install.sh` (심링크 설치)

**Phase 2 핵심 기능**
- `/market` 리더보드: 타입/정렬 필터, 검색, Agent 필터 (ToolFilter sticky), 테이블 컬럼 고정
- `/market/[type]/[id]` 상세: PackageHeader, CompatGrid (선택 가능), InstallCommand, McpEnvSetup, Changelog, CartButton (헤더 우측)
- `/setup` 5단계 Stepper: 도구 선택 → MCP → Skill → 토큰 입력 → 설정 완료
- Setup UX: 호환성 리마인더 (amber 경고), PROJECT_ROOT 입력, `?tool=` URL 파라미터로 도구 pre-select
- ConfigOutput: JSON 도구 통합 탭 (Claude Code/Cursor/OpenCode/Antigravity) + Codex TOML 별도 탭
- CLI: `jetsong install/list/info/search` 4개 커맨드 (ESM, chalk v5, ora v9)
- 버전 관리: CHANGELOG.md 파싱 → registry.json 포함, 상세 페이지 렌더링

**UX 개선 (Phase 2 이후 추가)**
- "AI 코딩 도구" → "AI Agent" 네이밍 통일
- ToolFilter sticky 고정 + 셋업 버튼 disable/enable
- CompatBadge fullName + 지원/미지원 tooltip
- 상세 페이지 CompatGrid 클릭 선택 가능 (agent별 고유 색상 ring)
- 장바구니 버튼 헤더 우측 (추후 구현 안내)

### 🚧 미완료 / 다음 작업

**🔜 즉시 다음: /market 리더보드 장바구니 버튼 추가**
- `/market` 페이지 헤더 우측에 장바구니 아이콘 버튼 추가 (상세 페이지 `CartButton`과 동일 패턴)
- 상세 페이지의 CompatGrid에서 Agent를 선택한 뒤 장바구니 담기 → `/market` 헤더에 담긴 개수 badge 표시
- 실제 장바구니 로직(상태 관리, 일괄 셋업 연동)은 TODO 주석으로 남기고 UI만 구현
- 참고 파일: `src/app/market/[type]/[id]/components/CartButton.tsx` (기존 상세 페이지용)

**Phase 2.5 — 소셜 기능 (추후 작업 예정)**
- `data/stats.json`, `data/reviews.json` 생성
- API Routes: `/api/stats/install`, `/api/stats/star`, `/api/reviews`
- StarButton, ReviewSection UI 컴포넌트
- 리더보드 정렬에 실제 stats 반영
- 설계 문서: `docs/10-social-features.md`

**장바구니 기능 구현**
- CartButton은 UI만 존재 (클릭 시 "추후 업데이트" 안내)
- 실제 장바구니 상태 관리 (Context/Zustand), 여러 패키지 담기, 일괄 셋업 연동 필요

**Phase 3 — 오픈소스 준비**
- GitHub OAuth 인증
- DB 전환 (Supabase/Turso): `JsonRegistry` → `DbRegistry`
- `npx jetsong` npm 배포
- 패키지 등록 페이지 (`/market/submit`)
- CI/CD 파이프라인

### 📋 알려진 이슈

- `.next` 캐시 오염 시 `Cannot find module './480.js'` 에러 발생 → `rm -rf .next` 후 재빌드로 해결
- `pnpm build` 전 `tsx scripts/generate-registry.ts` 자동 실행 (prebuild hook)
- main 브랜치에 23개 로컬 커밋 미푸시 상태 (`git push` 필요)

### 🗂️ 주요 파일 맵

```
src/app/
├── market/
│   ├── page.tsx                          ← 리더보드 (RSC)
│   ├── types.ts                          ← RegistryPackage, CompatibilityMap 등
│   ├── components/
│   │   ├── ToolFilter.tsx                ← Agent 필터 (sticky, client)
│   │   ├── FilterBar.tsx                 ← 타입/정렬 필터
│   │   ├── SearchBox.tsx                 ← 검색
│   │   ├── MarketContent.tsx             ← 필터링 + 정렬 로직
│   │   ├── PackageTable.tsx              ← 데스크톱 테이블 (table-fixed)
│   │   ├── PackageCard.tsx               ← 모바일 카드
│   │   └── CompatBadge.tsx               ← CC/Cu/Cx/OC/AG 배지
│   └── [type]/[id]/
│       ├── page.tsx                      ← 패키지 상세 (SSG)
│       └── components/
│           ├── PackageHeader.tsx
│           ├── CompatGrid.tsx            ← 선택 가능한 Agent 그리드 (client)
│           ├── CartButton.tsx            ← 장바구니 (헤더, 추후 구현)
│           ├── InstallCommand.tsx
│           └── McpEnvSetup.tsx
├── setup/
│   ├── page.tsx                          ← ?tool= 파라미터 지원
│   ├── components/
│   │   ├── SetupStepper.tsx              ← 5단계 메인 컨트롤러
│   │   ├── ToolSelector.tsx              ← Step 1
│   │   ├── McpSelector.tsx               ← Step 2 (호환성 리마인더)
│   │   ├── SkillSelector.tsx             ← Step 3 (호환성 리마인더)
│   │   ├── TokenInput.tsx                ← Step 4 (호환성 리마인더)
│   │   ├── ConfigOutput.tsx              ← Step 5 (JSON/TOML + PROJECT_ROOT)
│   │   └── CliCommand.tsx                ← Step 5 (Skill 설치 커맨드)
│   └── lib/
│       └── config-generators.ts          ← generateJsonConfig, generateTomlConfig
cli/src/
├── index.ts                              ← CLI 엔트리 (ESM)
├── commands/                             ← install, list, info, search
└── lib/                                  ← registry, config-gen, installer
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, `src/` directory) |
| Styling | Tailwind CSS + shadcn/ui |
| MCP Servers | Node.js + TypeScript, `@modelcontextprotocol/sdk` (stdio) |
| CLI | commander + tsx |
| Data (Phase 1-2) | JSON files + Git (no DB) |
| Package Manager | pnpm workspace |
| Deployment | GitLab CI/CD |

## Common Commands

```bash
# Development
pnpm dev                    # Next.js dev server (runs predev → generate-registry.ts)
pnpm build                  # Next.js build (runs prebuild → generate-registry.ts)

# MCP servers
pnpm mcp:build              # Build all MCP servers: pnpm -r --filter '*-mcp' run build
cd mcp/jira-mcp && pnpm dev # Dev single MCP server with tsx watch

# Registry
tsx scripts/generate-registry.ts   # Scan mcp/*/package.json + skills/*/SKILL.md → registry.json

# Skills
./skills/install.sh <project-path>                        # Install all skills via symlink
./skills/install.sh <project-path> quick-review verify    # Install specific skills
./skills/install.sh --list                                # List available skills

# CLI (Phase 2, local dev)
pnpm -w run cli:build           # Build CLI
cd cli && pnpm link --global    # Enable `jetsong` command globally
jetsong install <package> --tool cursor --project ~/workspace/api
jetsong list --type mcp

# MCP testing
npx @modelcontextprotocol/inspector node mcp/jira-mcp/dist/index.js
```

## Architecture

### Monorepo Layout

- **`src/app/`** — Next.js App Router pages (landing, `/market` marketplace, `/setup` web onboarding)
- **`mcp/`** — MCP server packages (pnpm workspace members matching `*-mcp`)
  - `mcp/shared/` — Common utilities (auth, logger) shared across MCP servers
  - `mcp/jira-mcp/`, `mcp/gitlab-mcp/`, `mcp/loki-mcp/` — Individual MCP servers
- **`skills/`** — Skill packages, each containing `SKILL.md` (frontmatter + instructions) and `package.json`
- **`cli/`** — `npx jetsong` CLI (pnpm workspace member)
- **`scripts/`** — Build scripts, notably `generate-registry.ts`
- **`data/`** — JSON-based storage for stats and reviews (Phase 2)

### Key Concepts

**`jetsong` metadata field**: Each MCP/Skill `package.json` includes a `jetsong` object with `displayName`, `icon`, `type` ("mcp"|"skill"), `compatibility` map, and `envFields` (for MCP token configuration). This is the data source for `registry.json` and the marketplace UI.

**`registry.json`**: Auto-generated at prebuild by scanning all packages. Consumed by the marketplace web UI and CLI. Not hand-edited.

**Token handling**: All tokens stay local. The `/setup` web page is CSR-only (`'use client'`) — tokens never leave the browser. Shell scripts write to `~/.config/jetsong-mcp/.env.*`.

**Tool-neutral design**: Each package declares compatibility per tool. Configuration generation produces tool-specific formats (JSON for Claude Code/Cursor, TOML for Codex).

### MCP Server Pattern

All MCP servers follow the same structure:
- Entry: `src/index.ts` (server creation + tool registration via `@modelcontextprotocol/sdk`)
- Tools in `src/tools/` (one file per tool)
- Types in `src/types.ts`
- Auth via `mcp/shared/auth.ts`
- Logging to stderr per MCP protocol convention

### Data Flow

```
mcp/*/package.json + skills/*/SKILL.md
  → scripts/generate-registry.ts (prebuild)
  → registry.json
  → /market pages (RSC import) + CLI (HTTP fetch)
```

## Phase 작업 계획 관리

Phase 단위 작업 시작 전에 반드시 `plans/phase-X.Y-*.md` 파일로 실행 계획을 생성한다. 작업 완료 후에도 계획을 다시 볼 수 있도록 기록을 남기는 목적.

```
plans/
├── phase-1.3-2.2-skills-registry-market.md   ← 완료된 계획 예시
├── phase-2.3-cli.md
└── ...
```

**계획 파일 포함 항목:**
- 의존 관계 분석 (선행 Phase)
- 작업 배치 (병렬 가능 여부)
- 각 태스크별 생성/수정 파일 목록
- 검증 커맨드
- 완료 체크리스트 (작업 후 ✅ 체크)

## Agent Team 운용 교훈

- **git worktree + spawned agent 조합 제한**: worktree는 프로젝트 루트 밖(`../prompt-market-*`)에 생성되므로 spawned agent가 해당 경로에 Write/Bash 권한을 갖지 못함. agent 병렬 작업 시 프로젝트 디렉토리 내부에서 브랜치 전환 방식 사용할 것.
- **TeamCreate delegate 모드 제한**: team을 생성하면 team-lead와 팀원 모두 delegate 모드에 진입하여 파일 도구(Read/Write/Bash/Glob)를 사용할 수 없음. 파일 작업이 필요한 병렬 작업은 team 없이 독립 Task agent로 spawn할 것.
- **pnpm workspace + shadcn init**: `pnpm dlx shadcn@latest init`이 workspace 루트에 의존성 추가 시 `ERR_PNPM_ADDING_TO_ROOT` 발생. `pnpm add -w` 로 수동 선설치 후 init 재실행 필요.

## Language

Project documentation and commit messages are in Korean. Code (variable names, comments in source) is in English.
