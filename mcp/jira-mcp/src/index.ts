import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validateEnv } from "../../shared/env.js";
import { log } from "../../shared/logger.js";
import { JiraClient } from "./client.js";
import { registerSearchTools } from "./tools/search.js";
import { registerIssueTools } from "./tools/issue.js";
import { registerTransitionTools } from "./tools/transition.js";
import { registerCommentTools } from "./tools/comment.js";

const env = validateEnv("jira-mcp", [
  "JIRA_URL",
  "JIRA_EMAIL",
  "JIRA_API_TOKEN",
  "JIRA_PROJECT_KEY",
]);

const server = new McpServer({ name: "jira-mcp", version: "0.1.0" });
const client = new JiraClient(
  env.JIRA_URL,
  env.JIRA_EMAIL,
  env.JIRA_API_TOKEN,
  env.JIRA_PROJECT_KEY,
);

registerSearchTools(server, client, env.JIRA_PROJECT_KEY);
registerIssueTools(server, client, env.JIRA_PROJECT_KEY);
registerTransitionTools(server, client);
registerCommentTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
log("jira-mcp", "Server started");
