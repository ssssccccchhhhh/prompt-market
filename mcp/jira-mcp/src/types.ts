export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress?: string;
}

export interface JiraStatus {
  id: string;
  name: string;
}

export interface JiraPriority {
  id: string;
  name: string;
}

export interface JiraIssueFields {
  summary: string;
  description?: string | null;
  status: JiraStatus;
  assignee?: JiraUser | null;
  reporter?: JiraUser | null;
  priority?: JiraPriority | null;
  issuetype: { name: string };
  project: { key: string };
  created: string;
  updated: string;
  labels?: string[];
  comment?: {
    comments: JiraComment[];
    total: number;
  };
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
}

export interface JiraSearchResult {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}

export interface JiraTransition {
  id: string;
  name: string;
  to: JiraStatus;
}

export interface JiraComment {
  id: string;
  author: JiraUser;
  body: string;
  created: string;
  updated: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
}

export interface JiraBoardResult {
  values: Array<{ id: number; name: string }>;
}
