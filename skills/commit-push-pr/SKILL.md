---
name: commit-push-pr
description: 변경사항 커밋, push, GitLab MR 생성
version: 1.0.0
author: ssssccccchhhhh
tags: [git, commit, pr, gitlab]
allowed-tools: Bash(git *), Bash(glab *), Read
compatibility:
  claude-code: true
  cursor: true
  codex: false
  opencode: true
  antigravity: false
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
