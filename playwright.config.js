import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://127.0.0.1:5500',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test on Firefox and WebKit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run frontend static server AND backend server before tests
  webServer: [
    {
      // Serve the frontend statically on port 5500 (CI replacement for Live Server)
      command: 'npx http-server -p 5500 -a 127.0.0.1 -c-1 .',
      url: 'http://127.0.0.1:5500/index.html',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      // Start backend and wait for health endpoint
      command: 'npm start',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 10000,
    }
  ],
});
