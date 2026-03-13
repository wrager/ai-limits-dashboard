import type { UsageSnapshot } from "./UsageSnapshot.js";

/**
 * Суммарное состояние по всем провайдерам (для overlay/tooltip)
 */
export interface AggregatedState {
  snapshots: UsageSnapshot[];
  lastUpdated: number;
  hasErrors: boolean;
}
