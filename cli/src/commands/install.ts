import type { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { input, select, password } from "@inquirer/prompts";
import { findPackage } from "../lib/registry.js";
import type { EnvField } from "../lib/registry.js";
import { installSkill, installMcp } from "../lib/installer.js";
import { resolve } from "node:path";

const SUPPORTED_TOOLS = [
  { name: "Claude Code", value: "claude-code" },
  { name: "Cursor", value: "cursor" },
  { name: "Codex", value: "codex" },
] as const;

/**
 * 환경 변수 값을 인터랙티브하게 입력받습니다.
 */
async function promptEnvValues(
  envFields: EnvField[]
): Promise<Record<string, string>> {
  const values: Record<string, string> = {};

  for (const field of envFields) {
    // editable이 false이고 default가 있으면 자동 설정
    if (field.editable === false && field.default) {
      values[field.key] = field.default;
      console.log(
        chalk.dim(`  ${field.key} = ${field.default} (고정값)`)
      );
      continue;
    }

    const message = field.placeholder
      ? `${field.key} (예: ${field.placeholder})`
      : field.key;

    if (field.sensitive) {
      values[field.key] = await password({
        message: `  ${message}:`,
        mask: "*",
      });
    } else {
      values[field.key] = await input({
        message: `  ${message}:`,
        default: field.default,
      });
    }
  }

  return values;
}

/**
 * install 커맨드를 등록합니다.
 */
export function registerInstallCommand(program: Command): void {
  program
    .command("install <id>")
    .description("패키지 설치")
    .option(
      "--tool <tool>",
      "대상 도구 (claude-code, cursor, codex)"
    )
    .option("--project <path>", "프로젝트 경로 (Skill 설치 시 필수)")
    .action(async (id: string, options: { tool?: string; project?: string }) => {
      try {
        const pkg = findPackage(id);

        if (!pkg) {
          console.error(
            chalk.red(`\n  패키지를 찾을 수 없습니다: ${id}\n`)
          );
          process.exit(1);
        }

        console.log();
        console.log(
          chalk.bold(`  ${pkg.icon} ${pkg.name}`) +
            chalk.dim(` v${pkg.version} 설치`)
        );
        console.log(chalk.dim(`  ${"─".repeat(40)}`));
        console.log();

        if (pkg.type === "skill") {
          await handleSkillInstall(id, pkg.name, options.project);
        } else {
          await handleMcpInstall(id, pkg, options.tool);
        }
      } catch (error) {
        if ((error as Record<string, unknown>).name === "ExitPromptError") {
          console.log(chalk.dim("\n  설치가 취소되었습니다.\n"));
          return;
        }
        console.error(
          chalk.red(
            `\n  오류: ${error instanceof Error ? error.message : String(error)}\n`
          )
        );
        process.exit(1);
      }
    });
}

/**
 * Skill 설치를 처리합니다.
 */
async function handleSkillInstall(
  id: string,
  name: string,
  projectPath?: string
): Promise<void> {
  if (!projectPath) {
    projectPath = await input({
      message: "  프로젝트 경로:",
      default: process.cwd(),
    });
  }

  const resolvedPath = resolve(projectPath);
  const spinner = ora({
    text: `${name} 스킬 설치 중...`,
    indent: 2,
  }).start();

  try {
    installSkill(id, resolvedPath);
    spinner.succeed(`${name} 스킬이 설치되었습니다.`);
    console.log(
      chalk.dim(
        `  -> ${resolvedPath}/.claude/commands/${id}.md`
      )
    );
    console.log();
  } catch (error) {
    spinner.fail("설치 실패");
    throw error;
  }
}

/**
 * MCP 서버 설치를 처리합니다.
 */
async function handleMcpInstall(
  id: string,
  pkg: { name: string; envFields?: EnvField[]; tokenGuide?: string },
  tool?: string
): Promise<void> {
  // 도구 선택
  if (!tool) {
    tool = await select({
      message: "  대상 도구 선택:",
      choices: SUPPORTED_TOOLS.map((t) => ({
        name: t.name,
        value: t.value,
      })),
    });
  }

  // 토큰 가이드
  if (pkg.tokenGuide) {
    console.log(
      chalk.dim(`  토큰 발급 가이드: ${chalk.underline(pkg.tokenGuide)}`)
    );
    console.log();
  }

  // 환경 변수 입력
  let envValues: Record<string, string> = {};
  if (pkg.envFields && pkg.envFields.length > 0) {
    console.log(chalk.dim("  환경 변수를 입력하세요:"));
    console.log();
    envValues = await promptEnvValues(pkg.envFields);
    console.log();
  }

  // 설치 실행
  const spinner = ora({
    text: `${pkg.name} MCP 서버를 ${tool}에 설치 중...`,
    indent: 2,
  }).start();

  try {
    const result = installMcp(id, tool!, envValues);
    spinner.succeed(`${pkg.name} MCP 서버가 설치되었습니다.`);

    if (result.written) {
      // Cursor: 파일에 직접 기록됨
      console.log(
        chalk.green(`\n  설정이 저장되었습니다: ${result.written}`)
      );
    } else {
      // Claude Code / Codex: 설정 문자열 출력
      console.log(
        chalk.dim(
          `\n  아래 설정을 ${tool} 설정 파일에 추가하세요:\n`
        )
      );
      console.log(chalk.white(result.config));
    }

    console.log();
  } catch (error) {
    spinner.fail("설치 실패");
    throw error;
  }
}
