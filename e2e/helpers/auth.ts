import { type Page, type APIRequestContext } from '@playwright/test';
import { USERS, API_BASE } from './constants';

type UserKey = keyof typeof USERS;

/**
 * Log in via the UI login page.
 * The login page has id="login" (email) and id="password".
 */
export async function loginViaUI(page: Page, userKey: UserKey): Promise<void> {
  const user = USERS[userKey];
  await page.goto('/login');
  await page.locator('#login').fill(user.email);
  await page.locator('#password').fill(user.password);
  await page.getByRole('button', { name: /zaloguj/i }).click();
  await page.waitForURL('**/dashboard');
}

/**
 * Log in via the backend API directly (faster, no UI needed).
 * Returns the session cookie for subsequent requests.
 */
export async function loginViaAPI(
  request: APIRequestContext,
  userKey: UserKey,
): Promise<string> {
  const user = USERS[userKey];
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: { email: user.email, password: user.password },
  });
  if (response.status() !== 200) {
    throw new Error(`Login failed for ${user.email}: ${response.status()}`);
  }

  const cookies = response.headers()['set-cookie'] ?? '';
  const match = cookies.match(/JSESSIONID=([^;]+)/);
  return match ? match[1] : '';
}

/**
 * Create an API request context with an active session.
 */
export async function authenticatedRequest(
  request: APIRequestContext,
  userKey: UserKey,
): Promise<void> {
  await loginViaAPI(request, userKey);
}
