import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('IndexedDB CRUD, backup, import and offline persistence', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Local database ready');
  await page.getByLabel('Record', { exact: true }).fill('Record A');
  await page.getByRole('button', { name: 'Add record' }).click();
  await expect(page.getByText('Record A')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Record A')).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export JSON backup' }).click()
  ]);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pwa-backup-'));
  const filename = path.join(dir, 'backup.json');
  await download.saveAs(filename);
  const backup = JSON.parse(fs.readFileSync(filename, 'utf8'));
  expect(backup.format).toBe('offline-records-lab');
  expect(backup.records.some(r => r.text === 'Record A')).toBeTruthy();

  await page.getByRole('button', { name: 'Delete Record A' }).click();
  await expect(page.getByText('Record A')).toHaveCount(0);
  await page.locator('#import').setInputFiles(filename);
  await expect(page.getByText('Record A')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Backup imported');

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Record A')).toBeVisible();
  await page.getByLabel('Record', { exact: true }).fill('Offline B');
  await page.getByRole('button', { name: 'Add record' }).click();
  await expect(page.getByText('Offline B')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Offline B')).toBeVisible();
  await page.getByRole('button', { name: 'Delete Offline B' }).click();
  await expect(page.getByText('Offline B')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Offline B')).toHaveCount(0);
  await context.setOffline(false);
  fs.rmSync(dir, { recursive: true, force: true });
});
