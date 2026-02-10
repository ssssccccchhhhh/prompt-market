# Prompt Market

AI Agent(Claude Code, Cursor, Codex, OpenCode, Antigravity)를 위한 **MCP 서버 & Skill 통합 마켓플레이스**.

팀 내 AI 도구 설정을 자동화하고, MCP 서버와 Skill을 한 곳에서 탐색/설치할 수 있습니다.

## 주요 기능

**마켓플레이스** (`/market`)
- MCP 서버 3종 + Skill 3종 리더보드
- Agent별 호환성 필터링, 타입/정렬/검색
- 패키지 상세 — 호환 Agent 선택, 설치 커맨드 복사, 환경 변수 설정

**셋업 위자드** (`/setup`)
- 5단계 가이드: 도구 선택 → MCP → Skill → 토큰 입력 → 설정 완료
- 도구별 설정 파일 자동 생성 (JSON / TOML)
- 토큰은 브라우저에서만 처리 (서버 전송 없음)

**CLI**
```bash
jetsong list --type mcp       # 패키지 목록
jetsong info jira             # 패키지 상세
jetsong install quick-review  # Skill 설치 (심링크)
jetsong search review         # 검색
```

**MCP 서버**
| 서버 | 도구 수 | 설명 |
|------|---------|------|
| Jira | 7 | 티켓 검색/생성/상태 변경/댓글 |
| GitLab | 6 | MR 조회/생성/파이프라인/diff |
| Loki | 4 | 로그 쿼리/라벨/통계 |

**Skills**
| Skill | 설명 |
|-------|------|
| quick-review | 변경사항 빠른 코드 리뷰 (5분 컷) |
| verify | 빌드/린트/테스트 검증 |
| commit-push-pr | 커밋 → 푸시 → MR 자동화 |

## 빠른 시작

### 사전 요구사항

- Node.js 20+
- pnpm 9+

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# MCP 서버 빌드
pnpm mcp:build

# CLI 빌드 + 글로벌 링크
pnpm cli:build
cd cli && pnpm link --global && cd ..

# 개발 서버 실행
pnpm dev
```

`http://localhost:3000` 에서 확인. CLI는 `jetsong` 커맨드로 사용.

### 팀 셋업 (shell)

```bash
# 대화형 셋업 (MCP 빌드 + 환경변수 + 설정 파일 생성 + Skill 설치)
./setup.sh

# Skill만 설치
./skills/install.sh <project-path>
./skills/install.sh --list
```

## 프로젝트 구조

```
prompt-market/
├── src/app/              # Next.js App Router
│   ├── market/           #   마켓플레이스 (리더보드 + 상세)
│   └── setup/            #   셋업 위자드
├── mcp/                  # MCP 서버 패키지
│   ├── shared/           #   공통 유틸 (auth, logger)
│   ├── jira-mcp/
│   ├── gitlab-mcp/
│   └── loki-mcp/
├── skills/               # Skill 패키지 (SKILL.md + package.json)
│   ├── quick-review/
│   ├── verify/
│   └── commit-push-pr/
├── cli/                  # npx jetsong CLI
├── scripts/              # generate-registry.ts
├── plans/                # Phase별 작업 계획
├── docs/                 # 설계 문서 (00~11)
├── registry.json         # 자동 생성 (prebuild)
└── setup.sh              # 팀 셋업 스크립트
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 스타일링 | Tailwind CSS + shadcn/ui |
| MCP 서버 | TypeScript + @modelcontextprotocol/sdk |
| CLI | commander + tsx (ESM) |
| 데이터 | JSON 파일 + Git (Phase 1-2) |
| 패키지 매니저 | pnpm workspace |

## 주요 커맨드

```bash
pnpm dev                    # 개발 서버 (registry.json 자동 갱신)
pnpm build                  # 프로덕션 빌드
pnpm mcp:build              # MCP 서버 전체 빌드
tsx scripts/generate-registry.ts  # registry.json 수동 생성
```

## 데이터 흐름

```
mcp/*/package.json + skills/*/SKILL.md
  → scripts/generate-registry.ts (prebuild)
  → registry.json
  → /market (RSC import) + CLI (HTTP fetch)
```

## 로드맵

- [x] Phase 1 — 팀 셋업 자동화
- [x] Phase 2 — 웹 마켓플레이스 + CLI
- [ ] Phase 2.5 — 소셜 기능 (스타, 리뷰, 다운로드 카운트)
- [ ] Phase 3 — 오픈소스 릴리즈 (GitHub OAuth, DB 전환, npm 배포)

## 라이선스

Private (내부 사용)
