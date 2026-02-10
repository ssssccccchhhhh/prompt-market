import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toToolError } from "../../../shared/http.js";
import { formatJiraIssue, truncate, formatDate } from "../../../shared/format.js";
import type { JiraClient } from "../client.js";

export function registerIssueTools(
  server: McpServer,
  client: JiraClient,
  projectKey: string,
): void {
  // ── jira_get_issue ──────────────────────────────────────────────────
  server.tool(
    "jira_get_issue",
    "Get detailed information about a Jira issue",
    {
      issueKey: z.string().describe("Issue key, e.g. IT2026-123"),
    },
    async ({ issueKey }) => {
      try {
        const issue = await client.getIssue(issueKey);
        const f = issue.fields;

        const lines: string[] = [
          formatJiraIssue(issue),
          `  Type: ${f.issuetype.name}`,
          `  Project: ${f.project.key}`,
          `  Reporter: ${f.reporter?.displayName ?? "Unknown"}`,
          `  Labels: ${f.labels && f.labels.length > 0 ? f.labels.join(", ") : "None"}`,
          `  Created: ${formatDate(f.created)}`,
        ];

        // Description
        if (f.description) {
          const descText = typeof f.description === "string"
            ? f.description
            : extractAdfText(f.description);
          lines.push("", "--- Description ---", truncate(descText, 1000));
        }

        // Recent comments
        if (f.comment && f.comment.comments.length > 0) {
          const recentComments = f.comment.comments.slice(-5);
          lines.push("", `--- Comments (${f.comment.total} total, showing last ${recentComments.length}) ---`);
          for (const c of recentComments) {
            const commentBody = typeof c.body === "string"
              ? c.body
              : extractAdfText(c.body);
            lines.push(
              `  [${formatDate(c.created)}] ${c.author.displayName}:`,
              `    ${truncate(commentBody, 300)}`,
            );
          }
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );

  // ── jira_create_issue ───────────────────────────────────────────────
  server.tool(
    "jira_create_issue",
    "Create a new Jira issue",
    {
      summary: z.string().describe("Issue summary/title"),
      issueType: z.string().default("Task").describe("Issue type (default: Task)"),
      description: z.string().optional().describe("Issue description (plain text)"),
      assigneeId: z.string().optional().describe("Assignee account ID"),
    },
    async ({ summary, issueType, description, assigneeId }) => {
      try {
        const issue = await client.createIssue(summary, issueType, description, assigneeId);
        const text = [
          `Issue created successfully!`,
          `  Key: ${issue.key}`,
          `  URL: ${client.getIssueUrl(issue.key)}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );
}

/**
 * Extract plain text from Atlassian Document Format (ADF).
 * Handles the common case of nested paragraph/text nodes.
 */
function extractAdfText(adf: unknown): string {
  if (typeof adf === "string") return adf;
  if (!adf || typeof adf !== "object") return "";

  const doc = adf as { content?: Array<{ content?: Array<{ text?: string }> }> };
  if (!doc.content) return JSON.stringify(adf);

  const parts: string[] = [];
  for (const block of doc.content) {
    if (block.content) {
      for (const inline of block.content) {
        if (inline.text) {
          parts.push(inline.text);
        }
      }
    }
    parts.push("\n");
  }
  return parts.join("").trim();
}
