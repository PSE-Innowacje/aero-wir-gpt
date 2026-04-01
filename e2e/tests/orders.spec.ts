import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import {
  ApiHelper,
  createHelicopterViaAPI,
  createCrewMemberViaAPI,
  createLandingSiteViaAPI,
  createOperationViaAPI,
} from '../helpers/api';

/* ────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────── */

async function createConfirmedOperation(
  plannerApi: ApiHelper,
  supervisorApi: ApiHelper,
) {
  const op = await createOperationViaAPI(plannerApi, {
    plannedDateEarliest: '2027-03-01',
    plannedDateLatest: '2027-03-31',
  });
  const confirmRes = await supervisorApi.post(`/operations/${op.id}/status`, {
    action: 'confirm',
  });
  expect(confirmRes.status()).toBe(200);
  return (await confirmRes.json()) as { id: string; routeLengthKm: number };
}

async function buildOrderPayload(
  adminApi: ApiHelper,
  plannerApi: ApiHelper,
  supervisorApi: ApiHelper,
  pilotApi: ApiHelper,
) {
  const heli = await createHelicopterViaAPI(adminApi, {
    rangeKm: 800,
    maxCrewWeightKg: 500,
    inspectionExpiryDate: '2028-12-31',
  });
  const pilot = await createCrewMemberViaAPI(adminApi, {
    role: 'PILOT',
    weightKg: 80,
    pilotLicenseNumber: `LIC-${Date.now()}`,
    licenseExpiryDate: '2028-12-31',
    trainingExpiryDate: '2028-12-31',
  });
  const crew1 = await createCrewMemberViaAPI(adminApi, {
    role: 'OBSERVER',
    weightKg: 70,
    trainingExpiryDate: '2028-12-31',
  });
  const depSite = await createLandingSiteViaAPI(adminApi);
  const arrSite = await createLandingSiteViaAPI(adminApi, {
    name: `Arrival ${Date.now()}`,
    latitude: 50.06,
    longitude: 19.94,
  });
  const confirmedOp = await createConfirmedOperation(plannerApi, supervisorApi);

  const meRes = await pilotApi.get('/auth/me');
  const me = await meRes.json();
  await adminApi.put(`/users/${me.id}`, {
    firstName: me.firstName,
    lastName: me.lastName,
    email: me.email,
    role: me.role,
    crewMemberId: pilot.id,
  });

  return {
    heli,
    pilot,
    crew1,
    depSite,
    arrSite,
    confirmedOp,
    payload: {
      plannedDeparture: '2027-06-15T08:00:00',
      plannedArrival: '2027-06-15T12:00:00',
      helicopterId: heli.id,
      crewMemberIds: [crew1.id],
      departureSiteId: depSite.id,
      arrivalSiteId: arrSite.id,
      operationIds: [confirmedOp.id],
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────
 * UI Tests
 * ──────────────────────────────────────────────────────────────────────── */

test.describe('Orders Page (UI)', () => {
  test('should display orders list page as admin', async ({ page }) => {
    await loginViaUI(page, 'admin');
    await page.goto('/orders');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/\/orders/);
  });

  test('PLANNER should not see orders in navigation', async ({ page }) => {
    await loginViaUI(page, 'planner');
    await expect(
      page.getByRole('button', { name: /zlecenia lotnicze/i }),
    ).not.toBeVisible();
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * API — CRUD
 * ──────────────────────────────────────────────────────────────────────── */

test.describe('Orders API — CRUD', () => {
  test('PILOT can create an order with valid data', async ({ request }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const { payload, heli, pilot, crew1 } = await buildOrderPayload(
      adminApi, plannerApi, supervisorApi, pilotApi,
    );

    const res = await pilotApi.post('/orders', payload);
    expect(res.status()).toBe(201);
    const order = await res.json();

    // Verify all returned fields
    expect(order.id).toBeTruthy();
    expect(order.status).toBe('SUBMITTED');
    expect(order.statusLabel).toBe('Wprowadzone');
    expect(order.pilotId).toBe(pilot.id);
    expect(order.helicopterId).toBe(heli.id);
    // Crew weight = pilot (80) + crew1 (70) = 150
    expect(order.crewWeightKg).toBe(pilot.weightKg + crew1.weightKg);
    expect(order.estimatedRouteLengthKm).toBeGreaterThanOrEqual(0);
  });

  test('should get order by id with full details', async ({ request }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const { payload } = await buildOrderPayload(
      adminApi, plannerApi, supervisorApi, pilotApi,
    );
    const createRes = await pilotApi.post('/orders', payload);
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();

    const res = await pilotApi.get(`/orders/${created.id}`);
    expect(res.status()).toBe(200);
    const order = await res.json();

    expect(order.id).toBe(created.id);
    expect(order.helicopterId).toBe(payload.helicopterId);
    expect(order.departureSiteId).toBe(payload.departureSiteId);
    expect(order.arrivalSiteId).toBe(payload.arrivalSiteId);
    expect(order.operationIds).toContain(payload.operationIds[0]);
    expect(order.plannedDeparture).toContain('2027-06-15');
  });

  test('should list orders and find created one', async ({ request }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const { payload } = await buildOrderPayload(
      adminApi, plannerApi, supervisorApi, pilotApi,
    );
    const created = await (await pilotApi.post('/orders', payload)).json();

    // Submit for approval so it appears in default list (SENT_FOR_APPROVAL)
    await pilotApi.post(`/orders/${created.id}/status`, { action: 'submitForApproval' });

    const res = await pilotApi.get('/orders');
    expect(res.status()).toBe(200);
    const orders = await res.json();
    expect(Array.isArray(orders)).toBeTruthy();

    const found = orders.find((o: { id: string }) => o.id === created.id);
    expect(found).toBeTruthy();
    expect(found.status).toBe('SENT_FOR_APPROVAL');
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * API — Status Transitions
 * ──────────────────────────────────────────────────────────────────────── */

test.describe('Orders API — Status Transitions', () => {
  test('SUBMITTED → SENT_FOR_APPROVAL → APPROVED (and operation becomes SCHEDULED)', async ({
    request,
  }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const { payload, confirmedOp } = await buildOrderPayload(
      adminApi, plannerApi, supervisorApi, pilotApi,
    );

    // 1. Create → SUBMITTED, operation becomes SCHEDULED
    const createRes = await pilotApi.post('/orders', payload);
    expect(createRes.status()).toBe(201);
    const order = await createRes.json();
    expect(order.status).toBe('SUBMITTED');

    const opAfterCreate = await (
      await supervisorApi.get(`/operations/${confirmedOp.id}`)
    ).json();
    expect(opAfterCreate.status).toBe('SCHEDULED');

    // 2. Submit for approval
    const submitRes = await pilotApi.post(`/orders/${order.id}/status`, {
      action: 'submitForApproval',
    });
    expect(submitRes.status()).toBe(200);
    const submitted = await submitRes.json();
    expect(submitted.status).toBe('SENT_FOR_APPROVAL');

    // 3. Supervisor approves
    const approveRes = await supervisorApi.post(`/orders/${order.id}/status`, {
      action: 'approve',
    });
    expect(approveRes.status()).toBe(200);
    const approved = await approveRes.json();
    expect(approved.status).toBe('APPROVED');
  });

  test('APPROVED → COMPLETED cascades to operations', async ({ request }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    // Create order with actual dates already set (workaround for backend bug:
    // OrderService.update() calls validateOperations() which rejects SCHEDULED
    // operations — so we cannot PUT actual dates on an existing order)
    const { payload, confirmedOp } = await buildOrderPayload(
      adminApi, plannerApi, supervisorApi, pilotApi,
    );
    const createRes = await pilotApi.post('/orders', {
      ...payload,
      actualDeparture: '2027-06-15T08:15:00',
      actualArrival: '2027-06-15T11:45:00',
    });
    expect(createRes.status()).toBe(201);
    const order = await createRes.json();

    await pilotApi.post(`/orders/${order.id}/status`, { action: 'submitForApproval' });
    await supervisorApi.post(`/orders/${order.id}/status`, { action: 'approve' });

    const completeRes = await pilotApi.post(`/orders/${order.id}/status`, {
      action: 'complete',
    });
    expect(completeRes.status()).toBe(200);
    const completed = await completeRes.json();
    expect(completed.status).toBe('COMPLETED');

    // Verify cascading
    const op = await (await supervisorApi.get(`/operations/${confirmedOp.id}`)).json();
    expect(op.status).toBe('COMPLETED');
  });

  test('SUPERVISOR can reject an order', async ({ request }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const { payload } = await buildOrderPayload(
      adminApi, plannerApi, supervisorApi, pilotApi,
    );
    const order = await (await pilotApi.post('/orders', payload)).json();
    await pilotApi.post(`/orders/${order.id}/status`, { action: 'submitForApproval' });

    const rejectRes = await supervisorApi.post(`/orders/${order.id}/status`, {
      action: 'reject',
    });
    expect(rejectRes.status()).toBe(200);
    const rejected = await rejectRes.json();
    expect(rejected.status).toBe('REJECTED');
    expect(rejected.statusLabel).toBe('Odrzucone');
  });

  test('NOT_COMPLETED cascades operations back to CONFIRMED', async ({ request }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const { payload, confirmedOp } = await buildOrderPayload(
      adminApi, plannerApi, supervisorApi, pilotApi,
    );
    const order = await (await pilotApi.post('/orders', payload)).json();
    await pilotApi.post(`/orders/${order.id}/status`, { action: 'submitForApproval' });
    await supervisorApi.post(`/orders/${order.id}/status`, { action: 'approve' });

    const notCompletedRes = await pilotApi.post(`/orders/${order.id}/status`, {
      action: 'notCompleted',
    });
    expect(notCompletedRes.status()).toBe(200);
    const nc = await notCompletedRes.json();
    expect(nc.status).toBe('NOT_COMPLETED');

    // Cascading: operation back to CONFIRMED
    const op = await (await supervisorApi.get(`/operations/${confirmedOp.id}`)).json();
    expect(op.status).toBe('CONFIRMED');
  });

  // BUG: Cannot update existing order to add actual dates because
  // OrderService.update() calls validateOperations() which requires CONFIRMED,
  // but operations are already SCHEDULED. Fix: skip validation for operations
  // that are already in the order.
  test('pilot can update APPROVED order to add actual dates', async ({
    request,
  }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const { payload } = await buildOrderPayload(
      adminApi, plannerApi, supervisorApi, pilotApi,
    );
    const order = await (await pilotApi.post('/orders', payload)).json();
    await pilotApi.post(`/orders/${order.id}/status`, { action: 'submitForApproval' });
    await supervisorApi.post(`/orders/${order.id}/status`, { action: 'approve' });

    const updateRes = await pilotApi.put(`/orders/${order.id}`, {
      ...payload,
      actualDeparture: '2027-06-15T08:15:00',
      actualArrival: '2027-06-15T11:45:00',
    });
    expect(updateRes.status()).toBe(200);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * API — Role-Based Access (PRD 7.2)
 * ──────────────────────────────────────────────────────────────────────── */

test.describe('Orders API — Role-Based Access', () => {
  test('PLANNER cannot access orders (403)', async ({ request }) => {
    const plannerApi = new ApiHelper(request, 'planner');
    const res = await plannerApi.get('/orders');
    expect(res.status()).toBe(403);
  });

  test('ADMIN can read orders (view only)', async ({ request }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const res = await adminApi.get('/orders');
    expect(res.status()).toBe(200);
  });

  test('SUPERVISOR can read orders', async ({ request }) => {
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const res = await supervisorApi.get('/orders');
    expect(res.status()).toBe(200);
  });

  test('ADMIN cannot create orders (PILOT only)', async ({ request }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const res = await adminApi.post('/orders', {
      plannedDeparture: '2027-06-15T08:00:00',
      plannedArrival: '2027-06-15T12:00:00',
      helicopterId: 'fake',
      departureSiteId: 'fake',
      arrivalSiteId: 'fake',
      operationIds: ['fake'],
    });
    // 403 from Spring Security before validation runs
    expect(res.status()).toBe(403);
  });

  test('PLANNER cannot create orders (403)', async ({ request }) => {
    const plannerApi = new ApiHelper(request, 'planner');
    const res = await plannerApi.post('/orders', {
      plannedDeparture: '2027-06-15T08:00:00',
      plannedArrival: '2027-06-15T12:00:00',
      helicopterId: 'fake',
      departureSiteId: 'fake',
      arrivalSiteId: 'fake',
      operationIds: ['fake'],
    });
    expect(res.status()).toBe(403);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * API — 5 Validation Rules (PRD 6.6.c)
 * Verify that error messages mention the SPECIFIC violation.
 * ──────────────────────────────────────────────────────────────────────── */

test.describe('Orders API — Validation Rules', () => {
  test('rejects when helicopter inspection expired — mentions "przegląd"', async ({
    request,
  }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const heli = await createHelicopterViaAPI(adminApi, {
      inspectionExpiryDate: '2025-01-01',
      rangeKm: 800,
      maxCrewWeightKg: 500,
    });
    const pilot = await createCrewMemberViaAPI(adminApi, {
      role: 'PILOT',
      weightKg: 80,
      pilotLicenseNumber: `LIC-${Date.now()}`,
      licenseExpiryDate: '2028-12-31',
      trainingExpiryDate: '2028-12-31',
    });
    const site = await createLandingSiteViaAPI(adminApi);
    const op = await createConfirmedOperation(plannerApi, supervisorApi);

    const me = await (await pilotApi.get('/auth/me')).json();
    await adminApi.put(`/users/${me.id}`, {
      firstName: me.firstName, lastName: me.lastName,
      email: me.email, role: me.role, crewMemberId: pilot.id,
    });

    const res = await pilotApi.post('/orders', {
      plannedDeparture: '2027-06-15T08:00:00',
      plannedArrival: '2027-06-15T12:00:00',
      helicopterId: heli.id,
      crewMemberIds: [],
      departureSiteId: site.id,
      arrivalSiteId: site.id,
      operationIds: [op.id],
    });
    expect(res.status()).toBe(400);
    const err = await res.json();
    // Must mention helicopter inspection specifically
    expect(err.message.toLowerCase()).toContain('przegląd');
  });

  test('rejects when crew weight exceeds limit — mentions "waga"', async ({
    request,
  }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const heli = await createHelicopterViaAPI(adminApi, {
      maxCrewWeightKg: 50,
      rangeKm: 800,
      inspectionExpiryDate: '2028-12-31',
    });
    const pilot = await createCrewMemberViaAPI(adminApi, {
      role: 'PILOT',
      weightKg: 80,
      pilotLicenseNumber: `LIC-${Date.now()}`,
      licenseExpiryDate: '2028-12-31',
      trainingExpiryDate: '2028-12-31',
    });
    const site = await createLandingSiteViaAPI(adminApi);
    const op = await createConfirmedOperation(plannerApi, supervisorApi);

    const me = await (await pilotApi.get('/auth/me')).json();
    await adminApi.put(`/users/${me.id}`, {
      firstName: me.firstName, lastName: me.lastName,
      email: me.email, role: me.role, crewMemberId: pilot.id,
    });

    const res = await pilotApi.post('/orders', {
      plannedDeparture: '2027-06-15T08:00:00',
      plannedArrival: '2027-06-15T12:00:00',
      helicopterId: heli.id,
      crewMemberIds: [],
      departureSiteId: site.id,
      arrivalSiteId: site.id,
      operationIds: [op.id],
    });
    expect(res.status()).toBe(400);
    const err = await res.json();
    // Must mention weight specifically
    expect(err.message.toLowerCase()).toContain('wag');
  });

  test('rejects when pilot license expired — mentions "licencj"', async ({
    request,
  }) => {
    const adminApi = new ApiHelper(request, 'admin');
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const pilotApi = new ApiHelper(request, 'pilot');

    const heli = await createHelicopterViaAPI(adminApi, {
      rangeKm: 800,
      maxCrewWeightKg: 500,
      inspectionExpiryDate: '2028-12-31',
    });
    const pilot = await createCrewMemberViaAPI(adminApi, {
      role: 'PILOT',
      weightKg: 80,
      pilotLicenseNumber: `LIC-${Date.now()}`,
      licenseExpiryDate: '2025-01-01', // expired
      trainingExpiryDate: '2028-12-31',
    });
    const site = await createLandingSiteViaAPI(adminApi);
    const op = await createConfirmedOperation(plannerApi, supervisorApi);

    const me = await (await pilotApi.get('/auth/me')).json();
    await adminApi.put(`/users/${me.id}`, {
      firstName: me.firstName, lastName: me.lastName,
      email: me.email, role: me.role, crewMemberId: pilot.id,
    });

    const res = await pilotApi.post('/orders', {
      plannedDeparture: '2027-06-15T08:00:00',
      plannedArrival: '2027-06-15T12:00:00',
      helicopterId: heli.id,
      crewMemberIds: [],
      departureSiteId: site.id,
      arrivalSiteId: site.id,
      operationIds: [op.id],
    });
    expect(res.status()).toBe(400);
    const err = await res.json();
    expect(err.message.toLowerCase()).toContain('licencj');
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * Operations — cancel from CONFIRMED status
 * ──────────────────────────────────────────────────────────────────────── */

test.describe('Operations — Extra Status Transitions', () => {
  test('PLANNER can cancel a CONFIRMED operation', async ({ request }) => {
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');

    const op = await createOperationViaAPI(plannerApi, {
      plannedDateEarliest: '2027-03-01',
      plannedDateLatest: '2027-03-31',
    });
    // Confirm first
    const confirmRes = await supervisorApi.post(`/operations/${op.id}/status`, {
      action: 'confirm',
    });
    expect(confirmRes.status()).toBe(200);
    expect((await confirmRes.json()).status).toBe('CONFIRMED');

    // Then cancel
    const cancelRes = await plannerApi.post(`/operations/${op.id}/status`, {
      action: 'cancel',
    });
    expect(cancelRes.status()).toBe(200);
    const cancelled = await cancelRes.json();
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.statusLabel).toBe('Rezygnacja');
  });
});
