import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toToolError } from "../../../shared/http.js";
import { formatLokiStreams } from "../../../shared/format.js";
import type { LokiClient } from "../client.js";

export function registerQueryTools(server: McpServer, client: LokiClient): void {
  // ── loki_query ──────────────────────────────────────────────
  server.tool(
    "loki_query",
    "Run a LogQL query against Loki and return matching log lines",
    {
      query: z.string().describe("LogQL query (e.g., '{app=\"myapp\"} |= \"error\"')"),
      limit: z.number().default(100).describe("Max log lines"),
      start: z.string().optional().describe("Start time (ISO 8601 or Unix nano)"),
      end: z.string().optional().describe("End time (ISO 8601 or Unix nano)"),
    },
    async ({ query, limit, start, end }) => {
      try {
        const result = await client.query(query, limit, start, end);
        const text = formatLokiStreams(result.data.result, limit);
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );

  // ── loki_labels ─────────────────────────────────────────────
  server.tool(
    "loki_labels",
    "List all available log labels in Loki",
    {
      start: z.string().optional().describe("Start time (ISO 8601 or Unix nano)"),
      end: z.string().optional().describe("End time (ISO 8601 or Unix nano)"),
    },
    async ({ start, end }) => {
      try {
        const result = await client.getLabels(start, end);
        const text =
          result.data.length > 0
            ? result.data.map((label) => `- ${label}`).join("\n")
            : "No labels found.";
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );

  // ── loki_label_values ───────────────────────────────────────
  server.tool(
    "loki_label_values",
    "Get all values for a specific log label in Loki",
    {
      label: z.string().describe("Label name (e.g., 'app', 'namespace')"),
      start: z.string().optional().describe("Start time (ISO 8601 or Unix nano)"),
      end: z.string().optional().describe("End time (ISO 8601 or Unix nano)"),
    },
    async ({ label, start, end }) => {
      try {
        const result = await client.getLabelValues(label, start, end);
        const text =
          result.data.length > 0
            ? result.data.map((value) => `- ${value}`).join("\n")
            : `No values found for label "${label}".`;
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );

  // ── loki_tail ───────────────────────────────────────────────
  server.tool(
    "loki_tail",
    "Tail recent log lines from Loki (last N minutes)",
    {
      query: z.string().describe("LogQL query"),
      minutes: z.number().default(5).describe("How many minutes back to look"),
      limit: z.number().default(50).describe("Max log lines"),
    },
    async ({ query, minutes, limit }) => {
      try {
        const startMs = Date.now() - minutes * 60 * 1000;
        const startNano = (startMs * 1_000_000).toString();
        const result = await client.tail(query, limit, startNano);
        const text = formatLokiStreams(result.data.result, limit);
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return toToolError(err);
      }
    },
  );
}
