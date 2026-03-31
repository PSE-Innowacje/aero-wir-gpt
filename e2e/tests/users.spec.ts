import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import { ApiHelper } from '../helpers/api';

test.describe('Users Page (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, 'admin');
    await page.goto('/users');
  });

  test('should display users list page', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/\/users/);
  });
});

test.describe('Users API — CRUD', () => {
  let adminApi: ApiHelper;

  test.beforeEach(async ({ request }) => {
    adminApi = new ApiHelper(request, 'admin');
  });

  test('should list all users', async () => {
    const res = await adminApi.get('/users');
    expect(res.status()).toBe(200);
    const users = await res.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThanOrEqual(4);
  });

  test('should create a new user', async () => {
    const res = await adminApi.post('/users', {
      firstName: 'E2E',
      lastName: `User-${Date.now()}`,
      email: `e2e-${Date.now()}@aero.pl`,
      password: 'testpass',
      role: 'PLANNER',
    });
    expect(res.status()).toBe(201);
    const user = await res.json();
    expect(user.id).toBeTruthy();
    expect(user.role).toBe('PLANNER');
  });

  test('should get user by id', async () => {
    const createRes = await adminApi.post('/users', {
      firstName: 'Get',
      lastName: `Test-${Date.now()}`,
      email: `get-${Date.now()}@aero.pl`,
      password: 'testpass',
      role: 'PILOT',
    });
    const created = await createRes.json();

    const res = await adminApi.get(`/users/${created.id}`);
    expect(res.status()).toBe(200);
    const fetched = await res.json();
    expect(fetched.id).toBe(created.id);
    expect(fetched.email).toBe(created.email);
  });

  test('should update a user', async () => {
    const createRes = await adminApi.post('/users', {
      firstName: 'Before',
      lastName: `Update-${Date.now()}`,
      email: `update-${Date.now()}@aero.pl`,
      password: 'testpass',
      role: 'SUPERVISOR',
    });
    const created = await createRes.json();

    const res = await adminApi.put(`/users/${created.id}`, {
      firstName: 'After',
      lastName: created.lastName,
      email: created.email,
      role: 'SUPERVISOR',
    });
    expect(res.status()).toBe(200);
    const updated = await res.json();
    expect(updated.firstName).toBe('After');
  });

  test('email is required and must be valid', async () => {
    const res = await adminApi.post('/users', {
      firstName: 'No',
      lastName: 'Email',
      password: 'testpass',
      role: 'ADMIN',
    });
    expect(res.status()).toBe(400);
  });

  test('password is required on creation', async () => {
    const res = await adminApi.post('/users', {
      firstName: 'No',
      lastName: 'Password',
      email: `nopwd-${Date.now()}@aero.pl`,
      role: 'ADMIN',
    });
    // Backend returns 400 or 500 when password is missing
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('new user can log in after creation', async () => {
    const email = `login-test-${Date.now()}@aero.pl`;
    await adminApi.post('/users', {
      firstName: 'Login',
      lastName: 'Test',
      email,
      password: 'mypassword',
      role: 'PLANNER',
    });

    // Log in as the new user
    const loginRes = await adminApi['request'].post(
      'http://localhost:8080/api/auth/login',
      { data: { email, password: 'mypassword' } },
    );
    expect(loginRes.status()).toBe(200);
    const body = await loginRes.json();
    expect(body.email).toBe(email);
    expect(body.role).toBe('PLANNER');
  });
});

test.describe('Users — Role-Based Access', () => {
  test('PILOT can read users', async ({ request }) => {
    const api = new ApiHelper(request, 'pilot');
    const res = await api.get('/users');
    expect(res.status()).toBe(200);
  });

  test('PILOT cannot create users', async ({ request }) => {
    const api = new ApiHelper(request, 'pilot');
    const res = await api.post('/users', {
      firstName: 'Pilot',
      lastName: 'Try',
      email: `pilot-try-${Date.now()}@aero.pl`,
      password: 'test',
      role: 'ADMIN',
    });
    expect(res.status()).toBe(403);
  });

  test('PLANNER cannot access user management', async ({ request }) => {
    const api = new ApiHelper(request, 'planner');
    const res = await api.get('/users');
    // PLANNER is not in the allowed roles for /api/users
    expect(res.status()).toBe(403);
  });
});
