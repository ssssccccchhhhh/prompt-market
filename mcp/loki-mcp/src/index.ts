import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validateEnv } from "../../shared/env.js";
import { log } from "../../shared/logger.js";
import { LokiClient } from "./client.js";
import { registerQueryTools } from "./tools/query.js";

const env = validateEnv("loki-mcp", ["LOKI_URL", "LOKI_TOKEN"]);

const server = new McpServer({ name: "loki-mcp", version: "0.1.0" });
const client = new LokiClient(env.LOKI_URL, env.LOKI_TOKEN);

registerQueryTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
log("loki-mcp", "Server started");
