/**
 * Снимок использования провайдера
 */
export type UsageStatus = "ok" | "warning" | "error";

export interface UsageSnapshot {
  providerId: string;
  used: number;
  limit: number;
  unit: string;
  timestamp: number;
  status: UsageStatus;
  /** Отображаемое имя провайдера */
  displayName?: string;
}
