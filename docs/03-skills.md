# 03. Skill 패키지 3종 작성

> Phase 1.3 | 예상: 1일 | 선행: 01-project-init

## 목표

quick-review, verify, commit-push-pr 3개 Skill을 SKILL.md 표준 포맷으로 작성한다. 마켓 registry용 메타데이터(package.json)도 함께.

---

## Skill 패키지 구조

```
skills/
├── quick-review/
│   ├── SKILL.md           ← 스킬 본문 (frontmatter + 지시사항)
│   └── package.json       ← 마켓 메타데이터 (Phase 2 대비)
├── verify/
│   ├── SKILL.md
│   └── package.json
├── commit-push-pr/
│   ├── SKILL.md
│   └── package.json
├── install.sh             ← 심링크 설치 스크립트
└── README.md
```

### package.json 표준 (Skill용)

```json
{
  "name": "@jetsong/skill-quick-review",
  "version": "1.0.0",
  "description": "변경사항 빠른 리뷰 (5분 컷)",
  "jetsong": {
    "displayName": "Quick Review",
    "icon": "🔍",
    "type": "skill",
    "tags": ["review", "code-quality", "mybatis", "spring-boot"],
    "compatibility": {
      "claude-code": true,
      "cursor": true,
      "codex": false,
      "opencode": true,
      "antigravity": false
    }
  }
}
```

---

## Skill 상세

### 1. quick-review

5분 안에 변경사항의 치명적 이슈만 잡는 리뷰 스킬.

```markdown
---
name: quick-review
description: 코드 변경사항 빠르게 리뷰 (5분 컷, 치명적만)
allowed-tools: Bash(git *), Read
---

현재 변경사항:
!`git diff --stat`
!`git diff --cached --stat`

## 리뷰 체크리스트
1. **컴파일** — 빌드 깨지는 거 없나
2. **N+1** — MyBatis XML에서 루프 안에 select 있나
3. **트랜잭션** — Service 레이어에 @Transactional 빠진 거 없나
4. **에러처리** — catch 블록에서 로그 없이 삼키는 거 없나
5. **DTO분리** — VO/DTO 없이 Map 직접 반환하는 거 없나
6. **XML-Mapper** — MyBatis XML id와 Mapper 인터페이스 메서드명 불일치 없나
7. **Oracle SQL** — ROWNUM 페이징 순서, NVL 사용, MERGE ON절 NULL 처리

각 항목 ✅/❌ 로 빠르게 판정. 문제 있으면 파일명:라인번호 + 1줄 요약.
사소한 스타일 이슈는 무시. 치명적인 것만.
```

### 2. verify

Stop Hook 대체용. 변경된 코드의 품질을 검증하는 스킬.

```markdown
---
name: verify
description: 변경된 Java/XML 파일 검증 (컴파일, 트랜잭션, MyBatis 일치)
allowed-tools: Bash(./mvnw *), Bash(mvn *), Bash(git *), Read
---

## 검증 순서

1. **컴파일 체크**
   !`./mvnw compile -q 2>&1 | tail -20`

2. **변경된 Java 파일 목록**
   !`git diff --name-only --diff-filter=ACMR -- '*.java'`

3. **검증 항목**
   - @Transactional: Service 클래스의 CUD 메서드에 누락 없는지
   - MyBatis XML-Mapper: XML id와 Mapper 인터페이스 메서드명 일치
   - 미처리 예외: catch 블록에서 로그 없이 exception 삼키지 않는지
   - Oracle SQL: MERGE문 ON절 NULL 가능 컬럼 NVL 감싸기

4. **결과**
   - 모두 통과 → `✅ 검증 통과`
   - 실패 항목 있음 → 파일명:라인번호 + 문제 설명 + 수정 제안
```

### 3. commit-push-pr

변경사항을 conventional commit으로 커밋하고 MR까지 생성하는 스킬.

```markdown
---
name: commit-push-pr
description: 변경사항 커밋, push, GitLab MR 생성
allowed-tools: Bash(git *), Bash(glab *), Read
---

현재 상태:
!`git status`
!`git diff --stat`
!`git branch --show-current`

## 실행 순서

1. **변경사항 분석** → conventional commit 메시지 생성
   - feat: 새 기능
   - fix: 버그 수정
   - refactor: 리팩토링
   - JIRA 티켓번호 포함 (브랜치명에서 IT2026-XXXX 추출)

2. **커밋**
   ```
   feat(booking): 예약 동시성 처리 추가 (IT2026-1747)
   ```

3. **Push**
   ```bash
   git push origin $(git branch --show-current)
   ```

4. **MR 생성** (glab CLI 사용)
   ```bash
   glab mr create --fill --target-branch develop
   ```
   glab 미설치 시 → GitLab MR URL 출력으로 대체
```

---

## install.sh (심링크 설치)

기존 온보딩 가이드의 스크립트 그대로 유지:

```bash
# 전체 설치
./skills/install.sh ~/Documents/workspace/jetsong/api

# 선택 설치
./skills/install.sh ~/Documents/workspace/jetsong/api quick-review verify

# 특정 도구만
./skills/install.sh ~/Documents/workspace/jetsong/api --only-claude
```

---

## 완료 조건

- [ ] 3개 SKILL.md 작성 + frontmatter 포함
- [ ] 각 Skill package.json에 jetsong 메타데이터
- [ ] install.sh로 심링크 생성 확인 (`.claude/skills/`, `.opencode/skills/`)
- [ ] Claude Code에서 `/quick-review` 실행 시 체크리스트 출력됨
- [ ] Cursor에서 `.claude/skills/` 자동 인식 확인 (Third-party skills ON)

---

## 다음

→ `04-setup-scripts.md` (setup.sh 통합 스크립트)
