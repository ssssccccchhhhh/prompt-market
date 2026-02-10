#!/usr/bin/env bash
set -euo pipefail

# ─── Jetsong MCP + Skill 통합 셋업 ───
# 5단계 플로우:
#   1. MCP 서버 빌드
#   2. 환경변수 설정
#   3. 설정 파일 생성
#   4. 설정 파일 적용
#   5. Skill 심링크

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$HOME/.config/jetsong-mcp"
GENERATED_DIR="$CONFIG_DIR/generated"

# ─── 색상 ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

step() { echo -e "\n${BOLD}${CYAN}[$1]${NC} $2"; }
info() { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}!${NC} $1"; }
err()  { echo -e "  ${RED}✗${NC} $1"; }

# ─── 사전 검사 ───
check_prerequisites() {
  if ! command -v pnpm &>/dev/null; then
    err "pnpm이 설치되어 있지 않습니다. https://pnpm.io/installation"
    exit 1
  fi
  if ! command -v node &>/dev/null; then
    err "Node.js가 설치되어 있지 않습니다."
    exit 1
  fi
}

# ═══════════════════════════════════════════
# [1/5] MCP 서버 빌드
# ═══════════════════════════════════════════
step_build() {
  step "1/5" "MCP 서버 빌드"

  cd "$SCRIPT_DIR"
  info "의존성 설치 중..."
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install

  info "MCP 서버 빌드 중..."
  pnpm mcp:build

  info "MCP 서버 3개 빌드 완료"
}

# ═══════════════════════════════════════════
# [2/5] 환경변수 설정
# ═══════════════════════════════════════════
prompt_env() {
  local key="$1"
  local desc="$2"
  local default_val="${3:-}"
  local sensitive="${4:-false}"

  if [[ -n "$default_val" ]]; then
    echo -en "  ${key} [${default_val}]: "
    read -r val
    val="${val:-$default_val}"
  elif [[ "$sensitive" == "true" ]]; then
    echo -en "  ${key} (${desc}): "
    read -rs val
    echo ""
  else
    echo -en "  ${key} (${desc}): "
    read -r val
  fi

  echo "$val"
}

create_env_file() {
  local env_file="$1"
  local name="$2"
  shift 2

  if [[ -f "$env_file" ]]; then
    warn "$name 환경변수 이미 설정됨 — 스킵 ($env_file)"
    return 0
  fi

  echo -e "\n  ${BOLD}── $name ──${NC}"

  local content=""
  while [[ $# -gt 0 ]]; do
    local key="$1" desc="$2" default_val="$3" sensitive="$4"
    shift 4

    local val
    val="$(prompt_env "$key" "$desc" "$default_val" "$sensitive")"
    content+="${key}=${val}\n"
  done

  echo -e "$content" > "$env_file"
  info "$env_file 생성 완료"
}

step_env() {
  step "2/5" "환경변수 설정"

  mkdir -p "$CONFIG_DIR"

  # Loki (.env.loki)
  create_env_file "$CONFIG_DIR/.env.loki" "Loki" \
    "LOKI_URL" "Loki URL" "https://loki.jetsong.co.kr" "false" \
    "LOKI_TOKEN" "Loki 토큰 (관리자에게 문의)" "" "true"

  # Jira (.env.jira)
  create_env_file "$CONFIG_DIR/.env.jira" "Jira" \
    "JIRA_URL" "Jira URL" "https://jetsong.atlassian.net" "false" \
    "JIRA_EMAIL" "Jira 이메일" "" "false" \
    "JIRA_API_TOKEN" "https://id.atlassian.com/manage-profile/security/api-tokens" "" "true" \
    "JIRA_PROJECT_KEY" "프로젝트 키" "IT2026" "false"

  # GitLab (.env.gitlab)
  create_env_file "$CONFIG_DIR/.env.gitlab" "GitLab" \
    "GITLAB_URL" "GitLab URL" "https://gitlab.jetsong.co.kr" "false" \
    "GITLAB_TOKEN" "https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html" "" "true"
}

# ═══════════════════════════════════════════
# [3/5] 설정 파일 생성
# ═══════════════════════════════════════════
load_env() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    set -a
    source "$env_file"
    set +a
  fi
}

get_mcp_node_path() {
  local mcp_name="$1"
  echo "$SCRIPT_DIR/mcp/${mcp_name}-mcp/dist/${mcp_name}-mcp/src/index.js"
}

step_generate() {
  step "3/5" "설정 파일 생성"

  mkdir -p "$GENERATED_DIR"

  # .env 파일 로드
  load_env "$CONFIG_DIR/.env.loki"
  load_env "$CONFIG_DIR/.env.jira"
  load_env "$CONFIG_DIR/.env.gitlab"

  local jira_node gitlab_node loki_node
  jira_node="$(get_mcp_node_path "jira")"
  gitlab_node="$(get_mcp_node_path "gitlab")"
  loki_node="$(get_mcp_node_path "loki")"

  # ── Claude Code snippet (JSON) ──
  cat > "$GENERATED_DIR/claude-mcp-snippet.json" <<EOJSON
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["$jira_node"],
      "env": {
        "JIRA_URL": "${JIRA_URL:-}",
        "JIRA_EMAIL": "${JIRA_EMAIL:-}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN:-}",
        "JIRA_PROJECT_KEY": "${JIRA_PROJECT_KEY:-}"
      }
    },
    "gitlab": {
      "command": "node",
      "args": ["$gitlab_node"],
      "env": {
        "GITLAB_URL": "${GITLAB_URL:-}",
        "GITLAB_TOKEN": "${GITLAB_TOKEN:-}"
      }
    },
    "loki": {
      "command": "node",
      "args": ["$loki_node"],
      "env": {
        "LOKI_URL": "${LOKI_URL:-}",
        "LOKI_TOKEN": "${LOKI_TOKEN:-}"
      }
    }
  }
}
EOJSON
  info "claude-mcp-snippet.json 생성"

  # ── Cursor (JSON) ──
  cat > "$GENERATED_DIR/cursor-mcp.json" <<EOJSON
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["$jira_node"],
      "env": {
        "JIRA_URL": "${JIRA_URL:-}",
        "JIRA_EMAIL": "${JIRA_EMAIL:-}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN:-}",
        "JIRA_PROJECT_KEY": "${JIRA_PROJECT_KEY:-}"
      }
    },
    "gitlab": {
      "command": "node",
      "args": ["$gitlab_node"],
      "env": {
        "GITLAB_URL": "${GITLAB_URL:-}",
        "GITLAB_TOKEN": "${GITLAB_TOKEN:-}"
      }
    },
    "loki": {
      "command": "node",
      "args": ["$loki_node"],
      "env": {
        "LOKI_URL": "${LOKI_URL:-}",
        "LOKI_TOKEN": "${LOKI_TOKEN:-}"
      }
    }
  }
}
EOJSON
  info "cursor-mcp.json 생성"

  # ── OpenCode snippet (JSON) ──
  cat > "$GENERATED_DIR/opencode-mcp-snippet.json" <<EOJSON
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["$jira_node"],
      "env": {
        "JIRA_URL": "${JIRA_URL:-}",
        "JIRA_EMAIL": "${JIRA_EMAIL:-}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN:-}",
        "JIRA_PROJECT_KEY": "${JIRA_PROJECT_KEY:-}"
      }
    },
    "gitlab": {
      "command": "node",
      "args": ["$gitlab_node"],
      "env": {
        "GITLAB_URL": "${GITLAB_URL:-}",
        "GITLAB_TOKEN": "${GITLAB_TOKEN:-}"
      }
    },
    "loki": {
      "command": "node",
      "args": ["$loki_node"],
      "env": {
        "LOKI_URL": "${LOKI_URL:-}",
        "LOKI_TOKEN": "${LOKI_TOKEN:-}"
      }
    }
  }
}
EOJSON
  info "opencode-mcp-snippet.json 생성"

  # ── Antigravity (JSON) ──
  cat > "$GENERATED_DIR/antigravity-mcp-config.json" <<EOJSON
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["$jira_node"],
      "env": {
        "JIRA_URL": "${JIRA_URL:-}",
        "JIRA_EMAIL": "${JIRA_EMAIL:-}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN:-}",
        "JIRA_PROJECT_KEY": "${JIRA_PROJECT_KEY:-}"
      }
    },
    "gitlab": {
      "command": "node",
      "args": ["$gitlab_node"],
      "env": {
        "GITLAB_URL": "${GITLAB_URL:-}",
        "GITLAB_TOKEN": "${GITLAB_TOKEN:-}"
      }
    },
    "loki": {
      "command": "node",
      "args": ["$loki_node"],
      "env": {
        "LOKI_URL": "${LOKI_URL:-}",
        "LOKI_TOKEN": "${LOKI_TOKEN:-}"
      }
    }
  }
}
EOJSON
  info "antigravity-mcp-config.json 생성"

  # ── Codex (TOML) ──
  cat > "$GENERATED_DIR/codex-mcp-snippet.toml" <<EOTOML
# Jetsong MCP Servers for OpenAI Codex
# ~/.codex/config.toml 의 [mcp_servers] 섹션에 추가하세요

[mcp_servers.jira]
command = "node"
args = ["$jira_node"]

[mcp_servers.jira.env]
JIRA_URL = "${JIRA_URL:-}"
JIRA_EMAIL = "${JIRA_EMAIL:-}"
JIRA_API_TOKEN = "${JIRA_API_TOKEN:-}"
JIRA_PROJECT_KEY = "${JIRA_PROJECT_KEY:-}"

[mcp_servers.gitlab]
command = "node"
args = ["$gitlab_node"]

[mcp_servers.gitlab.env]
GITLAB_URL = "${GITLAB_URL:-}"
GITLAB_TOKEN = "${GITLAB_TOKEN:-}"

[mcp_servers.loki]
command = "node"
args = ["$loki_node"]

[mcp_servers.loki.env]
LOKI_URL = "${LOKI_URL:-}"
LOKI_TOKEN = "${LOKI_TOKEN:-}"
EOTOML
  info "codex-mcp-snippet.toml 생성"

  info "설정 파일 5개 생성 완료 → $GENERATED_DIR/"
}

# ═══════════════════════════════════════════
# [4/5] 설정 파일 적용
# ═══════════════════════════════════════════
backup_and_copy() {
  local src="$1"
  local dst="$2"
  local name="$3"

  if [[ -f "$dst" ]]; then
    cp "$dst" "${dst}.bak"
    warn "$name 기존 설정 백업 → ${dst}.bak"
  fi

  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  info "$name 설정 적용 완료"
}

step_apply() {
  step "4/5" "설정 파일 적용"

  # Cursor — 자동 적용
  local cursor_dst="$HOME/.cursor/mcp.json"
  if [[ -d "$HOME/.cursor" ]] || command -v cursor &>/dev/null; then
    backup_and_copy "$GENERATED_DIR/cursor-mcp.json" "$cursor_dst" "Cursor"
  else
    warn "Cursor 미설치 — 스킵"
  fi

  # OpenCode — 자동 적용
  local opencode_dir="$HOME/.config/opencode"
  if [[ -d "$opencode_dir" ]]; then
    backup_and_copy "$GENERATED_DIR/opencode-mcp-snippet.json" "$opencode_dir/mcp.json" "OpenCode"
  else
    warn "OpenCode 미설치 — 스킵"
  fi

  # Antigravity — 자동 적용
  local antigravity_dst="$HOME/.gemini/antigravity/mcp_config.json"
  if [[ -d "$HOME/.gemini" ]]; then
    backup_and_copy "$GENERATED_DIR/antigravity-mcp-config.json" "$antigravity_dst" "Antigravity"
  else
    warn "Antigravity 미설치 — 스킵"
  fi

  # Claude Code — 수동 안내
  echo ""
  echo -e "  ${BOLD}── Claude Code (수동 설정) ──${NC}"
  echo -e "  아래 내용을 settings.json의 mcpServers에 붙여넣으세요:"
  echo -e "  ${CYAN}cat $GENERATED_DIR/claude-mcp-snippet.json${NC}"
  echo ""

  # Codex — 수동 안내
  echo -e "  ${BOLD}── OpenAI Codex (수동 설정) ──${NC}"
  echo -e "  아래 내용을 ~/.codex/config.toml에 추가하세요:"
  echo -e "  ${CYAN}cat $GENERATED_DIR/codex-mcp-snippet.toml${NC}"
}

# ═══════════════════════════════════════════
# [5/5] Skill 심링크
# ═══════════════════════════════════════════
step_skills() {
  step "5/5" "Skill 심링크 설치"

  echo -en "  Skill을 설치할 프로젝트 경로를 입력하세요 (Enter로 스킵): "
  read -r project_path

  if [[ -z "$project_path" ]]; then
    warn "Skill 심링크 스킵 (나중에 ./skills/install.sh <project-path> 로 설치 가능)"
    return 0
  fi

  # ~ 확장
  project_path="${project_path/#\~/$HOME}"

  if [[ ! -d "$project_path" ]]; then
    err "프로젝트 경로가 존재하지 않습니다: $project_path"
    return 1
  fi

  "$SCRIPT_DIR/skills/install.sh" "$project_path"
}

# ═══════════════════════════════════════════
# 메인
# ═══════════════════════════════════════════
main() {
  echo -e "${BOLD}${CYAN}"
  echo "  ╔═══════════════════════════════════════╗"
  echo "  ║   Jetsong MCP + Skill Setup           ║"
  echo "  ╚═══════════════════════════════════════╝"
  echo -e "${NC}"

  check_prerequisites
  step_build
  step_env
  step_generate
  step_apply
  step_skills

  echo ""
  echo -e "${BOLD}${GREEN}  ✅ 셋업 완료!${NC}"
  echo ""
  echo -e "  설정 파일: $CONFIG_DIR/"
  echo -e "  MCP 서버: $SCRIPT_DIR/mcp/*-mcp/dist/"
  echo ""
}

main "$@"
