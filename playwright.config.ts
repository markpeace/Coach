import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000", trace: "retain-on-failure" },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: "npm run dev",
    url: "http://127.0.0.1:3000/login",
    reuseExistingServer: true,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
      HOUSEHOLD_PASSPHRASE: process.env.HOUSEHOLD_PASSPHRASE ?? "fictional-coach-test",
      SESSION_SECRET: process.env.SESSION_SECRET ?? "fictional-session-secret-at-least-32-characters",
      GPT_ACTION_API_KEY: process.env.GPT_ACTION_API_KEY ?? "fictional-action-key-at-least-24-chars"
    }
  },
  projects: [
    { name: "mobile-chromium", use: { ...devices["iPhone 13"] } },
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});
