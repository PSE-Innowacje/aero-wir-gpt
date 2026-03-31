import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import { ApiHelper, createCrewMemberViaAPI } from '../helpers/api';

test.describe('Crew Members Page (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, 'admin');
    await page.goto('/crew');
  });

  test('should display crew page content', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Crew Members API — CRUD', () => {
  let adminApi: ApiHelper;

  test.beforeEach(async ({ request }) => {
    adminApi = new ApiHelper(request, 'admin');
  });

  test('should list all crew members', async () => {
    const res = await adminApi.get('/crew-members');
    expect(res.status()).toBe(200);
    const crew = await res.json();
    expect(Array.isArray(crew)).toBeTruthy();
    expect(crew.length).toBeGreaterThanOrEqual(4);
  });

  test('should create an OBSERVER crew member', async () => {
    const member = await createCrewMemberViaAPI(adminApi);
    expect(member.id).toBeTruthy();
    expect(member.role).toBe('OBSERVER');
    expect(member.weightKg).toBe(80);
  });

  test('should create a PILOT crew member with license', async () => {
    const member = await createCrewMemberViaAPI(adminApi, {
      role: 'PILOT',
      pilotLicenseNumber: 'PL-E2E-001',
      licenseExpiryDate: '2028-06-30',
    });
    expect(member.id).toBeTruthy();
    expect(member.role).toBe('PILOT');
    expect(member.pilotLicenseNumber).toBe('PL-E2E-001');
  });

  test('should get crew member by id', async () => {
    const created = await createCrewMemberViaAPI(adminApi);
    const res = await adminApi.get(`/crew-members/${created.id}`);
    expect(res.status()).toBe(200);
    const fetched = await res.json();
    expect(fetched.id).toBe(created.id);
  });

  test('should update a crew member', async () => {
    const created = await createCrewMemberViaAPI(adminApi);
    const res = await adminApi.put(`/crew-members/${created.id}`, {
      firstName: 'Updated',
      lastName: created.lastName,
      email: created.email,
      weightKg: 90,
      role: 'OBSERVER',
      trainingExpiryDate: '2028-06-30',
    });
    expect(res.status()).toBe(200);
    const updated = await res.json();
    expect(updated.firstName).toBe('Updated');
    expect(updated.weightKg).toBe(90);
  });

  test('weight must be between 30 and 200', async () => {
    const tooLight = await adminApi.post('/crew-members', {
      firstName: 'Too',
      lastName: 'Light',
      email: `light-${Date.now()}@aero.pl`,
      weightKg: 10,
      role: 'OBSERVER',
      trainingExpiryDate: '2027-12-31',
    });
    expect(tooLight.status()).toBe(400);

    const tooHeavy = await adminApi.post('/crew-members', {
      firstName: 'Too',
      lastName: 'Heavy',
      email: `heavy-${Date.now()}@aero.pl`,
      weightKg: 250,
      role: 'OBSERVER',
      trainingExpiryDate: '2027-12-31',
    });
    expect(tooHeavy.status()).toBe(400);
  });
});

test.describe('Crew Members — Role-Based Access', () => {
  test('PILOT can read crew members', async ({ request }) => {
    const api = new ApiHelper(request, 'pilot');
    const res = await api.get('/crew-members');
    expect(res.status()).toBe(200);
  });

  test('SUPERVISOR can read crew members', async ({ request }) => {
    const api = new ApiHelper(request, 'supervisor');
    const res = await api.get('/crew-members');
    expect(res.status()).toBe(200);
  });
});
