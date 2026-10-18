import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  use: { browserName: 'chromium', headless: true, baseURL: 'http://127.0.0.1:4173', acceptDownloads: true },
  webServer: { command: 'python3 -m http.server 4173 --bind 127.0.0.1', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 15000 },
  reporter: 'list'
});
