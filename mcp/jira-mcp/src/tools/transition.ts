import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toToolError } from "../../../shared/http.js";
import type { JiraClient } from "../client.js";

export function registerTransitionTools(
  server: McpServer,
  client: JiraClient,
): void {
  // ── jira_transition ─────────────────────────────────────────────────
  server.tool(
    "jira_transition",
    "Move a Jira issue to a new status",
    {
      issueKey: z.string().describe("Issue key, e.g. IT2026-123"),
      statusName: z.string().describe("Target status name (e.g., 'In Progress', 'Done')"),
    },
    async ({ issueKey, statusName }) => {
      try {
        const transitions = await client.getTransitions(issueKey);

        // Find matching transition (case-insensitive)
        const match = transitions.find(
          (t) => t.name.toLowerCase() === statusName.toLowerCase(),
        );

        if (!match) {
          const available = transitions.map((t) => `  - "${t.name}" → ${t.to.name}`).join("\n");
          const text = [
            `No transition matching "${statusName}" found for ${issueKey}.`,
            "",
            "Available transitions:",
            available || "  (none)",
          ].join("\n");
          return { content: [{ type: "text", text }], isError: true };
        }

        await client.doTransition(issueKey, match.id);

        const text = `${issueKey} transitioned to "${match.to.name}" via "${match.name}".`;
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );
}
