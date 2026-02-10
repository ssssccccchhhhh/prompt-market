# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**prompt-market** (internal name: jetsong-toy) is a monorepo + internal marketplace for managing MCP servers and Skills for AI coding tools (Claude Code, Cursor, Codex, OpenCode, Antigravity). The differentiator is **Skill + MCP unified registry with private/enterprise support**.

Three-phase roadmap:
- **Phase 1**: Team setup automation (setup.sh + install.sh)
- **Phase 2**: Web marketplace + CLI (`npx jetsong install`)
- **Phase 3**: Open-source release

Detailed design docs live in `docs/00-overview.md` through `docs/11-versioning.md`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, `src/` directory) |
| Styling | Tailwind CSS + shadcn/ui |
| MCP Servers | Node.js + TypeScript, `@modelcontextprotocol/sdk` (stdio) |
| CLI | commander + tsx |
| Data (Phase 1-2) | JSON files + Git (no DB) |
| Package Manager | pnpm workspace |
| Deployment | GitLab CI/CD |

## Common Commands

```bash
# Development
pnpm dev                    # Next.js dev server (runs predev → generate-registry.ts)
pnpm build                  # Next.js build (runs prebuild → generate-registry.ts)

# MCP servers
pnpm mcp:build              # Build all MCP servers: pnpm -r --filter '*-mcp' run build
cd mcp/jira-mcp && pnpm dev # Dev single MCP server with tsx watch

# Registry
tsx scripts/generate-registry.ts   # Scan mcp/*/package.json + skills/*/SKILL.md → registry.json

# Skills
./skills/install.sh <project-path>                        # Install all skills via symlink
./skills/install.sh <project-path> quick-review verify    # Install specific skills
./skills/install.sh --list                                # List available skills

# CLI (Phase 2, local dev)
cd cli && pnpm link --global    # Enable `jetsong` command locally
npx jetsong install <package> --tool cursor --project ~/workspace/api
npx jetsong list --type mcp

# MCP testing
npx @modelcontextprotocol/inspector node mcp/jira-mcp/dist/index.js
```

## Architecture

### Monorepo Layout

- **`src/app/`** — Next.js App Router pages (landing, `/market` marketplace, `/setup` web onboarding)
- **`mcp/`** — MCP server packages (pnpm workspace members matching `*-mcp`)
  - `mcp/shared/` — Common utilities (auth, logger) shared across MCP servers
  - `mcp/jira-mcp/`, `mcp/gitlab-mcp/`, `mcp/loki-mcp/` — Individual MCP servers
- **`skills/`** — Skill packages, each containing `SKILL.md` (frontmatter + instructions) and `package.json`
- **`cli/`** — `npx jetsong` CLI (pnpm workspace member)
- **`scripts/`** — Build scripts, notably `generate-registry.ts`
- **`data/`** — JSON-based storage for stats and reviews (Phase 2)

### Key Concepts

**`jetsong` metadata field**: Each MCP/Skill `package.json` includes a `jetsong` object with `displayName`, `icon`, `type` ("mcp"|"skill"), `compatibility` map, and `envFields` (for MCP token configuration). This is the data source for `registry.json` and the marketplace UI.

**`registry.json`**: Auto-generated at prebuild by scanning all packages. Consumed by the marketplace web UI and CLI. Not hand-edited.

**Token handling**: All tokens stay local. The `/setup` web page is CSR-only (`'use client'`) — tokens never leave the browser. Shell scripts write to `~/.config/jetsong-mcp/.env.*`.

**Tool-neutral design**: Each package declares compatibility per tool. Configuration generation produces tool-specific formats (JSON for Claude Code/Cursor, TOML for Codex).

### MCP Server Pattern

All MCP servers follow the same structure:
- Entry: `src/index.ts` (server creation + tool registration via `@modelcontextprotocol/sdk`)
- Tools in `src/tools/` (one file per tool)
- Types in `src/types.ts`
- Auth via `mcp/shared/auth.ts`
- Logging to stderr per MCP protocol convention

### Data Flow

```
mcp/*/package.json + skills/*/SKILL.md
  → scripts/generate-registry.ts (prebuild)
  → registry.json
  → /market pages (RSC import) + CLI (HTTP fetch)
```

## Language

Project documentation and commit messages are in Korean. Code (variable names, comments in source) is in English.
