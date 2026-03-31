import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import { ApiHelper, createHelicopterViaAPI } from '../helpers/api';
import { API_BASE, USERS } from '../helpers/constants';

test.describe('Helicopters Page (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, 'admin');
    await page.goto('/helicopters');
  });

  test('should display helicopter list with correct columns', async ({ page }) => {
    const table = page.locator('table');
    await expect(table.getByText('Numer rejestracyjny')).toBeVisible();
    await expect(table.getByText('Typ helikoptera')).toBeVisible();
    await expect(table.getByText('Status')).toBeVisible();
    await expect(table.getByText('Ważność przeglądu')).toBeVisible();
    await expect(table.getByText('Zasięg (km)')).toBeVisible();
    await expect(table.getByText('Akcje')).toBeVisible();
  });

  test('should display stat cards', async ({ page }) => {
    await expect(page.getByText('Całkowita flota')).toBeVisible();
    await expect(page.getByText('W powietrzu')).toBeVisible();
    await expect(page.getByText('Dostępność')).toBeVisible();
  });

  test('should display mock helicopter data', async ({ page }) => {
    await expect(page.getByText('SP-AER1')).toBeVisible();
    await expect(page.getByText('Airbus H145')).toBeVisible();
  });

  test('should filter helicopters via search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Szukaj helikoptera...');
    await searchInput.fill('SP-AER1');

    await expect(page.getByText('SP-AER1')).toBeVisible();
    await expect(page.getByText('SP-MAINT')).not.toBeVisible();
  });

  test('should show no results message for unmatched search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Szukaj helikoptera...');
    await searchInput.fill('NONEXISTENT');
    await expect(page.getByText('Brak wyników dla podanej frazy')).toBeVisible();
  });

  test('should open add helicopter modal', async ({ page }) => {
    // Click the main page button (not inside a dialog)
    await page.locator('main').getByRole('button', { name: /dodaj helikopter/i }).click();

    // Modal should be visible with form fields
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Nowy helikopter')).toBeVisible();
    await expect(dialog.getByPlaceholder('np. SP-AER1')).toBeVisible();
    await expect(dialog.getByPlaceholder('np. Airbus H145')).toBeVisible();
  });

  test('should add a new helicopter via modal', async ({ page }) => {
    await page.locator('main').getByRole('button', { name: /dodaj helikopter/i }).click();

    const dialog = page.locator('[role="dialog"]');
    await dialog.getByPlaceholder('np. SP-AER1').fill('SP-E2E1');
    await dialog.getByPlaceholder('np. Airbus H145').fill('E2E Test Helicopter');
    await dialog.getByPlaceholder('np. 650').first().fill('700');
    await dialog.getByPlaceholder('np. 480').fill('500');

    // Click save in the dialog
    await dialog.getByRole('button', { name: /dodaj helikopter/i }).click();

    // New helicopter should appear in the table
    await expect(page.getByText('SP-E2E1')).toBeVisible();
    await expect(page.getByText('E2E Test Helicopter')).toBeVisible();
  });

  test('should edit an existing helicopter via modal', async ({ page }) => {
    // Click the first edit button in the table
    await page.locator('table').getByRole('button', { name: /edytuj/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Edycja helikoptera')).toBeVisible();

    // Modify registration
    const regInput = dialog.getByPlaceholder('np. SP-AER1');
    await regInput.clear();
    await regInput.fill('SP-EDITED');

    await dialog.getByRole('button', { name: /zapisz zmiany/i }).click();

    // Edited helicopter should appear
    await expect(page.getByText('SP-EDITED')).toBeVisible();
  });

  test('should close modal with cancel button', async ({ page }) => {
    await page.locator('main').getByRole('button', { name: /dodaj helikopter/i }).click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: /anuluj/i }).click();
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Helicopters API CRUD', () => {
  let api: ApiHelper;

  test.beforeEach(async ({ request }) => {
    api = new ApiHelper(request, 'admin');
  });

  test('should list all helicopters', async () => {
    const res = await api.get('/helicopters');
    expect(res.status()).toBe(200);
    const helicopters = await res.json();
    expect(Array.isArray(helicopters)).toBeTruthy();
    expect(helicopters.length).toBeGreaterThanOrEqual(3);
  });

  test('should create a new helicopter', async () => {
    const helicopter = await createHelicopterViaAPI(api);
    expect(helicopter.id).toBeTruthy();
    expect(helicopter.type).toBe('Test Helicopter');
    expect(helicopter.status).toBe('ACTIVE');
    expect(helicopter.rangeKm).toBe(600);
  });

  test('should get helicopter by id', async () => {
    const created = await createHelicopterViaAPI(api);
    const res = await api.get(`/helicopters/${created.id}`);
    expect(res.status()).toBe(200);
    const fetched = await res.json();
    expect(fetched.id).toBe(created.id);
    expect(fetched.registrationNumber).toBe(created.registrationNumber);
  });

  test('should update a helicopter', async () => {
    const created = await createHelicopterViaAPI(api);
    const res = await api.put(`/helicopters/${created.id}`, {
      ...created,
      type: 'Updated Helicopter',
      rangeKm: 800,
    });
    expect(res.status()).toBe(200);
    const updated = await res.json();
    expect(updated.type).toBe('Updated Helicopter');
    expect(updated.rangeKm).toBe(800);
  });

  test('INACTIVE helicopter does not require inspectionExpiryDate', async () => {
    const res = await api.post('/helicopters', {
      registrationNumber: `SP-INACTIVE-${Date.now()}`,
      type: 'Inactive Heli',
      maxCrewCount: 2,
      maxCrewWeightKg: 300,
      status: 'INACTIVE',
      rangeKm: 500,
    });
    expect(res.status()).toBe(201);
  });
});

test.describe('Helicopters Role-Based Access', () => {
  test('PILOT can read helicopters', async ({ request }) => {
    const api = new ApiHelper(request, 'pilot');
    const res = await api.get('/helicopters');
    expect(res.status()).toBe(200);
  });

  test('SUPERVISOR can read helicopters', async ({ request }) => {
    const api = new ApiHelper(request, 'supervisor');
    const res = await api.get('/helicopters');
    expect(res.status()).toBe(200);
  });
});
