import type { ProviderConfig } from "../models/ProviderConfig.js";
import type { UsageSnapshot } from "../models/UsageSnapshot.js";
import type { IUsageProvider } from "./IUsageProvider.js";

const API_BASE = "https://api.anthropic.com/v1";
const DEFAULT_LIMIT = 100; // $100 в месяц по умолчанию

interface CostResult {
  amount?: string;
  currency?: string;
}

interface CostBucket {
  results?: CostResult[];
}

interface CostReportResponse {
  data?: CostBucket[];
}

export class AnthropicProvider implements IUsageProvider {
  validateConfig(config: ProviderConfig): boolean {
    return config.type === "anthropic" && !!config.apiKey;
  }

  async fetchUsage(config: ProviderConfig): Promise<UsageSnapshot> {
    if (!this.validateConfig(config) || !config.apiKey) {
      return this.errorSnapshot(config.id);
    }
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startingAt = startOfMonth.toISOString();
    const endingAt = now.toISOString();
    const url = `${API_BASE}/organizations/cost_report?starting_at=${encodeURIComponent(startingAt)}&ending_at=${encodeURIComponent(endingAt)}&bucket_width=1d&limit=31`;
    try {
      const res = await fetch(url, {
        headers: {
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        await res.text(); // consume body
        return this.errorSnapshot(config.id);
      }
      const body = (await res.json()) as CostReportResponse;
      let used = 0;
      for (const bucket of body.data ?? []) {
        for (const r of bucket.results ?? []) {
          const amt = parseFloat(r?.amount ?? "0");
          used += amt;
        }
      }
      const limit = config.manualLimit ?? DEFAULT_LIMIT;
      const ratio = limit > 0 ? used / limit : 0;
      const status = ratio >= 1 ? "error" : ratio >= 0.8 ? "warning" : "ok";
      return {
        providerId: config.id,
        used,
        limit,
        unit: "USD",
        timestamp: Date.now(),
        status,
        displayName: config.displayName ?? "Anthropic",
      };
    } catch {
      return this.errorSnapshot(config.id);
    }
  }

  private errorSnapshot(providerId: string): UsageSnapshot {
    return {
      providerId,
      used: 0,
      limit: 1,
      unit: "USD",
      timestamp: Date.now(),
      status: "error",
      displayName: "Anthropic",
    };
  }
}
