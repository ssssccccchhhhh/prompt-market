export class McpApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(`HTTP ${status} ${statusText}: ${body.slice(0, 300)}`);
    this.name = "McpApiError";
  }
}

export async function httpGet<T>(
  url: string,
  headers: Record<string, string>,
): Promise<T> {
  const res = await fetch(url, { headers: { ...headers, Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text();
    throw new McpApiError(res.status, res.statusText, body);
  }
  return (await res.json()) as T;
}

export async function httpPost<T>(
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new McpApiError(res.status, res.statusText, text);
  }
  return (await res.json()) as T;
}

export async function httpPut<T>(
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new McpApiError(res.status, res.statusText, text);
  }
  return (await res.json()) as T;
}

export function toToolError(err: unknown): { content: Array<{ type: "text"; text: string }>; isError: true } {
  const message = err instanceof McpApiError
    ? `API Error (${err.status}): ${err.body.slice(0, 500)}`
    : err instanceof Error
      ? err.message
      : String(err);
  return { content: [{ type: "text", text: message }], isError: true };
}
