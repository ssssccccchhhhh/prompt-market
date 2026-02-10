---
name: quick-review
description: 코드 변경사항 빠르게 리뷰 (5분 컷, 치명적만)
version: 1.0.0
author: ssssccccchhhhh
tags: [review, code-quality, mybatis, spring-boot]
allowed-tools: Bash(git *), Read
compatibility:
  claude-code: true
  cursor: true
  codex: false
  opencode: true
  antigravity: false
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
