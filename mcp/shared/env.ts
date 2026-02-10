export function validateEnv(
  serverName: string,
  keys: string[],
): Record<string, string> {
  const result: Record<string, string> = {};
  const missing: string[] = [];

  for (const key of keys) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      result[key] = value;
    }
  }

  if (missing.length > 0) {
    console.error(`\n[${serverName}] Missing required environment variables:\n`);
    for (const key of missing) {
      console.error(`  - ${key}`);
    }
    console.error(`\nSet them in your MCP configuration or export them before running.\n`);
    process.exit(1);
  }

  return result;
}
