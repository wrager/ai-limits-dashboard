import type { ProviderConfig } from "../models/ProviderConfig.js";
import type { UsageSnapshot } from "../models/UsageSnapshot.js";

export interface IUsageProvider {
  /** Fetch usage data for the given provider config */
  fetchUsage(config: ProviderConfig): Promise<UsageSnapshot>;
  /** Validate that config has required fields for this provider */
  validateConfig(config: ProviderConfig): boolean;
}
