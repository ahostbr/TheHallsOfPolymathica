import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000, // corridor flights can take up to 20s + app launch overhead
  expect: {
    timeout: 15_000,
  },
  // Run test files sequentially (each launches its own Electron instance)
  fullyParallel: false,
  workers: 1,
  use: {
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  projects: [
    {
      name: 'electron',
      testMatch: '**/*.spec.ts',
    },
  ],
})
