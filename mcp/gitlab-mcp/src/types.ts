export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  web_url: string;
}

export interface GitLabMR {
  id: number;
  iid: number;
  title: string;
  description: string | null;
  state: string;
  source_branch: string;
  target_branch: string;
  author: GitLabUser;
  assignee?: GitLabUser | null;
  reviewers?: GitLabUser[];
  web_url: string;
  created_at: string;
  updated_at: string;
  merged_at?: string | null;
  labels?: string[];
  draft: boolean;
  merge_status: string;
  has_conflicts: boolean;
}

export interface GitLabDiff {
  old_path: string;
  new_path: string;
  diff: string;
  new_file: boolean;
  renamed_file: boolean;
  deleted_file: boolean;
}

export interface GitLabPipeline {
  id: number;
  iid: number;
  status: string;
  ref: string;
  sha: string;
  web_url: string;
  created_at: string;
  updated_at: string;
  source: string;
}

export interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  web_url: string;
}

export interface GitLabSearchResult {
  basename: string;
  data: string;
  path: string;
  filename: string;
  ref: string;
  startline: number;
  project_id: number;
}
