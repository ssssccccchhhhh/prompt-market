import type { RegistryPackage } from '@/app/market/types';

/**
 * Generate JSON config for Claude Code / Cursor / OpenCode / Antigravity
 */
export function generateJsonConfig(
  selectedMcps: RegistryPackage[],
  envValues: Record<string, Record<string, string>>,
  projectRoot: string = '{PROJECT_ROOT}'
): string {
  const mcpServers: Record<string, unknown> = {};

  for (const mcp of selectedMcps) {
    const env: Record<string, string> = {};
    const mcpEnvValues = envValues[mcp.id] ?? {};

    for (const field of mcp.envFields ?? []) {
      const value = mcpEnvValues[field.key] ?? field.default ?? field.placeholder ?? '';
      env[field.key] = value;
    }

    mcpServers[mcp.id] = {
      command: 'node',
      args: [`${projectRoot}/mcp/${mcp.id}-mcp/dist/${mcp.id}-mcp/src/index.js`],
      env,
    };
  }

  return JSON.stringify({ mcpServers }, null, 2);
}

/**
 * Generate TOML config for Codex
 */
export function generateTomlConfig(
  selectedMcps: RegistryPackage[],
  envValues: Record<string, Record<string, string>>,
  projectRoot: string = '{PROJECT_ROOT}'
): string {
  const lines: string[] = [];

  for (const mcp of selectedMcps) {
    const mcpEnvValues = envValues[mcp.id] ?? {};

    lines.push(`[mcp_servers.${mcp.id}]`);
    lines.push(`command = "node"`);
    lines.push(
      `args = ["${projectRoot}/mcp/${mcp.id}-mcp/dist/${mcp.id}-mcp/src/index.js"]`
    );
    lines.push('');
    lines.push(`[mcp_servers.${mcp.id}.env]`);

    for (const field of mcp.envFields ?? []) {
      const value = mcpEnvValues[field.key] ?? field.default ?? field.placeholder ?? '';
      lines.push(`${field.key} = "${value}"`);
    }

    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
