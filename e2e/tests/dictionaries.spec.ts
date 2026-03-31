import { test, expect } from '@playwright/test';
import { API_BASE } from '../helpers/constants';

/**
 * Dictionary endpoints are PUBLIC — no authentication required.
 */
test.describe('Dictionaries API', () => {
  test('should return activity types', async ({ request }) => {
    const res = await request.get(`${API_BASE}/dictionaries/activity-types`);
    expect(res.status()).toBe(200);

    const types = await res.json();
    expect(Array.isArray(types)).toBeTruthy();
    expect(types.length).toBeGreaterThan(0);

    const values = types.map((t: { value: string }) => t.value);
    expect(values).toContain('VISUAL_INSPECTION');
    expect(values).toContain('PHOTOS');
    expect(values).toContain('PATROL');
  });

  test('should return crew roles', async ({ request }) => {
    const res = await request.get(`${API_BASE}/dictionaries/crew-roles`);
    expect(res.status()).toBe(200);

    const roles = await res.json();
    expect(roles.length).toBe(2);

    const values = roles.map((r: { value: string }) => r.value);
    expect(values).toContain('PILOT');
    expect(values).toContain('OBSERVER');
  });

  test('should return operation statuses (7 statuses)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/dictionaries/operation-statuses`);
    expect(res.status()).toBe(200);

    const statuses = await res.json();
    expect(statuses.length).toBe(7);

    const values = statuses.map((s: { value: string }) => s.value);
    expect(values).toContain('SUBMITTED');
    expect(values).toContain('REJECTED');
    expect(values).toContain('CONFIRMED');
    expect(values).toContain('SCHEDULED');
    expect(values).toContain('PARTIALLY_COMPLETED');
    expect(values).toContain('COMPLETED');
    expect(values).toContain('CANCELLED');
  });

  test('should return order statuses (7 statuses)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/dictionaries/order-statuses`);
    expect(res.status()).toBe(200);

    const statuses = await res.json();
    expect(statuses.length).toBe(7);

    const values = statuses.map((s: { value: string }) => s.value);
    expect(values).toContain('SUBMITTED');
    expect(values).toContain('SENT_FOR_APPROVAL');
    expect(values).toContain('REJECTED');
    expect(values).toContain('APPROVED');
    expect(values).toContain('PARTIALLY_COMPLETED');
    expect(values).toContain('COMPLETED');
    expect(values).toContain('NOT_COMPLETED');
  });

  test('dictionary entries have value and label fields', async ({ request }) => {
    const res = await request.get(`${API_BASE}/dictionaries/crew-roles`);
    const roles = await res.json();

    for (const role of roles) {
      expect(role.value).toBeTruthy();
      expect(role.label).toBeTruthy();
      expect(typeof role.value).toBe('string');
      expect(typeof role.label).toBe('string');
    }
  });

  test('activity type labels are in Polish', async ({ request }) => {
    const res = await request.get(`${API_BASE}/dictionaries/activity-types`);
    const types = await res.json();

    const inspection = types.find(
      (t: { value: string }) => t.value === 'VISUAL_INSPECTION',
    );
    expect(inspection).toBeTruthy();
    expect(inspection.label).toBe('Oględziny wizualne');
  });
});
