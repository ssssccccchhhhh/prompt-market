# jetsong-toy 프로젝트 작업 계획 — Overview

## 한줄 요약

사내 AI 도구(Claude Code, Cursor, Codex 등)의 MCP 서버와 Skill을 관리하는 **모노레포 + 내부 마켓플레이스**.

---

## 비전

```
Phase 1  사내 도구 세팅 자동화 (setup.sh + install.sh)
Phase 2  웹 마켓플레이스 + CLI (npx jetsong install)
Phase 3  오픈소스 공개 (Skill + MCP 통합 레지스트리)
```

현재 시장에 skills.sh(Skill만), smithery.ai(MCP만) 있지만 **Skill + MCP 통합 + 프라이빗 지원**은 아직 없음. 이게 차별점.

---

## 최종 디렉토리 구조

```
jetsong-toy/                          ← Next.js 모노레포
├── src/app/
│   ├── page.tsx                        ← 랜딩 페이지
│   ├── market/                         ← Phase 2: 마켓플레이스
│   │   ├── page.tsx                    ← 리더보드 (다운로드 수, 스타)
│   │   ├── [type]/[id]/
│   │   │   └── page.tsx                ← 패키지 상세 (설치, 리뷰, 호환성)
│   │   └── submit/
│   │       └── page.tsx                ← 패키지 등록
│   └── setup/                          ← Phase 2: 웹 온보딩 UI
│       └── page.tsx                    ← 토큰 입력 + 설정 생성 (CSR)
│
├── mcp/                                ← MCP 서버 (Node.js)
│   ├── shared/                         ← 공통 유틸 (auth, logger)
│   │   ├── auth.ts
│   │   ├── logger.ts
│   │   └── index.ts
│   ├── jira-mcp/
│   │   ├── src/index.ts
│   │   ├── package.json                ← jetsong 메타데이터 포함
│   │   └── Dockerfile
│   ├── gitlab-mcp/
│   │   └── ...
│   └── loki-mcp/
│       └── ...
│
├── skills/                             ← Skill 패키지
│   ├── quick-review/
│   │   └── SKILL.md
│   ├── verify/
│   │   └── SKILL.md
│   ├── commit-push-pr/
│   │   └── SKILL.md
│   ├── install.sh                      ← 심링크 설치 스크립트
│   └── README.md
│
├── cli/                                ← Phase 2: npx jetsong CLI
│   ├── index.ts
│   ├── commands/
│   │   ├── install.ts
│   │   ├── list.ts
│   │   └── star.ts
│   └── package.json
│
├── scripts/
│   └── generate-registry.ts            ← prebuild: 패키지 스캔 → registry.json
│
├── registry.json                       ← 자동 생성 (git 커밋)
├── setup.sh                            ← Phase 1: 팀원 온보딩 쉘스크립트
├── package.json
├── .gitlab-ci.yml
└── README.md
```

---

## 작업 단위 (WBS)

### Phase 1 — 기반 구축 (현재 → 2주)

| # | 작업 | 상세 문서 | 예상 |
|---|------|----------|------|
| 1.1 | Next.js 프로젝트 초기화 + 모노레포 구조 | `01-project-init.md` | 0.5일 |
| 1.2 | MCP 서버 3종 구현 (Jira, GitLab, Loki) | `02-mcp-servers.md` | 3일 |
| 1.3 | Skill 패키지 3종 작성 | `03-skills.md` | 1일 |
| 1.4 | setup.sh + install.sh 스크립트 | `04-setup-scripts.md` | 1일 |
| 1.5 | 팀원 온보딩 + 피드백 수집 | `05-team-onboarding.md` | 1일 |

### Phase 2 — 마켓플레이스 (Phase 1 완료 후 → 3주)

| # | 작업 | 상세 문서 | 예상 |
|---|------|----------|------|
| 2.1 | 패키지 메타데이터 스키마 + registry.json 자동 생성 | `06-registry-schema.md` | 1일 |
| 2.2 | 마켓플레이스 웹 UI (리더보드, 상세, 검색) | `07-market-ui.md` | 3일 |
| 2.3 | CLI 구현 (npx jetsong install/list/star) | `08-cli.md` | 2일 |
| 2.4 | 웹 온보딩 UI (/setup 페이지) | `09-setup-web-ui.md` | 1.5일 |
| 2.5 | 소셜 기능 (스타, 리뷰, 다운로드 카운트) | `10-social-features.md` | 2일 |
| 2.6 | 버전 관리 + Changelog | `11-versioning.md` | 1일 |

### Phase 3 — 오픈소스 공개 (선택, Phase 2 안정화 후)

| # | 작업 | 비고 |
|---|------|------|
| 3.1 | DB 전환 (JSON → Supabase/Turso) | 사용자 100+ 시 |
| 3.2 | GitHub OAuth 인증 | 외부 사용자 대응 |
| 3.3 | 커뮤니티 패키지 제출 워크플로 | PR 기반 리뷰 |
| 3.4 | 문서 사이트 (docs/) | 기여 가이드 |

---

## 기술 스택

| 계층 | 기술 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | jetsong-toy 기반 |
| 스타일 | Tailwind CSS + shadcn/ui | v0 스타일 마켓 UI |
| MCP 서버 | Node.js + TypeScript | 도구 호환성 최고 |
| MCP SDK | `@modelcontextprotocol/sdk` | 표준 프로토콜 |
| CLI | commander + tsx | npx 실행 |
| 데이터 (Phase 1) | JSON 파일 + Git | DB 없이 시작 |
| 데이터 (Phase 2+) | Supabase or Turso | 스케일 시 전환 |
| 배포 | GitLab CI/CD | 사내 인프라 |
| 패키지 관리 | pnpm workspace | 모노레포 |

---

## 핵심 원칙

1. **Phase 1에서 검증 → Phase 2에서 확장** — DB 없이 JSON으로 시작, 사용 패턴 확인 후 스케일
2. **소스와 마켓이 한 레포** — MCP/Skill 추가하면 마켓에 자동 반영
3. **CLI가 핵심 인터페이스** — 설치 수 카운팅은 CLI에서, 탐색은 웹에서
4. **토큰은 로컬에만** — 서버로 전송하지 않음 (setup 페이지 CSR)
5. **도구 중립** — Claude Code, Cursor, Codex, Antigravity, OpenCode 모두 지원

---

## 의존 관계

```
1.1 프로젝트 초기화
 ├── 1.2 MCP 서버 구현
 ├── 1.3 Skill 작성
 └── 1.4 setup.sh
      └── 1.5 팀원 온보딩
           └── 2.1 registry 스키마
                ├── 2.2 마켓 UI
                ├── 2.3 CLI
                └── 2.4 웹 온보딩
                     └── 2.5 소셜 기능
                          └── 2.6 버전 관리
```

---

## 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| MCP SDK 버전 변경 | 서버 깨짐 | package.json 버전 고정 + 모니터링 |
| 사내망에서 npm 접근 제한 | CLI 설치 불가 | 오프라인 번들 or GitLab npm registry |
| 팀원 도구 버전 파편화 | 호환성 이슈 | 호환성 매트릭스 + 최소 버전 명시 |
| Phase 2 과설계 | 배포 지연 | Phase 1 먼저, 피드백 기반 우선순위 |
