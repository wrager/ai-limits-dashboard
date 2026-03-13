import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZaiProvider } from "./ZaiProvider.js";
import type { ProviderConfig } from "../models/ProviderConfig.js";

describe("ZaiProvider", () => {
  const provider = new ZaiProvider();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("validateConfig требует manualUsed/manualLimit или customEndpoint", () => {
    expect(
      provider.validateConfig({ id: "z1", type: "zai" } as ProviderConfig)
    ).toBe(false);
    expect(
      provider.validateConfig({
        id: "z1",
        type: "zai",
        manualUsed: 50,
        manualLimit: 100,
      } as ProviderConfig)
    ).toBe(true);
    expect(
      provider.validateConfig({
        id: "z1",
        type: "zai",
        customEndpoint: "https://example.com/usage",
      } as ProviderConfig)
    ).toBe(true);
  });

  it("fetchUsage возвращает snapshot для manual", async () => {
    const snap = await provider.fetchUsage({
      id: "z1",
      type: "zai",
      manualUsed: 85,
      manualLimit: 100,
      displayName: "z.ai",
    });

    expect(snap.providerId).toBe("z1");
    expect(snap.used).toBe(85);
    expect(snap.limit).toBe(100);
    expect(snap.status).toBe("warning"); // >= 80%
    expect(snap.displayName).toBe("z.ai");
  });

  it("fetchUsage возвращает snapshot из customEndpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ used: 30, limit: 100, unit: "requests" }),
    }));

    const snap = await provider.fetchUsage({
      id: "z1",
      type: "zai",
      customEndpoint: "https://api.z.ai/usage",
    });

    expect(snap.used).toBe(30);
    expect(snap.limit).toBe(100);
    expect(snap.unit).toBe("requests");
    expect(snap.status).toBe("ok");
  });

  it("fetchUsage возвращает error при отсутствии данных", async () => {
    const snap = await provider.fetchUsage({
      id: "z1",
      type: "zai",
    });

    expect(snap.status).toBe("error");
  });
});
