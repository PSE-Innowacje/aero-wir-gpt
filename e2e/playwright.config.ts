import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for AERO.
 *
 * Expects:
 *   - Backend running on http://localhost:8080
 *   - Frontend running on http://localhost:5173
 *
 * Start both before running tests, or use the webServer config below
 * (commented out) to start them automatically.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Uncomment to auto-start backend + frontend before tests:
  webServer: [
    {
      command: 'cd ../backend && ../gradlew bootRun',
      url: 'http://localhost:8080/api/dictionaries/crew-roles',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'cd ../frontend && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
  */
});
