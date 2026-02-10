#!/usr/bin/env node
import { Command } from "commander";
import { registerListCommand } from "./commands/list.js";
import { registerInfoCommand } from "./commands/info.js";
import { registerSearchCommand } from "./commands/search.js";
import { registerInstallCommand } from "./commands/install.js";

const program = new Command();

program
  .name("jetsong")
  .description("MCP/Skill 패키지 관리 CLI")
  .version("0.1.0");

registerListCommand(program);
registerInfoCommand(program);
registerSearchCommand(program);
registerInstallCommand(program);

program.parse();
