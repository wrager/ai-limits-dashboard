import type { ProviderConfig } from "./models/ProviderConfig.js";
import type { AggregatedState } from "./models/AggregatedState.js";
import type { UsageSnapshot } from "./models/UsageSnapshot.js";
import { getProvider } from "./providers/index.js";

/**
 * Опрашивает все провайдеры и собирает AggregatedState
 */
export async function aggregateUsage(
  configs: ProviderConfig[]
): Promise<AggregatedState> {
  const snapshots: UsageSnapshot[] = [];
  for (const config of configs) {
    const provider = getProvider(config.type);
    if (!provider.validateConfig(config)) continue;
    const snapshot = await provider.fetchUsage(config);
    snapshots.push(snapshot);
  }
  const hasErrors = snapshots.some((s) => s.status === "error");
  return {
    snapshots,
    lastUpdated: Date.now(),
    hasErrors,
  };
}
