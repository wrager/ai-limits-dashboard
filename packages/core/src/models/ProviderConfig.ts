/**
 * Конфигурация провайдера AI-сервиса
 */
export type ProviderType = "openai" | "anthropic" | "gemini" | "zai";

export interface ProviderConfig {
  id: string;
  type: ProviderType;
  apiKey?: string;
  customEndpoint?: string;
  displayName?: string;
  /** Ручной лимит (для z.ai, Gemini без API) — число в unit */
  manualLimit?: number;
  /** Ручное значение used (для z.ai) */
  manualUsed?: number;
}
