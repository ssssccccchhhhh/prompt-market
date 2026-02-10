import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toToolError } from "../../../shared/http.js";
import { formatGitLabMR, formatDate, truncate } from "../../../shared/format.js";
import type { GitLabClient } from "../client.js";

export function registerMRTools(server: McpServer, client: GitLabClient): void {
  // --- gitlab_my_mrs ---
  server.tool(
    "gitlab_my_mrs",
    "List my merge requests",
    {
      state: z
        .enum(["opened", "closed", "merged", "all"])
        .default("opened")
        .describe("Filter by MR state"),
      scope: z
        .enum(["assigned_to_me", "created_by_me"])
        .default("assigned_to_me")
        .describe("Filter by assignment scope"),
    },
    async ({ state, scope }) => {
      try {
        const mrs = await client.getMyMRs(state, scope);
        if (mrs.length === 0) {
          return {
            content: [{ type: "text", text: `No merge requests found (state=${state}, scope=${scope}).` }],
          };
        }
        const formatted = mrs.map((mr) => formatGitLabMR(mr)).join("\n\n");
        return {
          content: [{ type: "text", text: `Found ${mrs.length} merge request(s):\n\n${formatted}` }],
        };
      } catch (err) {
        return toToolError(err);
      }
    },
  );

  // --- gitlab_mr_detail ---
  server.tool(
    "gitlab_mr_detail",
    "Get MR details including description, labels, reviewers, and merge status",
    {
      projectId: z.string().describe("Project ID or path (e.g., 'group/project')"),
      mrIid: z.number().describe("MR IID number"),
    },
    async ({ projectId, mrIid }) => {
      try {
        const mr = await client.getMRDetail(projectId, mrIid);
        const reviewerNames = mr.reviewers?.map((r) => r.username).join(", ") || "None";
        const labels = mr.labels?.join(", ") || "None";
        const lines = [
          `!${mr.iid} ${mr.title}`,
          `  State: ${mr.state}${mr.draft ? " (Draft)" : ""}`,
          `  Author: ${mr.author.username}`,
          `  Assignee: ${mr.assignee?.username ?? "Unassigned"}`,
          `  Reviewers: ${reviewerNames}`,
          `  Branch: ${mr.source_branch} → ${mr.target_branch}`,
          `  Labels: ${labels}`,
          `  Merge Status: ${mr.merge_status}`,
          `  Has Conflicts: ${mr.has_conflicts ? "Yes" : "No"}`,
          `  Created: ${formatDate(mr.created_at)}`,
          `  Updated: ${formatDate(mr.updated_at)}`,
          mr.merged_at ? `  Merged: ${formatDate(mr.merged_at)}` : null,
          `  URL: ${mr.web_url}`,
          "",
          `Description:`,
          mr.description ? truncate(mr.description, 2000) : "(No description)",
        ].filter((line) => line !== null);

        return {
          content: [{ type: "text", text: lines.join("\n") }],
        };
      } catch (err) {
        return toToolError(err);
      }
    },
  );

  // --- gitlab_mr_changes ---
  server.tool(
    "gitlab_mr_changes",
    "Get MR diff/changes showing modified files and their diffs",
    {
      projectId: z.string().describe("Project ID or path (e.g., 'group/project')"),
      mrIid: z.number().describe("MR IID number"),
      maxFiles: z.number().default(20).describe("Max files to show"),
    },
    async ({ projectId, mrIid, maxFiles }) => {
      try {
        const result = await client.getMRChanges(projectId, mrIid);
        const changes = result.changes;
        const total = changes.length;
        const shown = changes.slice(0, maxFiles);

        const formatted = shown
          .map((change) => {
            let label = change.new_path;
            if (change.new_file) label += " (new)";
            else if (change.deleted_file) label += " (deleted)";
            else if (change.renamed_file) label = `${change.old_path} → ${change.new_path} (renamed)`;

            const diff = truncate(change.diff, 1000);
            return `--- ${label}\n${diff}`;
          })
          .join("\n\n");

        const header = `!${result.iid} ${result.title} — ${total} file(s) changed`;
        const truncatedNote =
          total > maxFiles ? `\n\n(Showing ${maxFiles} of ${total} files)` : "";

        return {
          content: [{ type: "text", text: `${header}\n\n${formatted}${truncatedNote}` }],
        };
      } catch (err) {
        return toToolError(err);
      }
    },
  );

  // --- gitlab_create_mr ---
  server.tool(
    "gitlab_create_mr",
    "Create a new merge request",
    {
      projectId: z.string().describe("Project ID or path (e.g., 'group/project')"),
      sourceBranch: z.string().describe("Source branch name"),
      targetBranch: z.string().default("develop").describe("Target branch name"),
      title: z.string().describe("MR title"),
      description: z.string().optional().describe("MR description (markdown)"),
    },
    async ({ projectId, sourceBranch, targetBranch, title, description }) => {
      try {
        const mr = await client.createMR(projectId, sourceBranch, targetBranch, title, description);
        return {
          content: [
            {
              type: "text",
              text: `Merge request created successfully!\n\n  IID: !${mr.iid}\n  Title: ${mr.title}\n  Branch: ${mr.source_branch} → ${mr.target_branch}\n  URL: ${mr.web_url}`,
            },
          ],
        };
      } catch (err) {
        return toToolError(err);
      }
    },
  );
}
