# 09. 웹 온보딩 UI (/setup)

> Phase 2.4 | 예상: 1.5일 | 선행: 06-registry-schema

## 목표

setup.sh를 웹 UI로 대체. 체크박스로 MCP/Skill 선택 → 토큰 입력 → 도구별 설정 코드 생성 + 복사.

---

## 핵심 원칙

- **CSR only** — 토큰이 서버를 거치지 않음 (`'use client'`)
- **Stepper UI** — 단계별 진행 (5 steps)
- **registry.json 기반** — MCP/Skill 추가되면 자동 반영
- **setup.sh 점진적 대체** — 심링크만 CLI 유지

---

## 페이지 플로우

```
Step 1: 도구 선택
  ☑ Claude Code  ☑ Cursor  ☐ Codex  ☐ OpenCode  ☐ Antigravity
  
Step 2: MCP 선택
  ☑ 🎫 Jira (개인 토큰)
  ☑ 📊 Loki (공용 토큰)
  ☐ 🦊 GitLab (개인 토큰)

Step 3: Skill 선택
  ☑ 🔍 Quick Review
  ☑ ✅ Verify
  ☐ 📝 Commit-Push-PR

Step 4: 토큰 입력 (선택한 MCP에 따라 동적)
  ── Jira ──
  Email:     [you@jetsong.co.kr    ]
  API Token: [••••••••••••••••••     ]  → 발급 가이드 [🔗]
  
  ── Loki ──
  Token:     [••••••••••••••••••     ]  → 송동현에게 문의

Step 5: 결과
  ┌─ Claude Code ─┬─ Cursor ──┬─ Codex ──┐
  │ {설정 JSON}    │ {설정}    │ {TOML}   │
  │          [📋]  │    [📋]   │   [📋]   │
  └────────────────┴───────────┴──────────┘
  
  Skill 심링크 커맨드:
  $ npx jetsong install quick-review verify --project ~/workspace/api  [📋]
```

## 컴포넌트 구조

```
src/app/setup/
├── page.tsx                    ← 'use client', Stepper 컨테이너
├── components/
│   ├── SetupStepper.tsx        ← 단계 관리
│   ├── ToolSelector.tsx        ← Step 1: 도구 체크박스
│   ├── McpSelector.tsx         ← Step 2: MCP 체크박스 (registry에서)
│   ├── SkillSelector.tsx       ← Step 3: Skill 체크박스 (registry에서)
│   ├── TokenInput.tsx          ← Step 4: 동적 토큰 입력 폼
│   ├── ConfigOutput.tsx        ← Step 5: 도구별 탭 + 복사
│   └── CliCommand.tsx          ← Step 5: 심링크 CLI 커맨드 생성
└── lib/
    ├── config-generators.ts    ← JSON/TOML 문자열 생성
    └── types.ts
```

## 데이터 흐름

```
registry.json
  → McpSelector에 MCP 목록 렌더링
  → SkillSelector에 Skill 목록 렌더링

사용자 선택 (useState)
  → selectedTools: ['claude-code', 'cursor']
  → selectedMcps: ['jira', 'loki']  
  → selectedSkills: ['quick-review', 'verify']
  → envValues: { jira: { JIRA_EMAIL: '...', ... }, loki: { LOKI_TOKEN: '...' } }

ConfigOutput
  → 선택된 도구 × 선택된 MCP → 도구별 설정 문자열 생성
  → 각 탭에서 복사 버튼

CliCommand
  → 선택된 Skill → `npx jetsong install quick-review verify --project {path}` 생성
```

---

## setup.sh와의 관계

| 기능 | setup.sh | /setup 웹 | 비고 |
|------|----------|-----------|------|
| MCP 빌드 | ✅ | ❌ | 웹에서는 빌드 불가, CLI/터미널 필요 |
| 토큰 입력 | ✅ (read -rp) | ✅ (폼) | 웹이 UX 더 좋음 |
| 설정 파일 생성 | ✅ (파일 쓰기) | ✅ (복사) | 웹은 클립보드, 쉘은 직접 쓰기 |
| 자동 적용 | ✅ (Cursor 등) | ❌ | 웹은 수동 붙여넣기 |
| Skill 심링크 | ✅ (ln -sfn) | ❌ (CLI 커맨드 출력) | 파일시스템 접근 불가 |

**결론**: setup.sh는 폐기하지 않음. 웹은 "편리한 대안", 쉘은 "완전 자동화".

---

## 완료 조건

- [ ] 5단계 Stepper UI 동작
- [ ] registry.json에서 MCP/Skill 목록 동적 로드
- [ ] 토큰 입력 → 도구별 설정 코드 생성 (JSON + TOML)
- [ ] 복사 버튼 클릭 → 클립보드에 복사 + 토스트
- [ ] 심링크 CLI 커맨드 동적 생성
- [ ] 토큰이 네트워크 요청에 포함되지 않음 확인 (DevTools)

---

## 다음

→ `10-social-features.md` (스타, 리뷰, 다운로드 카운트)
