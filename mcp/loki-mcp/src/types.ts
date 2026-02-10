export interface LokiStream {
  stream: Record<string, string>;
  values: Array<[string, string]>;
}

export interface LokiQueryResponse {
  status: string;
  data: {
    resultType: string;
    result: LokiStream[];
    stats?: Record<string, unknown>;
  };
}

export interface LokiLabelsResponse {
  status: string;
  data: string[];
}

export interface LokiTailResponse {
  streams: LokiStream[];
  dropped_entries?: Array<{ labels: Record<string, string>; timestamp: string }> | null;
}
