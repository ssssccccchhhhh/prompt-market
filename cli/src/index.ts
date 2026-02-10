#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("jetsong")
  .description("MCP/Skill 패키지 관리 CLI")
  .version("0.1.0");

program
  .command("install <package>")
  .description("패키지 설치")
  .option("--tool <tool>", "대상 도구 (claude-code, cursor, codex, opencode)")
  .option("--project <path>", "프로젝트 경로")
  .action((pkg, options) => {
    console.log(`TODO: install ${pkg}`, options);
  });

program
  .command("list")
  .description("사용 가능한 패키지 목록")
  .option("--type <type>", "패키지 타입 (mcp, skill)")
  .action((options) => {
    console.log("TODO: list packages", options);
  });

program.parse();
