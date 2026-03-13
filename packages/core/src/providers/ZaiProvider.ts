import type { ProviderConfig } from "../models/ProviderConfig.js";
import type { UsageSnapshot } from "../models/UsageSnapshot.js";
import type { IUsageProvider } from "./IUsageProvider.js";

interface CustomEndpointResponse {
  used?: number;
  limit?: number;
  unit?: string;
}

/**
 * z.ai — свободная форма: ручной ввод или кастомный endpoint.
 */
export class ZaiProvider implements IUsageProvider {
  validateConfig(config: ProviderConfig): boolean {
    if (config.type !== "zai") return false;
    if (config.customEndpoint) return true;
    const manual =
      config.manualUsed != null &&
      config.manualLimit != null &&
      config.manualLimit > 0;
    return manual;
  }

  async fetchUsage(config: ProviderConfig): Promise<UsageSnapshot> {
    if (config.type !== "zai") {
      return this.errorSnapshot(config.id);
    }
    if (config.customEndpoint) {
      return this.fetchFromCustom(config);
    }
    if (
      config.manualUsed != null &&
      config.manualLimit != null &&
      config.manualLimit > 0
    ) {
      const used = config.manualUsed;
      const limit = config.manualLimit;
      const ratio = used / limit;
      const status = ratio >= 1 ? "error" : ratio >= 0.8 ? "warning" : "ok";
      return {
        providerId: config.id,
        used,
        limit,
        unit: config.displayName?.includes("%") ? "%" : "manual",
        timestamp: Date.now(),
        status,
        displayName: config.displayName ?? "z.ai",
      };
    }
    return this.errorSnapshot(config.id);
  }

  private async fetchFromCustom(config: ProviderConfig): Promise<UsageSnapshot> {
    const url = config.customEndpoint!;
    try {
      const headers: Record<string, string> = {};
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        return this.errorSnapshot(config.id);
      }
      const body = (await res.json()) as CustomEndpointResponse;
      const used = body.used ?? 0;
      const limit = body.limit ?? 1;
      const ratio = limit > 0 ? used / limit : 0;
      const status = ratio >= 1 ? "error" : ratio >= 0.8 ? "warning" : "ok";
      return {
        providerId: config.id,
        used,
        limit,
        unit: body.unit ?? "manual",
        timestamp: Date.now(),
        status,
        displayName: config.displayName ?? "z.ai",
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
      unit: "manual",
      timestamp: Date.now(),
      status: "error",
      displayName: "z.ai",
    };
  }
}
