export function truncate(text: string, maxLen = 500): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "…";
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

export function formatJiraIssue(issue: {
  key: string;
  fields: {
    summary: string;
    status: { name: string };
    assignee?: { displayName: string } | null;
    priority?: { name: string } | null;
    updated?: string;
  };
}): string {
  const f = issue.fields;
  return [
    `[${issue.key}] ${f.summary}`,
    `  Status: ${f.status.name}`,
    `  Assignee: ${f.assignee?.displayName ?? "Unassigned"}`,
    `  Priority: ${f.priority?.name ?? "None"}`,
    `  Updated: ${formatDate(f.updated)}`,
  ].join("\n");
}

export function formatGitLabMR(mr: {
  iid: number;
  title: string;
  state: string;
  author: { username: string };
  source_branch: string;
  target_branch: string;
  web_url: string;
  updated_at?: string;
}): string {
  return [
    `!${mr.iid} ${mr.title}`,
    `  State: ${mr.state} | Author: ${mr.author.username}`,
    `  Branch: ${mr.source_branch} → ${mr.target_branch}`,
    `  Updated: ${formatDate(mr.updated_at)}`,
    `  URL: ${mr.web_url}`,
  ].join("\n");
}

export function formatLokiStreams(
  streams: Array<{ stream: Record<string, string>; values: Array<[string, string]> }>,
  limit = 100,
): string {
  const lines: string[] = [];
  for (const s of streams) {
    const labels = Object.entries(s.stream)
      .map(([k, v]) => `${k}="${v}"`)
      .join(", ");
    for (const [ts, line] of s.values) {
      const date = new Date(Number(ts) / 1_000_000);
      lines.push(`[${date.toISOString()}] {${labels}} ${line}`);
      if (lines.length >= limit) {
        lines.push(`... (truncated at ${limit} lines)`);
        return lines.join("\n");
      }
    }
  }
  if (lines.length === 0) return "No log lines found.";
  return lines.join("\n");
}
