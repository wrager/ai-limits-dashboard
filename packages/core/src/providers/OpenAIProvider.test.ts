import { beforeEach, describe, expect, it, vi } from "vitest";
import { OpenAIProvider } from "./OpenAIProvider.js";
import type { ProviderConfig } from "../models/ProviderConfig.js";

describe("OpenAIProvider", () => {
  const provider = new OpenAIProvider();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("validateConfig требует apiKey", () => {
    expect(
      provider.validateConfig({ id: "x", type: "openai" } as ProviderConfig)
    ).toBe(false);
    expect(
      provider.validateConfig({
        id: "x",
        type: "openai",
        apiKey: "sk-xxx",
      } as ProviderConfig)
    ).toBe(true);
  });

  it("validateConfig отклоняет не-openai", () => {
    expect(
      provider.validateConfig({
        id: "x",
        type: "anthropic",
        apiKey: "sk-ant-xxx",
      } as ProviderConfig)
    ).toBe(false);
  });

  it("fetchUsage возвращает snapshot при успехе", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              result: { input_tokens: 100, output_tokens: 50 },
            },
          ],
        }),
    }));

    const snap = await provider.fetchUsage({
      id: "o1",
      type: "openai",
      apiKey: "sk-xxx",
      displayName: "OpenAI",
    });

    expect(snap.providerId).toBe("o1");
    expect(snap.used).toBe(150);
    expect(snap.limit).toBeGreaterThan(0);
    expect(snap.unit).toBe("tokens");
    expect(snap.status).toBe("ok");
    expect(snap.displayName).toBe("OpenAI");
  });

  it("fetchUsage возвращает error snapshot при HTTP error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    }));

    const snap = await provider.fetchUsage({
      id: "o1",
      type: "openai",
      apiKey: "sk-bad",
    });

    expect(snap.status).toBe("error");
    expect(snap.used).toBe(0);
  });

  it("fetchUsage обрабатывает result как массив", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              result: [
                { input_tokens: 10, output_tokens: 5 },
                { input_tokens: 20, output_tokens: 10 },
              ],
            },
          ],
        }),
    }));

    const snap = await provider.fetchUsage({
      id: "o1",
      type: "openai",
      apiKey: "sk-xxx",
    });

    expect(snap.used).toBe(45);
  });
});
