import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validateEnv } from "../../shared/env.js";
import { log } from "../../shared/logger.js";
import { GitLabClient } from "./client.js";
import { registerMRTools } from "./tools/mr.js";
import { registerPipelineTools } from "./tools/pipeline.js";
import { registerSearchTools } from "./tools/search.js";

const env = validateEnv("gitlab-mcp", ["GITLAB_URL", "GITLAB_TOKEN"]);

const server = new McpServer({ name: "gitlab-mcp", version: "0.1.0" });
const client = new GitLabClient(env.GITLAB_URL, env.GITLAB_TOKEN);

registerMRTools(server, client);
registerPipelineTools(server, client);
registerSearchTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
log("gitlab-mcp", "Server started");
