import { getBearerHeader } from "../../shared/auth.js";
import { httpGet } from "../../shared/http.js";
import type { LokiQueryResponse, LokiLabelsResponse } from "./types.js";

const ONE_HOUR_MS = 3_600_000;

function msToNano(ms: number): string {
  return (ms * 1_000_000).toString();
}

export class LokiClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(baseUrl: string, token: string) {
    // Remove trailing slash if present
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.headers = getBearerHeader(token);
  }

  /**
   * Run a LogQL query_range request.
   */
  async query(
    logql: string,
    limit = 100,
    start?: string,
    end?: string,
  ): Promise<LokiQueryResponse> {
    const params = new URLSearchParams();
    params.set("query", logql);
    params.set("limit", String(limit));

    const now = Date.now();
    params.set("start", start ?? msToNano(now - ONE_HOUR_MS));
    params.set("end", end ?? msToNano(now));

    const url = `${this.baseUrl}/loki/api/v1/query_range?${params.toString()}`;
    return httpGet<LokiQueryResponse>(url, this.headers);
  }

  /**
   * List all available label names.
   */
  async getLabels(start?: string, end?: string): Promise<LokiLabelsResponse> {
    const params = new URLSearchParams();

    const now = Date.now();
    if (start) params.set("start", start);
    else params.set("start", msToNano(now - ONE_HOUR_MS));
    if (end) params.set("end", end);
    else params.set("end", msToNano(now));

    const url = `${this.baseUrl}/loki/api/v1/labels?${params.toString()}`;
    return httpGet<LokiLabelsResponse>(url, this.headers);
  }

  /**
   * Get all values for a specific label.
   */
  async getLabelValues(
    label: string,
    start?: string,
    end?: string,
  ): Promise<LokiLabelsResponse> {
    const params = new URLSearchParams();

    const now = Date.now();
    if (start) params.set("start", start);
    else params.set("start", msToNano(now - ONE_HOUR_MS));
    if (end) params.set("end", end);
    else params.set("end", msToNano(now));

    const encodedLabel = encodeURIComponent(label);
    const url = `${this.baseUrl}/loki/api/v1/label/${encodedLabel}/values?${params.toString()}`;
    return httpGet<LokiLabelsResponse>(url, this.headers);
  }

  /**
   * Tail recent logs — uses query_range with delayFor=0, simulating a tail of recent entries.
   */
  async tail(
    logql: string,
    limit = 50,
    start?: string,
  ): Promise<LokiQueryResponse> {
    const params = new URLSearchParams();
    params.set("query", logql);
    params.set("limit", String(limit));
    params.set("direction", "backward");

    const now = Date.now();
    params.set("start", start ?? msToNano(now - ONE_HOUR_MS));
    params.set("end", msToNano(now));

    const url = `${this.baseUrl}/loki/api/v1/query_range?${params.toString()}`;
    return httpGet<LokiQueryResponse>(url, this.headers);
  }
}
