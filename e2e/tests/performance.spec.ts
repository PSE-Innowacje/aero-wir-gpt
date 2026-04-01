import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import { ApiHelper } from '../helpers/api';
import { API_BASE, USERS } from '../helpers/constants';

/**
 * Performance E2E tests.
 *
 * These measure response times and page load performance.
 * Thresholds are set for local development — adjust for CI.
 */

const PERF_TIMEOUT = 5_000; // 5 seconds max for any single operation

test.describe('Performance — Page Load Times', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, 'admin');
  });

  const pages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Helicopters', path: '/helicopters' },
    { name: 'Crew', path: '/crew' },
    { name: 'Landing Sites', path: '/landing-sites' },
    { name: 'Operations', path: '/operations' },
    { name: 'Orders', path: '/orders' },
    { name: 'Users', path: '/users' },
  ];

  for (const p of pages) {
    test(`${p.name} page loads within ${PERF_TIMEOUT}ms`, async ({ page }) => {
      const start = Date.now();
      await page.goto(p.path);
      await page.waitForLoadState('networkidle');
      const elapsed = Date.now() - start;

      console.log(`  [PERF] ${p.name} page load: ${elapsed}ms`);
      expect(elapsed).toBeLessThan(PERF_TIMEOUT);
    });
  }

  test('Login page loads within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - start;

    console.log(`  [PERF] Login page load: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(PERF_TIMEOUT);
  });
});

test.describe('Performance — API Response Times', () => {
  const API_THRESHOLD = 2_000; // 2 seconds for API calls

  test('login API responds within threshold', async ({ request }) => {
    const start = Date.now();
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: USERS.admin.email, password: USERS.admin.password },
    });
    const elapsed = Date.now() - start;

    console.log(`  [PERF] Login API: ${elapsed}ms`);
    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(API_THRESHOLD);
  });

  test('dictionaries API responds within threshold', async ({ request }) => {
    const endpoints = [
      '/dictionaries/activity-types',
      '/dictionaries/crew-roles',
      '/dictionaries/operation-statuses',
      '/dictionaries/order-statuses',
    ];

    for (const endpoint of endpoints) {
      const start = Date.now();
      const res = await request.get(`${API_BASE}${endpoint}`);
      const elapsed = Date.now() - start;

      console.log(`  [PERF] ${endpoint}: ${elapsed}ms`);
      expect(res.status()).toBe(200);
      expect(elapsed).toBeLessThan(API_THRESHOLD);
    }
  });

  test('authenticated CRUD endpoints respond within threshold', async ({
    request,
  }) => {
    const api = new ApiHelper(request, 'admin');

    const endpoints = [
      '/helicopters',
      '/crew-members',
      '/landing-sites',
      '/users',
    ];

    for (const endpoint of endpoints) {
      const start = Date.now();
      const res = await api.get(endpoint);
      const elapsed = Date.now() - start;

      console.log(`  [PERF] GET ${endpoint}: ${elapsed}ms`);
      expect(res.status()).toBe(200);
      expect(elapsed).toBeLessThan(API_THRESHOLD);
    }
  });

  test('operations list endpoint responds within threshold', async ({
    request,
  }) => {
    const api = new ApiHelper(request, 'planner');

    const start = Date.now();
    const res = await api.get('/operations');
    const elapsed = Date.now() - start;

    console.log(`  [PERF] GET /operations: ${elapsed}ms`);
    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(API_THRESHOLD);
  });
});

test.describe('Performance — Concurrent Requests', () => {
  test('handles 10 concurrent API requests', async ({ request }) => {
    // Login first
    await request.post(`${API_BASE}/auth/login`, {
      data: { email: USERS.admin.email, password: USERS.admin.password },
    });

    const start = Date.now();
    const promises = Array.from({ length: 10 }, () =>
      request.get(`${API_BASE}/helicopters`),
    );

    const results = await Promise.all(promises);
    const elapsed = Date.now() - start;

    console.log(`  [PERF] 10 concurrent GET /helicopters: ${elapsed}ms`);

    for (const res of results) {
      expect(res.status()).toBe(200);
    }
    // All 10 requests should complete within 5 seconds
    expect(elapsed).toBeLessThan(5_000);
  });

  test('handles concurrent logins for different roles', async ({ request }) => {
    const start = Date.now();

    const logins = Object.values(USERS).map((user) =>
      request.post(`${API_BASE}/auth/login`, {
        data: { email: user.email, password: user.password },
      }),
    );

    const results = await Promise.all(logins);
    const elapsed = Date.now() - start;

    console.log(`  [PERF] 4 concurrent logins: ${elapsed}ms`);

    for (const res of results) {
      expect(res.status()).toBe(200);
    }
    expect(elapsed).toBeLessThan(3_000);
  });
});

test.describe('Performance — Navigation Speed', () => {
  test('navigating between pages is fast', async ({ page }) => {
    await loginViaUI(page, 'admin');

    const routes = [
      '/helicopters',
      '/crew',
      '/landing-sites',
      '/operations',
      '/orders',
      '/users',
      '/dashboard',
    ];

    for (const route of routes) {
      const start = Date.now();
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      const elapsed = Date.now() - start;

      console.log(`  [PERF] Navigate to ${route}: ${elapsed}ms`);
      expect(elapsed).toBeLessThan(PERF_TIMEOUT);
    }
  });
});

test.describe('Performance — Create Operations Throughput', () => {
  test('can create 5 operations in sequence under 10 seconds', async ({
    request,
  }) => {
    const api = new ApiHelper(request, 'planner');

    const start = Date.now();

    for (let i = 0; i < 5; i++) {
      const res = await api.post('/operations', {
        orderNumber: `PERF-${Date.now()}-${i}`,
        shortDescription: `Performance test operation ${i}`,
        activityTypes: ['VISUAL_INSPECTION'],
        proposedDateEarliest: '2027-01-15',
        proposedDateLatest: '2027-01-30',
      });
      expect(res.status()).toBe(201);
    }

    const elapsed = Date.now() - start;
    console.log(`  [PERF] 5 sequential operation creates: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(10_000);
  });
});
