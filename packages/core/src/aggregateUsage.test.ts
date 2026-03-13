import { beforeEach, describe, expect, it, vi } from "vitest";
import { aggregateUsage } from "./aggregateUsage.js";
import type { ProviderConfig } from "./models/ProviderConfig.js";

describe("aggregateUsage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("возвращает пустой state для пустого списка", async () => {
    const state = await aggregateUsage([]);
    expect(state.snapshots).toEqual([]);
    expect(state.hasErrors).toBe(false);
  });

  it("собирает snapshots от z.ai manual", async () => {
    const configs: ProviderConfig[] = [
      {
        id: "z1",
        type: "zai",
        manualUsed: 50,
        manualLimit: 100,
        displayName: "z.ai",
      },
    ];
    const state = await aggregateUsage(configs);
    expect(state.snapshots).toHaveLength(1);
    expect(state.snapshots[0].providerId).toBe("z1");
    expect(state.snapshots[0].used).toBe(50);
    expect(state.snapshots[0].limit).toBe(100);
    expect(state.hasErrors).toBe(false);
  });

  it("пропускает невалидные конфиги", async () => {
    const configs: ProviderConfig[] = [
      { id: "x", type: "openai" }, // нет apiKey
      { id: "z1", type: "zai", manualUsed: 10, manualLimit: 100 },
    ];
    const state = await aggregateUsage(configs);
    expect(state.snapshots).toHaveLength(1);
    expect(state.snapshots[0].providerId).toBe("z1");
  });
});
