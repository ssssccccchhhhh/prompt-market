import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toToolError } from "../../../shared/http.js";
import { truncate } from "../../../shared/format.js";
import type { GitLabClient } from "../client.js";

export function registerSearchTools(server: McpServer, client: GitLabClient): void {
  server.tool(
    "gitlab_search_code",
    "Search code across repositories",
    {
      query: z.string().describe("Search query string"),
      projectId: z.string().optional().describe("Limit search to a specific project (ID or path)"),
    },
    async ({ query, projectId }) => {
      try {
        const results = await client.searchCode(query, projectId);
        if (results.length === 0) {
          const scopeNote = projectId ? ` in project '${projectId}'` : "";
          return {
            content: [{ type: "text", text: `No results found for '${query}'${scopeNote}.` }],
          };
        }

        const formatted = results
          .map((r) => {
            const snippet = truncate(r.data, 500);
            return [
              `${r.path} (line ${r.startline})`,
              `  Project ID: ${r.project_id} | Ref: ${r.ref}`,
              `  ---`,
              `  ${snippet}`,
            ].join("\n");
          })
          .join("\n\n");

        return {
          content: [{ type: "text", text: `Found ${results.length} result(s) for '${query}':\n\n${formatted}` }],
        };
      } catch (err) {
        return toToolError(err);
      }
    },
  );
}
