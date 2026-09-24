import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests against a production build (`npm run build` first).
 * Uses DATABASE_URL when set, otherwise the app boots on PGlite.
 */
const port = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next start -p ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { PGLITE_DATA_DIR: process.env.DATABASE_URL ? "" : "memory://" },
  },
});
