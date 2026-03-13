/**
 * WebdriverIO config for Tauri E2E tests.
 * Requires tauri-driver and Tauri app to be built.
 * @see https://v2.tauri.app/develop/tests/webdriver
 *
 * Usage: pnpm exec wdio run e2e/wdio.conf.ts
 * (after apps/desktop is scaffolded with Tauri)
 */

export const config = {
  runner: "local",
  specs: [] as string[],
  capabilities: [] as object[],
  services: [] as string[],
  // Placeholder — will be configured when Tauri app is ready
};
