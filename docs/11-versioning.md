# 11. 버전 관리 + Changelog

> Phase 2.6 | 예상: 1일 | 선행: 06-registry-schema

## 목표

각 MCP/Skill 패키지의 semver 버전 관리와 changelog 표시. CLI에서 업데이트 알림.

---

## 버전 관리 방식

### 버전 소스

각 패키지의 `package.json`에서 version 필드:

```json
{
  "name": "@jetsong/jira-mcp",
  "version": "0.2.0"
}
```

Skill은 package.json이 optional이므로, SKILL.md frontmatter에서도 지원:

```markdown
---
name: quick-review
version: 1.1.0
---
```

우선순위: package.json > SKILL.md frontmatter

### Changelog

각 패키지 디렉토리에 `CHANGELOG.md`:

```
skills/quick-review/
├── SKILL.md
├── package.json
└── CHANGELOG.md
```

```markdown
# Changelog

## 1.1.0 (2026-02-15)
- Oracle MERGE ON절 NULL 체크 항목 추가
- JSP 프로젝트 지원 개선

## 1.0.0 (2026-02-10)
- 초기 릴리즈
- 7가지 체크리스트 (컴파일, N+1, 트랜잭션, 에러처리, DTO분리, XML-Mapper, Oracle SQL)
```

### registry.json에 반영

generate-registry.ts가 CHANGELOG.md도 파싱:

```typescript
// 최근 3개 버전만 registry.json에 포함
{
  "id": "quick-review",
  "version": "1.1.0",
  "changelog": [
    { "version": "1.1.0", "date": "2026-02-15", "changes": ["Oracle MERGE 체크 추가", "JSP 지원 개선"] },
    { "version": "1.0.0", "date": "2026-02-10", "changes": ["초기 릴리즈"] }
  ]
}
```

---

## CLI 업데이트 알림

```bash
$ npx jetsong update

  Updates available:
  Package        Current  Latest  
  ─────────────────────────────────
  quick-review   1.0.0    1.1.0   ← UPDATE
  jira-mcp       0.1.0    0.1.0   ✅ up to date
  
  Run: npx jetsong install quick-review --force
```

### 로컬 설치 버전 추적

```
~/.config/jetsong-mcp/installed.json
{
  "quick-review": { "version": "1.0.0", "installedAt": "2026-02-10" },
  "jira-mcp": { "version": "0.1.0", "installedAt": "2026-02-10" }
}
```

install 시 기록, update 시 비교.

---

## 웹 UI

### 패키지 상세 페이지 Changelog 섹션

```
── Changelog ──
v1.1.0 (2026-02-15)
  • Oracle MERGE ON절 NULL 체크 항목 추가
  • JSP 프로젝트 지원 개선

v1.0.0 (2026-02-10)
  • 초기 릴리즈
```

### 리더보드에 버전 배지

최근 7일 내 업데이트된 패키지에 `NEW` 또는 `UPDATED` 배지.

---

## 릴리즈 워크플로

```bash
# 1. Skill/MCP 수정
vi skills/quick-review/SKILL.md

# 2. 버전 업데이트
vi skills/quick-review/package.json  # version: "1.1.0"

# 3. Changelog 추가
vi skills/quick-review/CHANGELOG.md

# 4. 커밋 + 푸시
git commit -am "feat(skill): quick-review v1.1.0 — Oracle MERGE 체크 추가"
git push origin main

# 5. prebuild가 registry.json 갱신 → 마켓 자동 반영
```

---

## 완료 조건

- [ ] generate-registry.ts가 version + changelog 파싱
- [ ] 패키지 상세 페이지에 Changelog 렌더링
- [ ] CLI `npx jetsong update` 동작
- [ ] `~/.config/jetsong-mcp/installed.json` 생성/업데이트
- [ ] 리더보드에 UPDATED 배지 표시 (7일 이내)

---

## 전체 Phase 완료

Phase 1 (기반) + Phase 2 (마켓) 작업 계획 완료.
Phase 3 (오픈소스) 은 Phase 2 안정화 후 별도 계획.
