import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: {
    command: "pnpm exec cross-env NEXT_PUBLIC_DEMO_MODE=true NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000 next dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    env: { NEXT_PUBLIC_DEMO_MODE: "true", NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000" }
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
