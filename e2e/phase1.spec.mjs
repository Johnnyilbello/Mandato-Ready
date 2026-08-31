import { test, expect } from '@playwright/test';

const STORAGE_PREFIX = 'mandato_ready_v1_';
const REQUIRED_WIDTHS = [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440];
const WIZARD_WIDTHS = [320, 390, 430, 768, 1440];

const resetPrototypeStorage = async (page) => {
  await page.addInitScript((prefix) => {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(prefix)) window.localStorage.removeItem(key);
    }
  }, STORAGE_PREFIX);
};

const readDomainState = async (page) => page.evaluate((prefix) => {
  const read = (key) => JSON.parse(window.localStorage.getItem(`${prefix}${key}`) || '[]');
  return {
    clients: read('clients'),
    properties: read('properties'),
    practices: read('practices'),
    documents: read('documents'),
  };
}, STORAGE_PREFIX);

const assertNoHorizontalOverflow = async (page) => {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
};

const openNewPractice = async (page) => {
  await page.getByRole('button', { name: /\+ Nuovo/i }).click();
  await page.getByRole('button', { name: /Nuova pratica/i }).click();
  await expect(page.getByTestId('practice-origin-step')).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await resetPrototypeStorage(page);
});

test('Nuova Pratica creates shared Client + Property, keeps success visible and opens exact returned Practice', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Oggi' })).toBeVisible();

  await expect.poll(async () => (await readDomainState(page)).clients.length).toBeGreaterThan(0);
  const before = await readDomainState(page);

  await openNewPractice(page);
  await page.getByRole('button', { name: /Da un nuovo cliente/i }).click();

  await page.getByTestId('new-client-first-name').fill('Elena');
  await page.getByTestId('new-client-last-name').fill('QA');
  await page.getByTestId('new-client-phone').fill('+39 333 7654321');
  await page.getByTestId('new-client-email').fill('elena.phase1@example.test');

  await page.getByText('Seleziona tipologia...', { exact: true }).click();
  await page.getByPlaceholder('Cerca tipologia...').fill('Appartamento');
  await page.getByText('Appartamento', { exact: true }).click();
  await page.getByTestId('new-property-municipality').fill('Terrasini');
  await page.getByTestId('new-property-address').fill('Via QA Phase One 31');
  await page.getByTestId('new-property-surface').fill('88');

  await page.getByTestId('continue-practice-details').click();
  await expect(page.getByTestId('practice-details-step')).toBeVisible();
  await page.getByTestId('create-practice').click();

  const success = page.getByTestId('practice-success');
  await expect(success).toBeVisible();
  const createdText = await page.getByTestId('created-practice-id').innerText();
  const [createdCode, createdId] = createdText.split('·').map((part) => part.trim());
  expect(createdId).toMatch(/^prat-/);

  await expect.poll(async () => {
    const state = await readDomainState(page);
    return state.practices.some((practice) => practice.id === createdId);
  }).toBe(true);

  const after = await readDomainState(page);
  expect(after.clients).toHaveLength(before.clients.length + 1);
  expect(after.properties).toHaveLength(before.properties.length + 1);
  expect(after.practices).toHaveLength(before.practices.length + 1);

  const createdClients = after.clients.filter((client) => client.email === 'elena.phase1@example.test');
  const createdProperties = after.properties.filter((property) => property.address === 'Via QA Phase One 31');
  expect(createdClients).toHaveLength(1);
  expect(createdProperties).toHaveLength(1);

  const createdClient = createdClients[0];
  const createdProperty = createdProperties[0];
  const createdPractice = after.practices.find((practice) => practice.id === createdId);
  expect(createdPractice).toBeTruthy();
  expect(createdPractice.clientId).toBe(createdClient.id);
  expect(createdPractice.propertyId).toBe(createdProperty.id);
  expect(createdProperty.owners).toContain(createdClient.id);
  expect(createdClient.phone).toBe('+39 333 7654321');
  expect(createdClient.email).toBe('elena.phase1@example.test');
  expect(createdProperty.address).toBe('Via QA Phase One 31');
  expect(createdProperty.askingPrice).toBeUndefined();
  expect(createdProperty.estimatedValue).toBeUndefined();

  await expect(success).toBeVisible();
  await expect(page.getByTestId('open-created-practice')).toBeVisible();
  await page.getByTestId('open-created-practice').click();
  await expect(success).toBeHidden();
  await expect(page.getByText(createdCode, { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Via QA Phase One 31', { exact: false }).first()).toBeVisible();
});

test('Oggi dashboard customization persists order and reset restores recommended configuration', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Personalizza dashboard' }).click();

  const documentRow = page.getByText('Documenti mancanti', { exact: true }).locator('..').locator('..');
  await documentRow.getByRole('button', { name: 'Nascosto' }).click();
  await page.getByRole('button', { name: 'Sposta Documenti mancanti su' }).click();

  const storedBeforeReload = await page.evaluate((prefix) =>
    JSON.parse(window.localStorage.getItem(`${prefix}ui_dashboard_widgets_v1`) || '[]'), STORAGE_PREFIX
  );
  expect(storedBeforeReload.find((widget) => widget.id === 'documenti_mancanti')?.enabled).toBe(true);

  await page.reload();
  await expect(page.getByText('Documenti mancanti', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Personalizza dashboard' }).click();
  await page.getByRole('button', { name: 'Ripristina configurazione consigliata' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Documenti mancanti' })).toHaveCount(0);
});

test('required viewport sequence has no page-level horizontal overflow on Oggi', async ({ page }) => {
  await page.goto('/');
  for (const width of REQUIRED_WIDTHS) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await assertNoHorizontalOverflow(page);
  }
});

test('affected Nuova Pratica form has no page-level horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await openNewPractice(page);
  await page.getByRole('button', { name: /Da un nuovo cliente/i }).click();
  await expect(page.getByTestId('practice-subjects-step')).toBeVisible();

  for (const width of WIZARD_WIDTHS) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await assertNoHorizontalOverflow(page);
  }
});
