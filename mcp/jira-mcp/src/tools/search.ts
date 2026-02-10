import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toToolError } from "../../../shared/http.js";
import { formatJiraIssue } from "../../../shared/format.js";
import type { JiraClient } from "../client.js";

export function registerSearchTools(
  server: McpServer,
  client: JiraClient,
  projectKey: string,
): void {
  // ── jira_search ──────────────────────────────────────────────────────
  server.tool(
    "jira_search",
    "Run a JQL query against Jira",
    {
      jql: z.string().describe("JQL query string"),
      maxResults: z.number().default(20).describe("Max results (default 20)"),
    },
    async ({ jql, maxResults }) => {
      try {
        const result = await client.search(jql, maxResults);
        if (result.issues.length === 0) {
          return { content: [{ type: "text", text: "No issues found." }] };
        }
        const text = [
          `Found ${result.total} issue(s) (showing ${result.issues.length}):`,
          "",
          ...result.issues.map(formatJiraIssue),
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );

  // ── jira_my_issues ──────────────────────────────────────────────────
  server.tool(
    "jira_my_issues",
    "Get Jira issues assigned to the current user",
    {
      status: z.string().optional().describe("Filter by status name (e.g., 'In Progress')"),
      maxResults: z.number().default(20).describe("Max results (default 20)"),
    },
    async ({ status, maxResults }) => {
      try {
        let jql = `assignee = currentUser() AND project = ${projectKey}`;
        if (status) {
          jql += ` AND status = '${status}'`;
        }
        jql += " ORDER BY updated DESC";

        const result = await client.search(jql, maxResults);
        if (result.issues.length === 0) {
          return { content: [{ type: "text", text: "No issues assigned to you." }] };
        }
        const text = [
          `Your issues (${result.total} total, showing ${result.issues.length}):`,
          "",
          ...result.issues.map(formatJiraIssue),
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );

  // ── jira_sprint_issues ──────────────────────────────────────────────
  server.tool(
    "jira_sprint_issues",
    "Get issues in the active sprint",
    {
      boardId: z.number().optional().describe("Board ID (auto-detects first board if omitted)"),
    },
    async ({ boardId }) => {
      try {
        let resolvedBoardId = boardId;

        if (!resolvedBoardId) {
          const boards = await client.getBoards();
          if (boards.values.length === 0) {
            return { content: [{ type: "text", text: "No boards found." }] };
          }
          resolvedBoardId = boards.values[0].id;
        }

        const sprint = await client.getActiveSprint(resolvedBoardId);
        if (!sprint) {
          return {
            content: [{ type: "text", text: `No active sprint found for board ${resolvedBoardId}.` }],
          };
        }

        const result = await client.getSprintIssues(sprint.id);
        if (result.issues.length === 0) {
          return {
            content: [{ type: "text", text: `Sprint "${sprint.name}" has no issues.` }],
          };
        }

        const text = [
          `Sprint: ${sprint.name} (${sprint.state})`,
          `Issues: ${result.total} total, showing ${result.issues.length}`,
          "",
          ...result.issues.map(formatJiraIssue),
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );
}
