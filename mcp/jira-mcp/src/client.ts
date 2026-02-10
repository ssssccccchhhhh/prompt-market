import { getBasicAuthHeader } from "../../shared/auth.js";
import { httpGet, httpPost } from "../../shared/http.js";
import type {
  JiraIssue,
  JiraSearchResult,
  JiraTransition,
  JiraComment,
  JiraSprint,
  JiraBoardResult,
} from "./types.js";

const SEARCH_FIELDS = [
  "summary",
  "status",
  "assignee",
  "reporter",
  "priority",
  "issuetype",
  "project",
  "created",
  "updated",
  "labels",
  "description",
  "comment",
];

export class JiraClient {
  private readonly headers: Record<string, string>;
  private readonly baseUrl: string;
  private readonly projectKey: string;

  constructor(baseUrl: string, email: string, token: string, projectKey: string) {
    // Remove trailing slash if present
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.projectKey = projectKey;
    this.headers = getBasicAuthHeader(email, token);
  }

  /** Run a JQL search query */
  async search(jql: string, maxResults = 20): Promise<JiraSearchResult> {
    const url = `${this.baseUrl}/rest/api/3/search`;
    return httpPost<JiraSearchResult>(url, this.headers, {
      jql,
      maxResults,
      fields: SEARCH_FIELDS,
    });
  }

  /** Get a single issue by key */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    const url = `${this.baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}`;
    return httpGet<JiraIssue>(url, this.headers);
  }

  /** Create a new issue */
  async createIssue(
    summary: string,
    issueType: string,
    description?: string,
    assigneeId?: string,
  ): Promise<JiraIssue> {
    const url = `${this.baseUrl}/rest/api/3/issue`;

    const fields: Record<string, unknown> = {
      project: { key: this.projectKey },
      summary,
      issuetype: { name: issueType },
    };

    if (description) {
      fields.description = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: description }],
          },
        ],
      };
    }

    if (assigneeId) {
      fields.assignee = { accountId: assigneeId };
    }

    return httpPost<JiraIssue>(url, this.headers, { fields });
  }

  /** Get available transitions for an issue */
  async getTransitions(issueKey: string): Promise<JiraTransition[]> {
    const url = `${this.baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`;
    const result = await httpGet<{ transitions: JiraTransition[] }>(url, this.headers);
    return result.transitions;
  }

  /** Execute a transition on an issue */
  async doTransition(issueKey: string, transitionId: string): Promise<void> {
    const url = `${this.baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`;
    await httpPost<unknown>(url, this.headers, {
      transition: { id: transitionId },
    });
  }

  /** Add a comment to an issue */
  async addComment(issueKey: string, body: string): Promise<JiraComment> {
    const url = `${this.baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment`;
    return httpPost<JiraComment>(url, this.headers, {
      body: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: body }],
          },
        ],
      },
    });
  }

  /** Get all boards (for sprint lookups) */
  async getBoards(): Promise<JiraBoardResult> {
    const url = `${this.baseUrl}/rest/agile/1.0/board`;
    return httpGet<JiraBoardResult>(url, this.headers);
  }

  /** Get active sprint for a board */
  async getActiveSprint(boardId: number): Promise<JiraSprint | null> {
    const url = `${this.baseUrl}/rest/agile/1.0/board/${boardId}/sprint?state=active`;
    const result = await httpGet<{ values: JiraSprint[] }>(url, this.headers);
    return result.values.length > 0 ? result.values[0] : null;
  }

  /** Get issues in a sprint */
  async getSprintIssues(sprintId: number): Promise<JiraSearchResult> {
    const url = `${this.baseUrl}/rest/agile/1.0/sprint/${sprintId}/issue`;
    return httpGet<JiraSearchResult>(url, this.headers);
  }

  /** Get the browse URL for an issue */
  getIssueUrl(issueKey: string): string {
    return `${this.baseUrl}/browse/${issueKey}`;
  }
}
