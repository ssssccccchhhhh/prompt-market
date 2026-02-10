# 04. setup.sh + install.sh 스크립트

> Phase 1.4 | 예상: 1일 | 선행: 02-mcp-servers, 03-skills

## 목표

팀원이 `./setup.sh` 한 번으로 MCP 빌드 + 토큰 입력 + 설정 파일 생성 + Skill 심링크까지 완료.

---

## setup.sh 플로우

```
[1/5] MCP 서버 빌드          ← pnpm install + build (3개)
[2/5] 환경변수 설정           ← .env.loki, .env.jira, .env.gitlab 생성
[3/5] 설정 파일 생성          ← 도구별 JSON/TOML 스니펫 생성
[4/5] 설정 파일 적용          ← Cursor, OpenCode, Antigravity 자동 / Claude Code, Codex 수동
[5/5] Skill 심링크            ← 프로젝트 경로 입력 → 심링크 생성
```

### 환경변수 저장 위치

```
~/.config/jetsong-mcp/
├── .env.loki              ← 공용 (관리자가 Slack에 공유)
├── .env.jira              ← 개인
├── .env.gitlab            ← 개인
└── generated/             ← setup.sh가 생성
    ├── claude-mcp-snippet.json
    ├── cursor-mcp.json
    ├── opencode-mcp-snippet.json
    ├── antigravity-mcp-config.json
    └── codex-mcp-snippet.toml
```

### 도구별 자동/수동 적용

| 도구 | 적용 방식 | 이유 |
|------|----------|------|
| Cursor | 자동 (`~/.cursor/mcp.json` 복사) | MCP 전용 파일 |
| oh-my-opencode | 자동 (jq 머지 or 복사) | MCP 전용 파일 |
| Antigravity | 자동 (`~/.gemini/antigravity/mcp_config.json`) | MCP 전용 파일 |
| Claude Code | **수동** (스니펫 안내) | settings.json에 permissions 등 기존 설정 있음 |
| OpenAI Codex | **수동** (스니펫 안내) | config.toml에 다른 설정 공존 |

### 멱등성 보장

- `.env.*` 파일이 이미 존재하면 스킵 + "이미 존재" 메시지
- 설정 파일 덮어쓰기 전 `.bak` 백업
- Skill 심링크는 `ln -sfn` (이미 있으면 덮어쓰기)

---

## install.sh 개선사항

기존 온보딩 가이드의 install.sh에 추가:

```bash
# 설치 가능한 Skill 목록 보기
./skills/install.sh --list

# 대화형 선택 (fzf 있으면)
./skills/install.sh ~/workspace/jetsong/api --interactive
```

`--list` 출력 예시:
```
Available Skills:
  quick-review    — 변경사항 빠른 리뷰 (5분 컷)
  verify          — 변경된 Java/XML 검증
  commit-push-pr  — 커밋 → 푸시 → MR 생성
```

SKILL.md의 frontmatter `description`에서 자동 추출.

---

## 완료 조건

- [ ] 새 맥에서 `git clone` → `./setup.sh` 실행 → 10분 내 완료
- [ ] 기존 환경에서 재실행 시 기존 설정 보존 (멱등성)
- [ ] Cursor에서 MCP 도구 3개 인식됨
- [ ] Claude Code에서 수동 붙여넣기 후 MCP 도구 인식됨
- [ ] `./skills/install.sh --list` 로 목록 출력됨
- [ ] 심링크 타겟이 절대경로로 올바른지 `ls -la` 확인

---

## 다음

→ `05-team-onboarding.md` (팀원 온보딩 + 피드백)
