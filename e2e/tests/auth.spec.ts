import { test, expect } from '@playwright/test';
import { USERS, API_BASE } from '../helpers/constants';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display the login page with AERO branding', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('AERO');
    await expect(page.locator('#login')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /zaloguj/i })).toBeVisible();
  });

  test('should have proper form labels in Polish', async ({ page }) => {
    await expect(page.getByText('Email / Login')).toBeVisible();
    await expect(page.getByText('Hasło')).toBeVisible();
    await expect(page.getByText('Panel Autoryzacji')).toBeVisible();
  });

  for (const [roleName, user] of Object.entries(USERS)) {
    test(`should login successfully as ${roleName} (${user.email})`, async ({ page }) => {
      await page.locator('#login').fill(user.email);
      await page.locator('#password').fill(user.password);
      await page.getByRole('button', { name: /zaloguj/i }).click();

      // Should navigate to dashboard after login
      await page.waitForURL('**/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  }

  test('should show empty fields on initial load', async ({ page }) => {
    await expect(page.locator('#login')).toHaveValue('');
    await expect(page.locator('#password')).toHaveValue('');
  });

  test('should display system status indicator', async ({ page }) => {
    await expect(page.getByText('OPERACYJNY')).toBeVisible();
    await expect(page.getByText('Status Systemu')).toBeVisible();
  });

  test('should display security notice', async ({ page }) => {
    await expect(
      page.getByText(/Dostęp ograniczony do autoryzowanego personelu/),
    ).toBeVisible();
  });
});

test.describe('Authentication API', () => {
  for (const [roleName, user] of Object.entries(USERS)) {
    test(`API: login as ${roleName} returns user data`, async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/login`, {
        data: { email: user.email, password: user.password },
      });
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.email).toBe(user.email);
      expect(body.role).toBe(user.role);
      expect(body.id).toBeTruthy();
    });
  }

  test('API: login with invalid credentials returns 401', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'invalid@aero.pl', password: 'wrong' },
    });
    expect(response.status()).toBe(401);
  });

  test('API: /auth/me returns user after login', async ({ request }) => {
    // Login first
    await request.post(`${API_BASE}/auth/login`, {
      data: { email: USERS.admin.email, password: USERS.admin.password },
    });

    const response = await request.get(`${API_BASE}/auth/me`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.email).toBe(USERS.admin.email);
    expect(body.role).toBe('ADMIN');
  });

  test('API: /auth/me returns 401 without login', async ({ request }) => {
    const response = await request.get(`${API_BASE}/auth/me`);
    expect(response.status()).toBe(401);
  });

  test('API: logout invalidates session', async ({ request }) => {
    // Login
    await request.post(`${API_BASE}/auth/login`, {
      data: { email: USERS.admin.email, password: USERS.admin.password },
    });

    // Logout
    const logoutRes = await request.post(`${API_BASE}/auth/logout`);
    expect(logoutRes.status()).toBe(200);

    // /me should now return 401
    const meRes = await request.get(`${API_BASE}/auth/me`);
    expect(meRes.status()).toBe(401);
  });

  test('API: /auth/users returns list of all users', async ({ request }) => {
    await request.post(`${API_BASE}/auth/login`, {
      data: { email: USERS.admin.email, password: USERS.admin.password },
    });

    const response = await request.get(`${API_BASE}/auth/users`);
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThanOrEqual(4);

    const emails = users.map((u: { email: string }) => u.email);
    expect(emails).toContain('admin@aero.pl');
    expect(emails).toContain('planista@aero.pl');
    expect(emails).toContain('nadzor@aero.pl');
    expect(emails).toContain('pilot@aero.pl');
  });
});
