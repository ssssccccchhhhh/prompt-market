# Phase 2.3 + 2.4 + 2.6: CLI + Setup Web UI + 버전 관리

> 상태: ✅ 완료 (2026-02-11)

## 의존 관계

```
2.1 ✅ (Registry) ──→ 2.3 (CLI)
                  ──→ 2.4 (Setup Web UI)
                  ──→ 2.6 (버전 관리)
2.5 (소셜 기능) ──→ 📌 추후 작업 예정
```

- 2.3 + 2.4 병렬 실행, 2.6 이후 순차

---

## Batch A: 병렬 2개 ✅

### A1: Phase 2.3 — CLI 구현 (~10파일) ✅

**수정:**
- `cli/src/index.ts` — commands 등록
- `cli/package.json` — chalk, ora, @inquirer/prompts 의존성 추가, type: module

**생성:**
- `cli/src/commands/install.ts` — Skill 심링크 + MCP config 생성
- `cli/src/commands/list.ts` — 테이블 출력
- `cli/src/commands/info.ts` — 패키지 상세 정보
- `cli/src/commands/search.ts` — 검색
- `cli/src/lib/registry.ts` — registry.json fetch + 캐시
- `cli/src/lib/installer.ts` — 심링크/config 생성 로직
- `cli/src/lib/config-gen.ts` — 도구별 JSON/TOML 생성

**검증:**
- [x] `cd cli && pnpm build` 성공 (0 에러)
- [x] `jetsong list` → 6개 패키지 출력
- [x] `jetsong list --type mcp` → 3개 필터
- [x] `jetsong info jira` → 상세 정보 + envFields
- [x] `jetsong search review` → quick-review 매칭

### A2: Phase 2.4 — Setup Web UI (~9파일) ✅

**수정:**
- `src/app/setup/page.tsx` — Stepper 컨테이너

**생성:**
- `src/app/setup/components/SetupStepper.tsx` — 5단계 관리
- `src/app/setup/components/ToolSelector.tsx` — Step 1: 도구 체크박스
- `src/app/setup/components/McpSelector.tsx` — Step 2: MCP 체크박스
- `src/app/setup/components/SkillSelector.tsx` — Step 3: Skill 체크박스
- `src/app/setup/components/TokenInput.tsx` — Step 4: 토큰 입력 폼
- `src/app/setup/components/ConfigOutput.tsx` — Step 5: 설정 코드 + 복사
- `src/app/setup/components/CliCommand.tsx` — Step 5: CLI 커맨드 생성
- `src/app/setup/lib/config-generators.ts` — JSON/TOML 문자열 생성

**검증:**
- [x] `pnpm build` 성공
- [x] /setup 페이지 5단계 Stepper 렌더링

---

## Batch B: 순차 ✅

### B1: Phase 2.6 — 버전 관리 (~5파일) ✅

**생성:**
- `skills/quick-review/CHANGELOG.md`
- `skills/verify/CHANGELOG.md`
- `skills/commit-push-pr/CHANGELOG.md`

**수정:**
- `scripts/registry-types.ts` — ChangelogEntry 타입 추가
- `scripts/generate-registry.ts` — CHANGELOG.md 파싱 (최근 3버전)
- `src/app/market/types.ts` — ChangelogEntry 타입 추가
- `src/app/market/[type]/[id]/page.tsx` — Changelog 섹션 렌더링

**검증:**
- [x] `npx tsx scripts/generate-registry.ts` → 3개 Skill에 changelog 포함
- [x] `pnpm build` 성공 (12페이지)

---

## 커밋
- [x] feat: CLI install/list/info/search 커맨드 구현
- [x] feat: Setup Web UI 5단계 Stepper (CSR)
- [x] feat: 버전 관리 + CHANGELOG.md 파싱
- [x] docs: CLAUDE.md Phase 진행 상태 업데이트
