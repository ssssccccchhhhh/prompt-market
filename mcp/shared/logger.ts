export function log(server: string, message: string): void {
  console.error(`[${server}] ${message}`);
}

export function logError(server: string, message: string, error?: unknown): void {
  const detail = error instanceof Error ? error.message : String(error ?? "");
  console.error(`[${server}] ERROR: ${message}${detail ? ` — ${detail}` : ""}`);
}
