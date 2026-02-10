import {
  existsSync,
  mkdirSync,
  symlinkSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { homedir } from "node:os";
import { getProjectRoot, findPackage } from "./registry.js";
import {
  generateClaudeConfig,
  generateCursorConfig,
  generateCodexConfig,
} from "./config-gen.js";

/**
 * Skill을 프로젝트에 심링크로 설치합니다.
 * 대상: <projectPath>/.claude/commands/<id>.md
 * 소스: <project-root>/skills/<id>/SKILL.md
 */
export function installSkill(packageId: string, projectPath: string): void {
  const projectRoot = getProjectRoot();
  const skillSource = resolve(projectRoot, "skills", packageId, "SKILL.md");

  if (!existsSync(skillSource)) {
    throw new Error(`스킬 파일을 찾을 수 없습니다: ${skillSource}`);
  }

  const commandsDir = resolve(projectPath, ".claude", "commands");
  mkdirSync(commandsDir, { recursive: true });

  const symlinkPath = resolve(commandsDir, `${packageId}.md`);

  if (existsSync(symlinkPath)) {
    throw new Error(`이미 설치되어 있습니다: ${symlinkPath}`);
  }

  symlinkSync(skillSource, symlinkPath, "file");
}

/**
 * 환경 변수를 ~/.config/jetsong-mcp/.env.<id> 에 저장합니다.
 */
export function saveEnvFile(
  packageId: string,
  envValues: Record<string, string>
): string {
  const configDir = resolve(homedir(), ".config", "jetsong-mcp");
  mkdirSync(configDir, { recursive: true });

  const envPath = resolve(configDir, `.env.${packageId}`);
  const lines = Object.entries(envValues).map(
    ([key, value]) => `${key}=${value}`
  );
  writeFileSync(envPath, lines.join("\n") + "\n", "utf-8");

  return envPath;
}

/**
 * MCP 서버를 대상 도구에 설치합니다.
 * - cursor: ~/.cursor/mcp.json에 직접 병합
 * - claude-code: JSON 설정 문자열 반환 (수동 붙여넣기)
 * - codex: TOML 설정 문자열 반환 (수동 붙여넣기)
 */
export function installMcp(
  packageId: string,
  tool: string,
  envValues: Record<string, string>
): { config: string; written?: string } {
  const pkg = findPackage(packageId);
  if (!pkg) {
    throw new Error(`패키지를 찾을 수 없습니다: ${packageId}`);
  }

  // 환경 변수 파일 저장
  saveEnvFile(packageId, envValues);

  switch (tool) {
    case "cursor": {
      const config = generateCursorConfig(packageId, envValues);
      const cursorConfigPath = resolve(homedir(), ".cursor", "mcp.json");
      mergeCursorConfig(cursorConfigPath, packageId, envValues);
      return { config, written: cursorConfigPath };
    }
    case "claude-code": {
      const config = generateClaudeConfig(packageId, envValues);
      return { config };
    }
    case "codex": {
      const config = generateCodexConfig(packageId, envValues);
      return { config };
    }
    default:
      throw new Error(`지원하지 않는 도구입니다: ${tool}`);
  }
}

/**
 * Cursor mcp.json에 MCP 서버 설정을 병합합니다.
 */
function mergeCursorConfig(
  configPath: string,
  mcpId: string,
  envValues: Record<string, string>
): void {
  let existing: Record<string, unknown> = {};

  if (existsSync(configPath)) {
    const content = readFileSync(configPath, "utf-8");
    existing = JSON.parse(content) as Record<string, unknown>;
  } else {
    mkdirSync(dirname(configPath), { recursive: true });
  }

  if (!existing.mcpServers || typeof existing.mcpServers !== "object") {
    existing.mcpServers = {};
  }

  const parsed = JSON.parse(
    generateCursorConfig(mcpId, envValues)
  ) as Record<string, unknown>;

  const newServers = (parsed.mcpServers ?? {}) as Record<string, unknown>;
  const existingServers = existing.mcpServers as Record<string, unknown>;

  Object.assign(existingServers, newServers);

  writeFileSync(configPath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
}
