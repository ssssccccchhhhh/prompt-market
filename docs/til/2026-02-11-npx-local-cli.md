# TIL: npx로 로컬 CLI 패키지를 실행할 수 없는 이유

> 2026-02-11

## 상황

pnpm workspace 모노레포에서 `cli/` 디렉토리에 로컬 CLI 패키지(`jetsong`)를 만들었다.
`npx jetsong list --type mcp`로 실행하려 했더니 404 에러 발생.

```
npm error 404 Not Found - GET https://registry.npmjs.org/jetsong - Not found
```

## 원인

`npx <package>`는 다음 순서로 실행 대상을 찾는다:

1. `node_modules/.bin/` (로컬 프로젝트에 설치된 bin)
2. npm 레지스트리에서 다운로드 후 실행

pnpm workspace에서 `cli/` 패키지의 `bin` 필드가 루트 `node_modules/.bin/`에 자동 심링크되지 않는다.
결과적으로 1번을 건너뛰고 2번으로 가서 npm에서 `jetsong`을 찾으려 하고, 당연히 없으므로 404.

## 해결

### 방법 1: pnpm link --global (채택)

```bash
cd cli && pnpm build && pnpm link --global
```

- 글로벌 bin 디렉토리에 `jetsong` 심링크가 생긴다
- 이후 어디서든 `jetsong list --type mcp` 실행 가능
- 단, `pnpm setup`으로 `PNPM_HOME`이 PATH에 등록되어 있어야 한다

### 방법 2: node 직접 실행

```bash
node cli/dist/index.js list --type mcp
```

- 링크 없이 바로 실행 가능
- 루트 package.json에 스크립트로 등록하면 편리:
  ```json
  { "scripts": { "cli": "node cli/dist/index.js" } }
  ```
- 단, `pnpm -w run cli -- list --type mcp` 형태로 호출해야 함

### 방법 3: npx로 로컬 실행 (workspace 패키지)

```bash
npx --workspace=cli jetsong list --type mcp
```

- npm 7+ 에서 지원하지만 pnpm에서는 동작하지 않음

## pnpm link --global 주의점

- `pnpm setup` 실행 필요 (최초 1회, `PNPM_HOME` 환경변수 설정)
- `source ~/.zshrc` 또는 터미널 재시작 후 PATH 반영
- CLI 코드 수정 후 `pnpm build` 재실행 필요 (심링크가 dist를 가리키므로 빌드는 매번)
- `pnpm unlink --global`로 제거 가능

## 루트 package.json 스크립트 구성

```json
{
  "scripts": {
    "cli": "node cli/dist/index.js",
    "cli:build": "pnpm --filter jetsong run build"
  }
}
```

`pnpm -w run cli:build`로 CLI 빌드, `pnpm -w run cli -- list`로 직접 실행.

## 핵심 정리

| 방법 | 장점 | 단점 |
|------|------|------|
| `pnpm link --global` | 어디서든 `jetsong` 커맨드 사용 | 최초 셋업 필요, PATH 설정 |
| `node cli/dist/index.js` | 셋업 불필요 | 경로가 길어서 불편 |
| 루트 스크립트 (`pnpm -w run cli`) | 셋업 불필요 | `--` 구분자 필요 |
| `npx jetsong` | 직관적 | npm 배포 전에는 사용 불가 |
