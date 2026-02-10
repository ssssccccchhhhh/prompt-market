import type { Command } from "commander";
import chalk from "chalk";
import { filterPackages } from "../lib/registry.js";
import { printPackageTable } from "./list.js";

/**
 * search 커맨드를 등록합니다.
 */
export function registerSearchCommand(program: Command): void {
  program
    .command("search <query>")
    .description("패키지 검색 (이름, 설명, 태그)")
    .option("--type <type>", "패키지 타입 필터 (mcp, skill)")
    .action((query: string, options: { type?: string }) => {
      try {
        const packages = filterPackages(options.type, query);

        if (packages.length === 0) {
          console.log(
            chalk.yellow(`\n  "${query}"에 대한 검색 결과가 없습니다.\n`)
          );
          return;
        }

        console.log(
          chalk.dim(
            `\n  "${query}" 검색 결과:`
          )
        );
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
