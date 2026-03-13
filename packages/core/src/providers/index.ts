import type { ProviderType } from "../models/ProviderConfig.js";
import type { IUsageProvider } from "./IUsageProvider.js";
import { OpenAIProvider } from "./OpenAIProvider.js";
import { AnthropicProvider } from "./AnthropicProvider.js";
import { GeminiProvider } from "./GeminiProvider.js";
import { ZaiProvider } from "./ZaiProvider.js";

export { OpenAIProvider } from "./OpenAIProvider.js";
export { AnthropicProvider } from "./AnthropicProvider.js";
export { GeminiProvider } from "./GeminiProvider.js";
export { ZaiProvider } from "./ZaiProvider.js";
export type { IUsageProvider } from "./IUsageProvider.js";

const providers: Record<ProviderType, IUsageProvider> = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  gemini: new GeminiProvider(),
  zai: new ZaiProvider(),
};

export function getProvider(type: ProviderType): IUsageProvider {
  return providers[type];
}

export {
  getProviderMeta,
  getAllProviderMetas,
} from "./settingsRegistry.js";
export type {
  ProviderMeta,
  ProviderSettingField,
  SettingFieldType,
} from "./ProviderSettingsSchema.js";
