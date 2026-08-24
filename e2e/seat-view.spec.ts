import { expect, test } from '@playwright/test';

test('loads the foundation scene without runtime errors', async ({ page }) => {
  const runtimeErrors: string[] = [];

  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.push(message.text());
    }
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Radès View' })).toBeVisible();
  await expect(page.getByLabel('Stadium controls')).toBeVisible();
  await expect(page.getByLabel('Interactive stadium view')).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText('Procedural model · Foundation')).toBeVisible();

  expect(runtimeErrors).toEqual([]);
});
