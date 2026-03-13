import type { ProviderConfig } from "../models/ProviderConfig.js";
import type { UsageSnapshot } from "../models/UsageSnapshot.js";
import type { IUsageProvider } from "./IUsageProvider.js";

const API_BASE = "https://api.openai.com/v1";
const DEFAULT_LIMIT = 1_000_000; // 1M tokens как ориентир

interface UsageResult {
  input_tokens?: number;
  output_tokens?: number;
}

interface UsageBucket {
  result?: UsageResult | UsageResult[];
}

interface CompletionsResponse {
  data?: UsageBucket[];
}

export class OpenAIProvider implements IUsageProvider {
  validateConfig(config: ProviderConfig): boolean {
    return config.type === "openai" && !!config.apiKey;
  }

  async fetchUsage(config: ProviderConfig): Promise<UsageSnapshot> {
    if (!this.validateConfig(config) || !config.apiKey) {
      return this.errorSnapshot(config.id, "Invalid config");
    }
    const now = Math.floor(Date.now() / 1000);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startTime = Math.floor(startOfMonth.getTime() / 1000);
    const url = `${API_BASE}/organization/usage/completions?start_time=${startTime}&end_time=${now}&bucket_width=1d`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      if (!res.ok) {
        const text = await res.text();
        return this.errorSnapshot(config.id, `${res.status}: ${text}`);
      }
      const body = (await res.json()) as CompletionsResponse;
      let used = 0;
      for (const bucket of body.data ?? []) {
        const raw = bucket.result;
        const results = Array.isArray(raw) ? raw : raw ? [raw] : [];
        for (const r of results) {
          used += (r?.input_tokens ?? 0) + (r?.output_tokens ?? 0);
        }
      }
      const limit = config.manualLimit ?? DEFAULT_LIMIT;
      const ratio = limit > 0 ? used / limit : 0;
      const status = ratio >= 1 ? "error" : ratio >= 0.8 ? "warning" : "ok";
      return {
        providerId: config.id,
        used,
        limit,
        unit: "tokens",
        timestamp: Date.now(),
        status,
        displayName: config.displayName ?? "OpenAI",
      };
    } catch (err) {
      return this.errorSnapshot(
        config.id,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  private errorSnapshot(providerId: string, message: string): UsageSnapshot {
    return {
      providerId,
      used: 0,
      limit: 1,
      unit: "tokens",
      timestamp: Date.now(),
      status: "error",
      displayName: "OpenAI",
    };
  }
}
