import { getPrivateTokenHeader } from "../../shared/auth.js";
import { httpGet, httpPost } from "../../shared/http.js";
import type {
  GitLabUser,
  GitLabMR,
  GitLabDiff,
  GitLabPipeline,
  GitLabSearchResult,
} from "./types.js";

export class GitLabClient {
  private readonly headers: Record<string, string>;
  private readonly apiBase: string;

  constructor(baseUrl: string, token: string) {
    // Remove trailing slash if present, then append /api/v4
    this.apiBase = baseUrl.replace(/\/+$/, "") + "/api/v4";
    this.headers = getPrivateTokenHeader(token);
  }

  /** Get the authenticated user */
  async getCurrentUser(): Promise<GitLabUser> {
    const url = `${this.apiBase}/user`;
    return httpGet<GitLabUser>(url, this.headers);
  }

  /** List merge requests for the authenticated user */
  async getMyMRs(
    state: string = "opened",
    scope: string = "assigned_to_me",
  ): Promise<GitLabMR[]> {
    const url = `${this.apiBase}/merge_requests?scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}&per_page=20`;
    return httpGet<GitLabMR[]>(url, this.headers);
  }

  /** Get a single MR by project and IID */
  async getMRDetail(projectId: string, mrIid: number): Promise<GitLabMR> {
    const url = `${this.apiBase}/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}`;
    return httpGet<GitLabMR>(url, this.headers);
  }

  /** Get MR changes (diffs) */
  async getMRChanges(
    projectId: string,
    mrIid: number,
  ): Promise<GitLabMR & { changes: GitLabDiff[] }> {
    const url = `${this.apiBase}/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/changes`;
    return httpGet<GitLabMR & { changes: GitLabDiff[] }>(url, this.headers);
  }

  /** Create a new merge request */
  async createMR(
    projectId: string,
    sourceBranch: string,
    targetBranch: string,
    title: string,
    description?: string,
  ): Promise<GitLabMR> {
    const url = `${this.apiBase}/projects/${encodeURIComponent(projectId)}/merge_requests`;
    const body: Record<string, string> = {
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title,
    };
    if (description) {
      body.description = description;
    }
    return httpPost<GitLabMR>(url, this.headers, body);
  }

  /** List recent pipelines for a project */
  async getPipelines(
    projectId: string,
    ref?: string,
  ): Promise<GitLabPipeline[]> {
    let url = `${this.apiBase}/projects/${encodeURIComponent(projectId)}/pipelines?per_page=10`;
    if (ref) {
      url += `&ref=${encodeURIComponent(ref)}`;
    }
    return httpGet<GitLabPipeline[]>(url, this.headers);
  }

  /** Search code across repositories */
  async searchCode(
    search: string,
    projectId?: string,
  ): Promise<GitLabSearchResult[]> {
    const query = `scope=blobs&search=${encodeURIComponent(search)}`;
    const url = projectId
      ? `${this.apiBase}/projects/${encodeURIComponent(projectId)}/search?${query}`
      : `${this.apiBase}/search?${query}`;
    return httpGet<GitLabSearchResult[]>(url, this.headers);
  }
}
