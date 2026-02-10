import { getProjectRoot } from "./registry.js";
import { resolve } from "node:path";

/**
 * MCP 서버의 node 엔트리 경로를 반환합니다.
 * 패턴: <project-root>/mcp/<id>-mcp/dist/<id>-mcp/src/index.js
 */
function getMcpEntryPath(mcpId: string): string {
  return resolve(
    getProjectRoot(),
    "mcp",
    `${mcpId}-mcp`,
    "dist",
    `${mcpId}-mcp`,
    "src",
    "index.js"
  );
}

/**
 * node 실행 경로를 반환합니다.
 */
function getNodePath(): string {
  return process.execPath;
}

/**
 * Claude Code용 MCP 설정 JSON을 생성합니다.
 */
export function generateClaudeConfig(
  mcpId: string,
  envValues: Record<string, string>
): string {
  const config = {
    mcpServers: {
      [`jetsong-${mcpId}`]: {
        command: "node",
        args: [getMcpEntryPath(mcpId)],
        env: envValues,
      },
    },
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Cursor용 MCP 설정 JSON을 생성합니다.
 */
export function generateCursorConfig(
  mcpId: string,
  envValues: Record<string, string>
): string {
  const config = {
    mcpServers: {
      [`jetsong-${mcpId}`]: {
        command: getNodePath(),
        args: [getMcpEntryPath(mcpId)],
        env: envValues,
      },
    },
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Codex용 MCP 설정 TOML을 생성합니다.
 */
export function generateCodexConfig(
  mcpId: string,
  envValues: Record<string, string>
): string {
  const entryPath = getMcpEntryPath(mcpId);
  const lines: string[] = [];

  lines.push(`[mcp-servers.jetsong-${mcpId}]`);
  lines.push(`command = "${getNodePath()}"`);
  lines.push(`args = ["${entryPath}"]`);

  if (Object.keys(envValues).length > 0) {
    lines.push("");
    lines.push(`[mcp-servers.jetsong-${mcpId}.env]`);
    for (const [key, value] of Object.entries(envValues)) {
      lines.push(`${key} = "${value}"`);
    }
  }

  return lines.join("\n");
}
