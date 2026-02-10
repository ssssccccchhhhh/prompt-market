#!/usr/bin/env bash
set -euo pipefail

# ─── Skill 심링크 설치 스크립트 ───
# 사용법:
#   ./skills/install.sh <project-path>                        # 전체 설치
#   ./skills/install.sh <project-path> quick-review verify    # 선택 설치
#   ./skills/install.sh --list                                # 목록 출력

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR"

# ─── 색상 ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─── 도움말 ───
usage() {
  echo "Usage:"
  echo "  ./skills/install.sh <project-path>                      전체 Skill 설치"
  echo "  ./skills/install.sh <project-path> skill1 skill2 ...    선택 설치"
  echo "  ./skills/install.sh --list                              설치 가능한 Skill 목록"
  echo ""
  echo "심링크 타겟: <project-path>/.claude/commands/"
}

# ─── SKILL.md frontmatter에서 description 추출 ───
get_description() {
  local skill_md="$1/SKILL.md"
  if [[ -f "$skill_md" ]]; then
    # frontmatter의 description 라인 추출
    sed -n '/^---$/,/^---$/p' "$skill_md" | grep '^description:' | sed 's/^description: *//'
  else
    echo "(SKILL.md 없음)"
  fi
}

# ─── --list: 설치 가능한 Skill 목록 출력 ───
list_skills() {
  echo -e "${CYAN}Available Skills:${NC}"
  echo ""
  for dir in "$SKILLS_DIR"/*/; do
    [[ -f "$dir/SKILL.md" ]] || continue
    local name
    name="$(basename "$dir")"
    local desc
    desc="$(get_description "$dir")"
    printf "  ${GREEN}%-20s${NC} — %s\n" "$name" "$desc"
  done
  echo ""
}

# ─── 심링크 생성 ───
install_skill() {
  local skill_name="$1"
  local target_dir="$2"
  local skill_md="$SKILLS_DIR/$skill_name/SKILL.md"

  if [[ ! -f "$skill_md" ]]; then
    echo -e "  ${RED}✗${NC} $skill_name — SKILL.md not found"
    return 1
  fi

  local commands_dir="$target_dir/.claude/commands"
  mkdir -p "$commands_dir"

  local link_path="$commands_dir/$skill_name.md"
  local abs_skill_md
  abs_skill_md="$(cd "$(dirname "$skill_md")" && pwd)/$(basename "$skill_md")"

  if [[ -L "$link_path" ]]; then
    local existing_target
    existing_target="$(readlink "$link_path")"
    if [[ "$existing_target" == "$abs_skill_md" ]]; then
      echo -e "  ${YELLOW}↔${NC} $skill_name — already linked"
      return 0
    fi
  fi

  ln -sfn "$abs_skill_md" "$link_path"
  echo -e "  ${GREEN}✓${NC} $skill_name → $link_path"
}

# ─── 메인 ───
main() {
  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  # --list 옵션
  if [[ "$1" == "--list" ]]; then
    list_skills
    exit 0
  fi

  # --help 옵션
  if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    usage
    exit 0
  fi

  local project_path="$1"
  shift

  # 프로젝트 경로 유효성 검사
  if [[ ! -d "$project_path" ]]; then
    echo -e "${RED}Error:${NC} 프로젝트 경로가 존재하지 않습니다: $project_path"
    exit 1
  fi

  # 절대 경로로 변환
  project_path="$(cd "$project_path" && pwd)"

  echo -e "${CYAN}[Skill Install]${NC} 타겟: $project_path/.claude/commands/"
  echo ""

  local skills_to_install=()

  if [[ $# -gt 0 ]]; then
    # 선택 설치
    skills_to_install=("$@")
  else
    # 전체 설치: SKILL.md가 있는 디렉토리만
    for dir in "$SKILLS_DIR"/*/; do
      [[ -f "$dir/SKILL.md" ]] || continue
      skills_to_install+=("$(basename "$dir")")
    done
  fi

  local success=0
  local fail=0

  for skill in "${skills_to_install[@]}"; do
    if install_skill "$skill" "$project_path"; then
      ((success++))
    else
      ((fail++))
    fi
  done

  echo ""
  echo -e "${CYAN}완료:${NC} ${GREEN}${success}개 설치${NC}"
  if [[ $fail -gt 0 ]]; then
    echo -e "  ${RED}${fail}개 실패${NC}"
  fi
}

main "$@"
