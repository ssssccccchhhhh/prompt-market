import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "loki-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// TODO: 도구 등록 (Phase 1.2)

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
