/**
 * @ai-limits/core — Shared logic for AI usage providers
 */

export const coreVersion = "0.1.0-alpha.2";

export type { ProviderConfig, ProviderType } from "./models/ProviderConfig.js";
export type { UsageSnapshot, UsageStatus } from "./models/UsageSnapshot.js";
export type { AggregatedState } from "./models/AggregatedState.js";
export type { IUsageProvider } from "./providers/IUsageProvider.js";
export {
  getProvider,
  getProviderMeta,
  getAllProviderMetas,
  OpenAIProvider,
  AnthropicProvider,
  GeminiProvider,
  ZaiProvider,
} from "./providers/index.js";
export type {
  ProviderMeta,
  ProviderSettingField,
  SettingFieldType,
} from "./providers/ProviderSettingsSchema.js";
export { aggregateUsage } from "./aggregateUsage.js";
