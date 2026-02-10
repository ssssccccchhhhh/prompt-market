import type { Command } from "commander";
import chalk from "chalk";
import { findPackage } from "../lib/registry.js";

const TOOL_NAMES: Record<string, string> = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
  codex: "Codex",
  opencode: "OpenCode",
  antigravity: "Antigravity",
};

/**
 * info 커맨드를 등록합니다.
 */
export function registerInfoCommand(program: Command): void {
  program
    .command("info <id>")
    .description("패키지 상세 정보 조회")
    .action((id: string) => {
      try {
        const pkg = findPackage(id);

        if (!pkg) {
          console.error(chalk.red(`\n  패키지를 찾을 수 없습니다: ${id}\n`));
          process.exit(1);
        }

        console.log();
        console.log(
          chalk.bold(`  ${pkg.icon} ${pkg.name}`) +
            chalk.dim(` v${pkg.version}`)
        );
        console.log(chalk.dim(`  ${"─".repeat(50)}`));
        console.log();

        // 기본 정보
        console.log(`  ${chalk.dim("타입:")}      ${
          pkg.type === "mcp"
            ? chalk.green("MCP Server")
            : chalk.cyan("Skill")
        }`);
        console.log(`  ${chalk.dim("설명:")}      ${pkg.description}`);
        console.log(`  ${chalk.dim("작성자:")}    ${pkg.author}`);
        console.log(`  ${chalk.dim("버전:")}      ${pkg.version}`);
        console.log(
          `  ${chalk.dim("태그:")}      ${pkg.tags.map((t) => chalk.blue(`#${t}`)).join(" ")}`
        );
        console.log();

        // 호환성
        console.log(`  ${chalk.dim("호환성:")}`);
        for (const [key, label] of Object.entries(TOOL_NAMES)) {
          const supported =
            pkg.compatibility[key as keyof typeof pkg.compatibility];
          const icon = supported ? chalk.green("✓") : chalk.red("✗");
          console.log(`    ${icon} ${label}`);
        }
        console.log();

        // 통계
        console.log(
          `  ${chalk.dim("다운로드:")}  ${pkg.stats.installs}    ${chalk.dim("스타:")} ${pkg.stats.stars}`
        );

        // MCP 전용 정보
        if (pkg.type === "mcp" && pkg.envFields && pkg.envFields.length > 0) {
          console.log();
          console.log(`  ${chalk.dim("환경 변수:")}`);
          for (const field of pkg.envFields) {
            const parts: string[] = [`    ${chalk.yellow(field.key)}`];
            if (field.default) {
              parts.push(chalk.dim(`(기본값: ${field.default})`));
            }
            if (field.placeholder) {
              parts.push(chalk.dim(`(예: ${field.placeholder})`));
            }
            if (field.sensitive) {
              parts.push(chalk.red("[민감]"));
            }
            if (field.editable === false) {
              parts.push(chalk.dim("[고정]"));
            }
            console.log(parts.join(" "));
          }
        }

        if (pkg.tokenGuide) {
          console.log();
          console.log(
            `  ${chalk.dim("토큰 가이드:")} ${chalk.underline(pkg.tokenGuide)}`
          );
        }

        console.log();
      } catch (error) {
        console.error(
          chalk.red(
            `오류: ${error instanceof Error ? error.message : String(error)}`
          )
        );
        process.exit(1);
      }
    });
}
