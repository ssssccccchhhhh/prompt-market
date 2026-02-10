import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toToolError } from "../../../shared/http.js";
import { formatDate } from "../../../shared/format.js";
import type { JiraClient } from "../client.js";

export function registerCommentTools(
  server: McpServer,
  client: JiraClient,
): void {
  // ── jira_add_comment ────────────────────────────────────────────────
  server.tool(
    "jira_add_comment",
    "Add a comment to a Jira issue",
    {
      issueKey: z.string().describe("Issue key, e.g. IT2026-123"),
      body: z.string().describe("Comment text"),
    },
    async ({ issueKey, body }) => {
      try {
        const comment = await client.addComment(issueKey, body);
        const text = [
          `Comment added to ${issueKey}.`,
          `  Author: ${comment.author.displayName}`,
          `  Created: ${formatDate(comment.created)}`,
          `  ID: ${comment.id}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );
}
