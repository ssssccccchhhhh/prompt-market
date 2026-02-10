# 02. MCP 서버 3종 구현

> Phase 1.2 | 예상: 3일 | 선행: 01-project-init

## 목표

Jira, GitLab, Grafana Loki MCP 서버를 구현한다. 모든 서버는 `@modelcontextprotocol/sdk` 기반 stdio 방식.

---

## 공통 구조

### 각 MCP 패키지 구조

```
mcp/jira-mcp/
├── src/
│   ├── index.ts          ← 엔트리포인트 (서버 생성 + 도구 등록)
│   ├── tools/            ← 도구별 핸들러
│   │   ├── search.ts
│   │   ├── create.ts
│   │   └── transition.ts
│   └── types.ts          ← 타입 정의
├── package.json
├── tsconfig.json
└── Dockerfile            ← 선택 (원격 배포 시)
```

### package.json 표준

```json
{
  "name": "@jetsong/jira-mcp",
  "version": "0.1.0",
  "description": "Jira 티켓 검색/생성/상태 변경",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts"
  },
  "jetsong": {
    "displayName": "Jira",
    "icon": "🎫",
    "type": "mcp",
    "tokenType": "personal",
    "tokenGuide": "https://id.atlassian.com/manage-profile/security/api-tokens",
    "compatibility": {
      "claude-code": true,
      "cursor": true,
      "codex": true,
      "opencode": true,
      "antigravity": true
    },
    "envFields": [
      { "key": "JIRA_URL", "default": "https://jetsong.atlassian.net", "editable": false },
      { "key": "JIRA_EMAIL", "placeholder": "you@jetsong.co.kr" },
      { "key": "JIRA_API_TOKEN", "sensitive": true },
      { "key": "JIRA_PROJECT_KEY", "default": "IT2026", "editable": false }
    ]
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x"
  }
}
```

`jetsong` 필드가 registry.json 자동 생성과 마켓 UI의 데이터 소스.

### 공통 유틸 (mcp/shared/)

```typescript
// mcp/shared/auth.ts
export function getBasicAuth(email: string, token: string): string {
  return Buffer.from(`${email}:${token}`).toString('base64');
}

// mcp/shared/logger.ts
export function log(server: string, message: string) {
  console.error(`[${server}] ${message}`);  // stderr → MCP 프로토콜 규약
}
```

---

## 서버별 상세

### 1. Jira MCP (1.5일)

| 도구 | 설명 | API |
|------|------|-----|
| `jira_search` | JQL로 이슈 검색 | `GET /rest/api/3/search` |
| `jira_get_issue` | 이슈 상세 조회 | `GET /rest/api/3/issue/{key}` |
| `jira_create_issue` | 이슈 생성 | `POST /rest/api/3/issue` |
| `jira_transition` | 이슈 상태 변경 | `POST /rest/api/3/issue/{key}/transitions` |
| `jira_add_comment` | 코멘트 추가 | `POST /rest/api/3/issue/{key}/comment` |
| `jira_my_issues` | 나에게 할당된 이슈 | JQL: `assignee=currentUser()` |
| `jira_sprint_issues` | 현재 스프린트 이슈 | JQL: `sprint in openSprints()` |

환경변수: `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`

핵심 구현:
- Basic Auth (email:token → Base64)
- JQL 쿼리 빌더 유틸
- 응답에서 핵심 필드만 추출 (summary, status, assignee, priority)
- 에러 시 친절한 메시지 (401 → "토큰 만료 확인", 404 → "프로젝트키 확인")

### 2. GitLab MCP (1일)

| 도구 | 설명 | API |
|------|------|-----|
| `gitlab_my_mrs` | 나에게 할당된 MR | `GET /api/v4/merge_requests` |
| `gitlab_mr_detail` | MR 상세 (diff 포함) | `GET /api/v4/projects/:id/merge_requests/:iid` |
| `gitlab_mr_changes` | MR 변경 파일 | `GET .../merge_requests/:iid/changes` |
| `gitlab_pipelines` | 파이프라인 상태 | `GET /api/v4/projects/:id/pipelines` |
| `gitlab_create_mr` | MR 생성 | `POST /api/v4/projects/:id/merge_requests` |
| `gitlab_search_code` | 코드 검색 | `GET /api/v4/projects/:id/search?scope=blobs` |

환경변수: `GITLAB_URL`, `GITLAB_TOKEN`

핵심 구현:
- Personal Access Token 인증 (`PRIVATE-TOKEN` 헤더)
- 셀프호스팅 GitLab URL 지원
- MR diff는 토큰 절약을 위해 stat만 기본, `--full` 옵션으로 전체

### 3. Grafana Loki MCP (0.5일)

| 도구 | 설명 | API |
|------|------|-----|
| `loki_query` | LogQL 쿼리 실행 | `GET /loki/api/v1/query_range` |
| `loki_labels` | 라벨 목록 | `GET /loki/api/v1/labels` |
| `loki_label_values` | 라벨 값 목록 | `GET /loki/api/v1/label/{name}/values` |
| `loki_tail` | 최근 로그 N줄 | `GET /loki/api/v1/query_range` (limit) |

환경변수: `LOKI_URL`, `LOKI_TOKEN`

핵심 구현:
- Bearer Token 인증
- 기본 시간범위: 최근 1시간
- LogQL 헬퍼: `{app="vitaportAPI"} |= "ERROR"` 같은 패턴 지원
- 로그 포매팅 (타임스탬프 + 레벨 + 메시지)

---

## 테스트 방법

### 로컬 단독 실행

```bash
cd mcp/jira-mcp
JIRA_URL=https://jetsong.atlassian.net \
JIRA_EMAIL=you@jetsong.co.kr \
JIRA_API_TOKEN=xxx \
JIRA_PROJECT_KEY=IT2026 \
npx tsx src/index.ts
```

### MCP Inspector로 확인

```bash
npx @modelcontextprotocol/inspector node mcp/jira-mcp/dist/index.js
```

### Claude Code에서 확인

```bash
claude
# → "Jira에서 내 티켓 보여줘"
# → "최근 API 에러 로그 확인해줘"
# → "내 MR 목록 보여줘"
```

---

## 완료 조건

- [ ] `pnpm mcp:build` 로 3개 서버 전부 빌드 성공
- [ ] MCP Inspector에서 각 서버 도구 목록 확인됨
- [ ] Claude Code에서 실제 데이터 조회 성공 (Jira 티켓, GitLab MR, Loki 로그)
- [ ] 환경변수 누락 시 친절한 에러 메시지 출력

---

## 다음

→ `03-skills.md` (Skill 패키지 작성)
