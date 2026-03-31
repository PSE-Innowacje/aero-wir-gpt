import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import { ApiHelper, createLandingSiteViaAPI } from '../helpers/api';

test.describe('Landing Sites Page (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, 'admin');
    await page.goto('/landing-sites');
  });

  test('should display landing sites page', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    // Verify the sidebar shows us on the correct page
    await expect(page).toHaveURL(/\/landing-sites/);
  });
});

test.describe('Landing Sites API — CRUD', () => {
  let adminApi: ApiHelper;

  test.beforeEach(async ({ request }) => {
    adminApi = new ApiHelper(request, 'admin');
  });

  test('should list all landing sites', async () => {
    const res = await adminApi.get('/landing-sites');
    expect(res.status()).toBe(200);
    const sites = await res.json();
    expect(Array.isArray(sites)).toBeTruthy();
  });

  test('should create a landing site', async () => {
    const site = await createLandingSiteViaAPI(adminApi);
    expect(site.id).toBeTruthy();
    expect(site.latitude).toBe(52.2297);
    expect(site.longitude).toBe(21.0122);
  });

  test('should get landing site by id', async () => {
    const created = await createLandingSiteViaAPI(adminApi);
    const res = await adminApi.get(`/landing-sites/${created.id}`);
    expect(res.status()).toBe(200);
    const fetched = await res.json();
    expect(fetched.id).toBe(created.id);
    expect(fetched.name).toBe(created.name);
  });

  test('should update a landing site', async () => {
    const created = await createLandingSiteViaAPI(adminApi);
    const res = await adminApi.put(`/landing-sites/${created.id}`, {
      name: 'Updated Site',
      latitude: 50.0647,
      longitude: 19.9450,
    });
    expect(res.status()).toBe(200);
    const updated = await res.json();
    expect(updated.name).toBe('Updated Site');
    expect(updated.latitude).toBe(50.0647);
  });

  test('name is required', async () => {
    const res = await adminApi.post('/landing-sites', {
      latitude: 52.0,
      longitude: 21.0,
    });
    expect(res.status()).toBe(400);
  });
});
