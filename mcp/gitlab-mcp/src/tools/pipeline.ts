import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toToolError } from "../../../shared/http.js";
import { formatDate } from "../../../shared/format.js";
import type { GitLabClient } from "../client.js";

export function registerPipelineTools(server: McpServer, client: GitLabClient): void {
  server.tool(
    "gitlab_pipelines",
    "List recent pipelines for a project",
    {
      projectId: z.string().describe("Project ID or path (e.g., 'group/project')"),
      ref: z.string().optional().describe("Branch name to filter by"),
    },
    async ({ projectId, ref }) => {
      try {
        const pipelines = await client.getPipelines(projectId, ref);
        if (pipelines.length === 0) {
          const refNote = ref ? ` for ref '${ref}'` : "";
          return {
            content: [{ type: "text", text: `No pipelines found${refNote}.` }],
          };
        }

        const formatted = pipelines
          .map((p) => {
            const shaShort = p.sha.slice(0, 8);
            return [
              `#${p.id} [${p.status.toUpperCase()}]`,
              `  Ref: ${p.ref} (${shaShort})`,
              `  Source: ${p.source}`,
              `  Created: ${formatDate(p.created_at)}`,
              `  URL: ${p.web_url}`,
            ].join("\n");
          })
          .join("\n\n");

        return {
          content: [{ type: "text", text: `Found ${pipelines.length} pipeline(s):\n\n${formatted}` }],
        };
      } catch (err) {
        return toToolError(err);
      }
    },
  );
}
