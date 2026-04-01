import { test, type Page } from '@playwright/test';
import { USERS } from '../helpers/constants';

/**
 * Presentation walkthrough — captures screenshots and video
 * of the entire application for each user role.
 *
 * Run:   npx playwright test tests/presentation.spec.ts --headed
 * Output: e2e/screenshots/
 */

const ROLE_PAGES: Record<string, { label: string; path: string }[]> = {
  admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Helikoptery', path: '/helicopters' },
    { label: 'Załoga', path: '/crew' },
    { label: 'Lądowiska', path: '/landing-sites' },
    { label: 'Operacje lotnicze', path: '/operations' },
    { label: 'Zlecenia lotnicze', path: '/orders' },
    { label: 'Użytkownicy', path: '/users' },
  ],
  planner: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Operacje lotnicze', path: '/operations' },
  ],
  supervisor: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Helikoptery', path: '/helicopters' },
    { label: 'Załoga', path: '/crew' },
    { label: 'Lądowiska', path: '/landing-sites' },
    { label: 'Operacje lotnicze', path: '/operations' },
    { label: 'Zlecenia lotnicze', path: '/orders' },
    { label: 'Użytkownicy', path: '/users' },
  ],
  pilot: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Helikoptery', path: '/helicopters' },
    { label: 'Załoga', path: '/crew' },
    { label: 'Lądowiska', path: '/landing-sites' },
    { label: 'Operacje lotnicze', path: '/operations' },
    { label: 'Zlecenia lotnicze', path: '/orders' },
    { label: 'Użytkownicy', path: '/users' },
  ],
};

async function login(page: Page, userKey: keyof typeof USERS) {
  const user = USERS[userKey];
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `screenshots/${userKey}_00_login.png`, fullPage: true });

  await page.locator('#login').fill(user.email);
  await page.locator('#password').fill(user.password);
  await page.getByRole('button', { name: /zaloguj/i }).click();
  await page.waitForURL('**/dashboard');
  await page.waitForLoadState('networkidle');
}

test.use({
  video: 'on',
  viewport: { width: 1440, height: 900 },
});

test.describe('Presentation screenshots', () => {
  for (const [role, pages] of Object.entries(ROLE_PAGES)) {
    test(`${role} — full walkthrough`, async ({ page }) => {
      // Login
      await login(page, role as keyof typeof USERS);

      // Visit each page for this role
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        await page.goto(p.path);
        await page.waitForLoadState('networkidle');
        // Small pause for animations to finish
        await page.waitForTimeout(800);

        const idx = String(i + 1).padStart(2, '0');
        await page.screenshot({
          path: `screenshots/${role}_${idx}_${p.path.replace(/\//g, '') || 'dashboard'}.png`,
          fullPage: true,
        });
      }

      // Logout
      await page.getByRole('button', { name: /wyloguj/i }).click();
      await page.waitForURL('**/login');
      await page.waitForTimeout(500);
    });
  }
});
