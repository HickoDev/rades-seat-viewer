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
  await expect(page.getByText(/Calibrated model/)).toBeVisible();

  expect(runtimeErrors).toEqual([]);
});

test('keeps the control sheet available on a compact viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByLabel('Interactive stadium view')).toBeVisible();
  await expect(page.getByLabel('Choose a stadium section')).toBeVisible();
  await expect(page.getByLabel('Rendering quality')).toBeVisible();
});

test('selects a section, row, and seat from accessible controls', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.route('**/v1/forecast?**', async (route) => {
    const url = new URL(route.request().url());
    const day = url.searchParams.get('start_date') ?? '2026-08-24';
    const time = Array.from(
      { length: 24 },
      (_, hour) => `${day}T${hour.toString().padStart(2, '0')}:00`,
    );
    const values = (value: number) => time.map(() => value);
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        latitude: 36.75,
        longitude: 10.27,
        timezone: 'Africa/Tunis',
        utc_offset_seconds: 3600,
        hourly: {
          time,
          temperature_2m: values(31),
          apparent_temperature: values(33),
          cloud_cover: values(18),
          cloud_cover_low: values(10),
          cloud_cover_mid: values(5),
          cloud_cover_high: values(3),
          direct_radiation: values(540),
          direct_normal_irradiance: values(720),
          shortwave_radiation: values(610),
          precipitation_probability: values(4),
          wind_speed_10m: values(16),
          weather_code: values(1),
        },
      }),
    });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Rendering quality').selectOption('low');
  await expect(page.getByLabel('Rendering quality')).toHaveValue('low');

  await page.getByLabel('Choose a stadium section').selectOption('lower-01');
  await expect(page.getByText(/no individual plastic seats/i)).toBeVisible();
  await page.getByLabel('Choose a stadium section').selectOption('lower-05');
  await page.getByLabel('Choose a row', { exact: true }).selectOption('5');
  await page.getByLabel('Choose a seat', { exact: true }).selectOption('3');

  await expect(
    page.getByText('lower-05 · Row 5 · Seat 3', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Back to stadium' }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Use today at 16:00 as an example' })
    .click();
  await page.getByRole('button', { name: 'Enable sun simulation' }).click();
  await expect(page.getByText('Peak glare', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Enable weather forecast' }).click();
  await expect(
    page.getByText('Kickoff forecast', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('31°C', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Enable sunlight heatmap' }).click();
  await expect(page.getByText(/40 representative groups/)).toBeVisible({
    timeout: 20_000,
  });
  await page.getByLabel('Heatmap representative detail').selectOption('row');
  await expect(page.getByText(/1060 representative groups/)).toBeVisible({
    timeout: 25_000,
  });
  await page.getByRole('button', { name: 'Back to stadium' }).click();
  await expect(page.getByText('overview', { exact: true })).toBeVisible();
});
