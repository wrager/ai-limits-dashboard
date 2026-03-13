import { describe, expect, it } from "vitest";
import { coreVersion } from "./index.js";
import pkg from "../package.json" with { type: "json" };

describe("core", () => {
  it("exports coreVersion in sync with package.json", () => {
    expect(coreVersion).toBe(pkg.version);
  });
});
