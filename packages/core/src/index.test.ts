import { describe, expect, it } from "vitest";
import { coreVersion } from "./index.js";

describe("core", () => {
  it("exports coreVersion", () => {
    expect(coreVersion).toBe("0.1.0");
  });
});
