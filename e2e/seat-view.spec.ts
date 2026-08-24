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
  await expect(page.getByText(/Procedural model/)).toBeVisible();

  expect(runtimeErrors).toEqual([]);
});

test('selects a section, row, and seat from accessible controls', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.getByLabel('Choose a stadium section').selectOption('lower-01');
  await page.getByLabel('Choose a row', { exact: true }).selectOption('5');
  await page.getByLabel('Choose a seat', { exact: true }).selectOption('3');

  await expect(
    page.getByText('lower-01 · Row 5 · Seat 3', { exact: true }),
  ).toBeVisible();
});
