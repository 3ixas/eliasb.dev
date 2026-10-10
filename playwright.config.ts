import { defineConfig, devices } from "@playwright/test";

// Runs against a production build (`pnpm build` first), at the four widths the
// design is accepted at, in Chromium and WebKit, in both colour schemes.
const port = Number(process.env.E2E_PORT ?? 3100);
const widths = [320, 390, 820, 1440] as const;
const browsers = [
  { name: "chromium", device: devices["Desktop Chrome"] },
  { name: "webkit", device: devices["Desktop Safari"] },
] as const;
const schemes = ["light", "dark"] as const;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // Locally, one browser at a time: parallel runs froze an 8 GB laptop. CI keeps
  // Playwright's default (half the CPU cores).
  workers: process.env.CI ? undefined : 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    // The homepage's signature entrance holds the page for about five seconds on
    // a fresh load and animates the hero, so specs read the finished page. Only
    // entrance.spec.ts turns motion back on.
    reducedMotion: "reduce",
  },
  projects: browsers.flatMap(({ name, device }) =>
    widths.flatMap((width) =>
      schemes.map((colorScheme) => ({
        name: `${name}-${width}-${colorScheme}`,
        use: {
          ...device,
          viewport: { width, height: width < 820 ? 844 : 900 },
          colorScheme,
        },
      })),
    ),
  ),
  webServer: {
    command: `pnpm start --port ${port} --hostname 127.0.0.1`,
    // Turns on the /fixtures pages; production never sets this.
    env: { BOARD_FIXTURES: "1" },
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
