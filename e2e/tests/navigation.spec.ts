import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import { NAV_ITEMS, ROUTES } from '../helpers/constants';

test.describe('Navigation & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, 'admin');
  });

  test('should display the sidebar with all navigation items', async ({ page }) => {
    const sidebar = page.locator('nav, [role="navigation"], .MuiDrawer-root');
    for (const item of NAV_ITEMS) {
      await expect(
        sidebar.getByRole('button', { name: new RegExp(item.label, 'i') }),
      ).toBeVisible();
    }
  });

  test('should display AERO logo in sidebar', async ({ page }) => {
    await expect(page.locator('.MuiDrawer-root').getByText('AERO')).toBeVisible();
  });

  test('should display system status indicator in top bar', async ({ page }) => {
    await expect(page.getByText('Operacyjny')).toBeVisible();
  });

  test('should navigate to each page via sidebar links', async ({ page }) => {
    const navEntries = [
      { label: 'Helikoptery', url: /\/helicopters/ },
      { label: 'Załoga', url: /\/crew/ },
      { label: 'Lądowiska', url: /\/landing-sites/ },
      { label: 'Operacje lotnicze', url: /\/operations/ },
      { label: 'Zlecenia lotnicze', url: /\/orders/ },
      { label: 'Użytkownicy', url: /\/users/ },
      { label: 'Dashboard', url: /\/dashboard/ },
    ];

    const sidebar = page.locator('.MuiDrawer-root');
    for (const p of navEntries) {
      await sidebar.getByRole('button', { name: new RegExp(p.label, 'i') }).click();
      await expect(page).toHaveURL(p.url);
    }
  });

  test('should redirect unknown routes to dashboard', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display user information in sidebar', async ({ page }) => {
    await expect(page.locator('.MuiDrawer-root').getByText('Jan Kowalski')).toBeVisible();
  });
});

test.describe('Page Content Verification', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, 'admin');
  });

  test('Dashboard page shows stat cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main').getByText(/światło/i)).toBeVisible();
  });

  test('Helicopters page shows fleet management header', async ({ page }) => {
    await page.goto('/helicopters');
    await expect(page.locator('main').getByText('Helikoptery')).toBeVisible();
    await expect(page.getByText('Zarządzanie flotą')).toBeVisible();
  });

  test('Crew page loads', async ({ page }) => {
    await page.goto('/crew');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Landing sites page loads', async ({ page }) => {
    await page.goto('/landing-sites');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Operations page loads', async ({ page }) => {
    await page.goto('/operations');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Orders page loads', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Users page loads', async ({ page }) => {
    await page.goto('/users');
    await expect(page.locator('main')).toBeVisible();
  });
});
