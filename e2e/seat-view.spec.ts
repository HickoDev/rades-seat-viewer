import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Headless browsers have a much smaller GPU budget than an interactive tab.
  // Reduced motion keeps the R3F canvas demand-driven while preserving the
  // complete geometry and every interaction covered below.
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function configureMatch(
  page: Page,
  start = '2026-08-26T16:00',
  end = '2026-08-26T18:00',
) {
  await expect(
    page.getByRole('heading', { name: 'When is the match?' }),
  ).toBeVisible();
  await page.getByLabel('Match kickoff time').fill(start);
  await page.getByLabel('Expected match end time').fill(end);
  await page
    .getByRole('button', { name: 'Continue to seat selection' })
    .click({ force: true });
  await expect(
    page.getByRole('heading', { name: 'When is the match?' }),
  ).not.toBeVisible();
}

async function useLowQuality(page: Page) {
  const settings = page.getByText('View and performance settings', {
    exact: true,
  });
  await settings.click();
  await page.getByLabel('Rendering quality').selectOption('low');
}

test('loads the setup flow and foundation scene without runtime errors', async ({
  page,
}) => {
  const runtimeErrors: string[] = [];

  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  await page.goto('/?quality=low', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'When is the match?' }),
  ).toBeVisible();
  await configureMatch(page);

  await expect(page.getByRole('heading', { name: 'Radès View' })).toBeVisible();
  await expect(page.getByLabel('Stadium controls')).toBeVisible();
  await expect(page.getByLabel('Interactive stadium view')).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText('Match selected', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Kickoff weather', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Stadium exposure map', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Play games/i })).toHaveAttribute(
    'href',
    'https://hickodev.itch.io/',
  );
  await expect(page.getByRole('link', { name: /github/i })).toHaveAttribute(
    'href',
    'https://github.com/HickoDev',
  );
  await expect(page.getByRole('link', { name: /instagram/i })).toHaveAttribute(
    'href',
    'https://www.instagram.com/alidridi_9/?hl=en',
  );
  await expect(page.getByRole('link', { name: /facebook/i })).toHaveAttribute(
    'href',
    'https://www.facebook.com/ali.dridi.319/',
  );

  expect(runtimeErrors).toEqual([]);
});

test('keeps the control sheet available on a compact viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?quality=low', { waitUntil: 'domcontentloaded' });
  await configureMatch(page);

  await expect(page.getByLabel('Interactive stadium view')).toBeVisible();
  await expect(page.getByLabel('Choose a stadium section')).toBeVisible();
  await expect(
    page.getByText('View and performance settings', { exact: true }),
  ).toBeVisible();
});

test('offers repeatable interior comparison viewpoints', async ({ page }) => {
  // A complete high-detail scene from the preceding browser cases can leave
  // headless Chromium reclaiming GPU resources while this case starts.
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?quality=low', { waitUntil: 'domcontentloaded' });
  await configureMatch(page);
  await useLowQuality(page);
  await page
    .getByLabel('Choose an interior comparison view')
    .selectOption('virage-one');

  await expect(
    page.getByLabel('Choose an interior comparison view'),
  ).toHaveValue('virage-one');
  await expect(
    page.getByRole('button', { name: 'Back to stadium overview' }),
  ).toBeVisible();
});

test('keeps upper virage sections closed to public selection', async ({
  page,
}) => {
  await page.goto('/?quality=low', { waitUntil: 'domcontentloaded' });
  await configureMatch(page);

  const upperVirageOptions = page.locator('option[value="upper-01"]');
  const lowerVirageOptions = page.locator('option[value="lower-01"]');
  await expect(upperVirageOptions).toHaveCount(1);
  await expect(upperVirageOptions).toHaveAttribute('disabled', '');
  await expect(lowerVirageOptions).not.toHaveAttribute('disabled', '');
  await expect(page.locator('option[value="lower-05"]')).toContainText(
    'Enceinte inférieure',
  );
  await expect(page.locator('option[value="upper-12"]')).toContainText(
    'Enceinte supérieure',
  );
  await expect(page.locator('option[value="lower-21"]')).toContainText(
    'Pelouse',
  );
  await expect(page.locator('option[value="upper-28"]')).toContainText(
    'Pelouse',
  );
});

test('uses the selected Tunis time for day, twilight, and night lighting', async ({
  page,
}) => {
  await page.goto('/?quality=low', { waitUntil: 'domcontentloaded' });
  await configureMatch(page, '2026-08-26T22:00', '2026-08-26T23:30');
  await useLowQuality(page);

  await expect(
    page.getByText('Night sky / stadium floodlights on', { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Sun preview time')).toBeVisible();
});

test('automatically shows weather, exposure, and heatmap after seat selection', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 900, height: 960 });
  await page.route('**/v1/forecast?**', async (route) => {
    const url = new URL(route.request().url());
    const day = url.searchParams.get('start_date') ?? '2026-08-26';
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
  await page.goto('/?quality=low', { waitUntil: 'domcontentloaded' });
  await configureMatch(page);
  await useLowQuality(page);

  await page.getByLabel('Choose a stadium section').selectOption('lower-01');
  await expect(page.getByText(/no individual plastic seats/i)).toBeVisible();
  await expect(page.getByText('Virage POV', { exact: true })).toBeVisible();
  await page.getByLabel('Choose a stadium section').selectOption('lower-05');
  await page.getByLabel('Choose a row', { exact: true }).selectOption('5');
  await page.getByLabel('Choose a seat', { exact: true }).selectOption('3');

  await expect(
    page.getByText('lower-05 · Row 5 · Seat 3', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Peak glare', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Kickoff weather', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('31°C', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Hot', { exact: true })).toBeVisible();
  await expect(
    page.getByText(/(Direct sun|Stadium shade) at this time/),
  ).toBeVisible();
  await expect(page.getByText(/64 mapped groups/)).toBeVisible({
    timeout: 25_000,
  });
  await expect(
    page.getByText(/spectator clothing colors stay unchanged/i),
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Open top-view exposure plan' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Stadium exposure plan' }),
  ).toBeVisible();
  await expect(page.locator('.exposure-map-zone')).toHaveCount(64);
  await expect(page.locator('.exposure-map-zone--unavailable')).toHaveCount(0);
  await page.locator('[data-section-id="lower-05"]').click();
  await expect(page.locator('.exposure-map-detail')).toContainText('Section 5');
  await page.locator('[data-section-id="upper-01"]').click();
  await expect(page.locator('.exposure-map-detail')).toContainText(
    'Closed to visitors · sunlight map only',
  );
  await page.getByRole('button', { name: 'Close exposure map' }).click();
  await expect(
    page.getByRole('heading', { name: 'Stadium exposure plan' }),
  ).not.toBeVisible();

  await page.getByText('Map settings', { exact: true }).click();
  await page.getByLabel('Heatmap representative detail').selectOption('row');
  await expect(
    page.locator('.heatmap-result').filter({ hasText: 'row detail' }),
  ).toContainText(/\d+ mapped groups/, { timeout: 30_000 });
  await page.getByRole('button', { name: 'Back to stadium overview' }).click();
});
