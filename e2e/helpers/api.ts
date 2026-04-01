import { type APIRequestContext, expect } from '@playwright/test';
import { API_BASE, USERS } from './constants';

type UserKey = keyof typeof USERS;

/**
 * Helper to perform authenticated API calls.
 * Logs in first, then makes the request using the same context (cookies persist).
 */
export class ApiHelper {
  constructor(
    private request: APIRequestContext,
    private userKey: UserKey,
  ) {}

  private loggedIn = false;
  private static lastLoggedInUser: string | null = null;

  async ensureLoggedIn(): Promise<void> {
    // Re-login if a different user was last logged in on this shared context
    if (this.loggedIn && ApiHelper.lastLoggedInUser === this.userKey) return;
    const user = USERS[this.userKey];
    const res = await this.request.post(`${API_BASE}/auth/login`, {
      data: { email: user.email, password: user.password },
    });
    expect(res.status()).toBe(200);
    this.loggedIn = true;
    ApiHelper.lastLoggedInUser = this.userKey;
  }

  async get(path: string) {
    await this.ensureLoggedIn();
    return this.request.get(`${API_BASE}${path}`);
  }

  async post(path: string, data?: unknown) {
    await this.ensureLoggedIn();
    return this.request.post(`${API_BASE}${path}`, { data });
  }

  async put(path: string, data?: unknown) {
    await this.ensureLoggedIn();
    return this.request.put(`${API_BASE}${path}`, { data });
  }
}

/** Create a helicopter via API and return its id */
export async function createHelicopterViaAPI(
  api: ApiHelper,
  overrides: Record<string, unknown> = {},
) {
  const data = {
    registrationNumber: `SP-TEST-${Date.now()}`,
    type: 'Test Helicopter',
    maxCrewCount: 4,
    maxCrewWeightKg: 450,
    status: 'ACTIVE',
    inspectionExpiryDate: '2027-12-31',
    rangeKm: 600,
    ...overrides,
  };
  const res = await api.post('/helicopters', data);
  expect(res.status()).toBe(201);
  return res.json();
}

/** Create a crew member via API and return its id */
export async function createCrewMemberViaAPI(
  api: ApiHelper,
  overrides: Record<string, unknown> = {},
) {
  const data = {
    firstName: 'Test',
    lastName: `Member-${Date.now()}`,
    email: `test-${Date.now()}@aero.pl`,
    weightKg: 80,
    role: 'OBSERVER',
    trainingExpiryDate: '2027-12-31',
    ...overrides,
  };
  const res = await api.post('/crew-members', data);
  expect(res.status()).toBe(201);
  return res.json();
}

/** Create a landing site via API and return its id */
export async function createLandingSiteViaAPI(
  api: ApiHelper,
  overrides: Record<string, unknown> = {},
) {
  const data = {
    name: `Test Site ${Date.now()}`,
    latitude: 52.2297,
    longitude: 21.0122,
    ...overrides,
  };
  const res = await api.post('/landing-sites', data);
  expect(res.status()).toBe(201);
  return res.json();
}

/** Create a flight operation via API and return its response */
export async function createOperationViaAPI(
  api: ApiHelper,
  overrides: Record<string, unknown> = {},
) {
  const data = {
    orderNumber: `OP-${Date.now()}`,
    shortDescription: 'E2E test operation',
    activityTypes: ['VISUAL_INSPECTION'],
    proposedDateEarliest: '2027-01-15',
    proposedDateLatest: '2027-01-30',
    ...overrides,
  };
  const res = await api.post('/operations', data);
  expect(res.status()).toBe(201);
  return res.json();
}
