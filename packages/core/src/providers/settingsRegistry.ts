/**
 * Реестр схем настроек провайдеров — каждая схема определена рядом с провайдером
 */
import type { ProviderMeta, ProviderSettingField } from "./ProviderSettingsSchema.js";
import type { ProviderType } from "../models/ProviderConfig.js";

const OPENAI_SETTINGS: ProviderSettingField[] = [
  {
    key: "apiKey",
    type: "password",
    label: "API ключ",
    placeholder: "sk-...",
  },
];

const ANTHROPIC_SETTINGS: ProviderSettingField[] = [
  {
    key: "apiKey",
    type: "password",
    label: "API ключ (Admin — опционально)",
    placeholder: "sk-ant-admin... — пусто = ручной ввод",
    optional: true,
    hint: "Нужна организация в console.anthropic.com → Organization",
  },
  {
    key: "manualUsed",
    type: "number",
    label: "Использовано $ (ручной ввод)",
    placeholder: "0",
    step: "0.01",
  },
  {
    key: "manualLimit",
    type: "number",
    label: "Лимит $ (ручной)",
    placeholder: "100",
    step: "0.01",
  },
];

const GEMINI_SETTINGS: ProviderSettingField[] = [
  {
    key: "customEndpoint",
    type: "url",
    label: "Custom endpoint (опционально)",
    placeholder: "https://...",
    optional: true,
  },
  {
    key: "apiKey",
    type: "password",
    label: "API ключ (опционально)",
    placeholder: "AIza...",
    optional: true,
  },
  {
    key: "manualUsed",
    type: "number",
    label: "Использовано (ручной ввод)",
    placeholder: "0",
  },
  {
    key: "manualLimit",
    type: "number",
    label: "Лимит (ручной)",
    placeholder: "100",
  },
];

const ZAI_SETTINGS: ProviderSettingField[] = [
  {
    key: "customEndpoint",
    type: "url",
    label: "Custom endpoint (опционально)",
    placeholder: "https://...",
    optional: true,
  },
  {
    key: "manualUsed",
    type: "number",
    label: "Использовано (ручной ввод)",
    placeholder: "0",
  },
  {
    key: "manualLimit",
    type: "number",
    label: "Лимит (ручной)",
    placeholder: "100",
  },
];

const PROVIDER_META: Record<ProviderType, ProviderMeta> = {
  openai: { type: "openai", label: "OpenAI", settings: OPENAI_SETTINGS },
  anthropic: { type: "anthropic", label: "Anthropic", settings: ANTHROPIC_SETTINGS },
  gemini: { type: "gemini", label: "Gemini", settings: GEMINI_SETTINGS },
  zai: { type: "zai", label: "z.ai", settings: ZAI_SETTINGS },
};

export function getProviderMeta(type: ProviderType): ProviderMeta {
  return PROVIDER_META[type];
}

export function getAllProviderMetas(): ProviderMeta[] {
  return Object.values(PROVIDER_META);
}
