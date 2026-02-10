---
name: verify
description: 변경된 Java/XML 파일 검증 (컴파일, 트랜잭션, MyBatis 일치)
version: 1.0.0
author: songdonghyun
tags: [verify, build, test, mybatis, spring-boot]
allowed-tools: Bash(./mvnw *), Bash(mvn *), Bash(git *), Read
compatibility:
  claude-code: true
  cursor: true
  codex: true
  opencode: true
  antigravity: false
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
