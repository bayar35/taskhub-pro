import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'html',
  timeout: 60000,          // ← 60 секунд (30 биш)
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 60000,  // ← нэмэх
    actionTimeout: 30000,      // ← нэмэх
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,   // ← үргэлж true (dev server-ийг дахин ашиглах)
    timeout: 120000,             // ← 2 минут
    stdout: 'pipe',              // ← debug-д хэрэгтэй
    stderr: 'pipe',
  },
});