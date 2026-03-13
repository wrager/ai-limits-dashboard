/**
 * Схема полей настроек провайдера — хранится в коде провайдера, не в UI
 */
import type { ProviderType } from "../models/ProviderConfig.js";

export type SettingFieldType = "password" | "number" | "text" | "url";

export interface ProviderSettingField {
  key: string;
  type: SettingFieldType;
  label: string;
  placeholder?: string;
  optional?: boolean;
  hint?: string;
  step?: string;
}

export interface ProviderMeta {
  type: ProviderType;
  label: string;
  settings: ProviderSettingField[];
}
