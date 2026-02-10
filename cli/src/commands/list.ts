import type { Command } from "commander";
import chalk from "chalk";
import { filterPackages, loadRegistry } from "../lib/registry.js";
import type { RegistryPackage } from "../lib/registry.js";

const TOOL_KEYS = [
  "claude-code",
  "cursor",
  "codex",
  "opencode",
  "antigravity",
] as const;
const TOOL_LABELS = ["CC", "Cu", "Cx", "OC", "AG"];

/**
 * 패키지 목록을 포맷된 테이블로 출력합니다.
 */
export function printPackageTable(packages: RegistryPackage[]): void {
  if (packages.length === 0) {
    console.log(chalk.yellow("\n  검색 결과가 없습니다.\n"));
    return;
  }

  const totalCount = packages.length;
  console.log(
    chalk.bold(`\n  Jetsong Packages (${totalCount})\n`)
  );

  // 헤더
  const header = [
    padRight("Type", 7),
    padRight("Name", 22),
    padRight("Version", 9),
    padRight("DL", 5),
    padRight("Star", 5),
    TOOL_LABELS.map((l) => padRight(l, 3)).join(""),
  ].join("");

  console.log(`  ${chalk.dim(header)}`);
  console.log(`  ${chalk.dim("─".repeat(62))}`);

  // 패키지 행
  for (const pkg of packages) {
    const typeLabel =
      pkg.type === "mcp"
        ? chalk.green(padRight("MCP", 7))
        : chalk.cyan(padRight("Skill", 7));

    const nameLabel = padRight(`${pkg.icon} ${pkg.name}`, 22);
    const versionLabel = padRight(pkg.version, 9);
    const dlLabel = padRight(String(pkg.stats.installs), 5);
    const starLabel = padRight(String(pkg.stats.stars), 5);

    const compat = TOOL_KEYS.map((key) => {
      const supported =
        pkg.compatibility[key as keyof typeof pkg.compatibility];
      return padRight(supported ? chalk.green("✓") : " ", 3);
    }).join("");

    console.log(
      `  ${typeLabel}${nameLabel}${versionLabel}${dlLabel}${starLabel}${compat}`
    );
  }

  console.log();
}

function padRight(str: string, len: number): string {
  // chalk 색상 코드는 보이지 않는 문자이므로 실제 출력 길이를 기반으로 패딩
  const visibleLength = stripAnsi(str).length;
  if (visibleLength >= len) return str;
  return str + " ".repeat(len - visibleLength);
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*m/g, "");
}

/**
 * list 커맨드를 등록합니다.
 */
export function registerListCommand(program: Command): void {
  program
    .command("list")
    .description("사용 가능한 패키지 목록 조회")
    .option("--type <type>", "패키지 타입 필터 (mcp, skill)")
    .action((options: { type?: string }) => {
      try {
        const packages = filterPackages(options.type);
        printPackageTable(packages);
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
