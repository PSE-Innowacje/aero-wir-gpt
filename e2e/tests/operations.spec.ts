import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import { ApiHelper, createOperationViaAPI } from '../helpers/api';
import { API_BASE, USERS } from '../helpers/constants';

test.describe('Operations Page (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, 'admin');
    await page.goto('/operations');
  });

  test('should display operations list page', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/\/operations/);
  });
});

test.describe('Operations API — CRUD', () => {
  let plannerApi: ApiHelper;
  let supervisorApi: ApiHelper;

  test.beforeEach(async ({ request }) => {
    plannerApi = new ApiHelper(request, 'planner');
    supervisorApi = new ApiHelper(request, 'supervisor');
  });

  test('PLANNER can create an operation', async () => {
    const operation = await createOperationViaAPI(plannerApi);
    expect(operation.id).toBeTruthy();
    expect(operation.status).toBe('SUBMITTED');
    expect(operation.shortDescription).toBe('E2E test operation');
    expect(operation.activityTypes).toContain('VISUAL_INSPECTION');
  });

  test('SUPERVISOR can create an operation', async () => {
    const operation = await createOperationViaAPI(supervisorApi);
    expect(operation.id).toBeTruthy();
    expect(operation.status).toBe('SUBMITTED');
  });

  test('created operation has SUBMITTED status by default', async () => {
    const operation = await createOperationViaAPI(plannerApi);
    expect(operation.status).toBe('SUBMITTED');
    expect(operation.statusLabel).toBe('Wprowadzone');
  });

  test('should get operation by id with full details', async () => {
    const created = await createOperationViaAPI(plannerApi);
    const res = await plannerApi.get(`/operations/${created.id}`);
    expect(res.status()).toBe(200);

    const operation = await res.json();
    expect(operation.id).toBe(created.id);
    expect(operation.orderNumber).toBe(created.orderNumber);
    expect(operation.comments).toBeDefined();
    expect(operation.changeHistory).toBeDefined();
    expect(operation.createdAt).toBeTruthy();
  });

  test('should list operations', async () => {
    await createOperationViaAPI(plannerApi);

    const res = await plannerApi.get('/operations');
    expect(res.status()).toBe(200);
    const operations = await res.json();
    expect(Array.isArray(operations)).toBeTruthy();
  });

  test('PLANNER can update own operation fields', async () => {
    const created = await createOperationViaAPI(plannerApi);
    const res = await plannerApi.put(`/operations/${created.id}`, {
      orderNumber: created.orderNumber,
      shortDescription: 'Updated description',
      activityTypes: ['VISUAL_INSPECTION', 'PHOTOS'],
      proposedDateEarliest: '2027-02-01',
      proposedDateLatest: '2027-02-28',
    });
    expect(res.status()).toBe(200);

    const updated = await res.json();
    expect(updated.shortDescription).toBe('Updated description');
    expect(updated.activityTypes).toContain('PHOTOS');
  });
});

test.describe('Operations API — Status Transitions', () => {
  test('SUPERVISOR can confirm a SUBMITTED operation with planned dates', async ({
    request,
  }) => {
    const plannerApi = new ApiHelper(request, 'planner');
    const supervisorApi = new ApiHelper(request, 'supervisor');

    // Create as planner with planned dates
    const operation = await createOperationViaAPI(plannerApi, {
      plannedDateEarliest: '2027-03-01',
      plannedDateLatest: '2027-03-15',
    });

    // Supervisor confirms — needs their own session
    const confirmRes = await supervisorApi.post(
      `/operations/${operation.id}/status`,
      { action: 'confirm' },
    );
    expect(confirmRes.status()).toBe(200);
    const confirmed = await confirmRes.json();
    expect(confirmed.status).toBe('CONFIRMED');
  });

  test('SUPERVISOR can reject a SUBMITTED operation', async ({ request }) => {
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const operation = await createOperationViaAPI(supervisorApi);

    const rejectRes = await supervisorApi.post(
      `/operations/${operation.id}/status`,
      { action: 'reject' },
    );
    expect(rejectRes.status()).toBe(200);
    const rejected = await rejectRes.json();
    expect(rejected.status).toBe('REJECTED');
  });

  test('PLANNER can cancel a SUBMITTED operation', async ({ request }) => {
    const plannerApi = new ApiHelper(request, 'planner');
    const operation = await createOperationViaAPI(plannerApi);

    const cancelRes = await plannerApi.post(
      `/operations/${operation.id}/status`,
      { action: 'cancel' },
    );
    expect(cancelRes.status()).toBe(200);
    const cancelled = await cancelRes.json();
    expect(cancelled.status).toBe('CANCELLED');
  });

  test('PLANNER cannot confirm an operation (SUPERVISOR only)', async ({
    request,
  }) => {
    const plannerApi = new ApiHelper(request, 'planner');
    const operation = await createOperationViaAPI(plannerApi, {
      plannedDateEarliest: '2027-03-01',
      plannedDateLatest: '2027-03-15',
    });

    const confirmRes = await plannerApi.post(
      `/operations/${operation.id}/status`,
      { action: 'confirm' },
    );
    // Should be forbidden or bad request
    expect(confirmRes.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Operations API — Comments', () => {
  test('PLANNER can add a comment to an operation', async ({ request }) => {
    const plannerApi = new ApiHelper(request, 'planner');
    const operation = await createOperationViaAPI(plannerApi);

    const commentRes = await plannerApi.post(
      `/operations/${operation.id}/comments`,
      { content: 'E2E test comment' },
    );
    expect(commentRes.status()).toBe(200);

    // Verify comment is present
    const opRes = await plannerApi.get(`/operations/${operation.id}`);
    const op = await opRes.json();
    expect(op.comments.length).toBeGreaterThan(0);
    expect(op.comments[0].content).toBe('E2E test comment');
  });

  test('SUPERVISOR can add a comment to an operation', async ({ request }) => {
    const supervisorApi = new ApiHelper(request, 'supervisor');
    const operation = await createOperationViaAPI(supervisorApi);

    const commentRes = await supervisorApi.post(
      `/operations/${operation.id}/comments`,
      { content: 'Supervisor comment' },
    );
    expect(commentRes.status()).toBe(200);
  });
});

test.describe('Operations API — Change History', () => {
  test('updating operation records change history', async ({ request }) => {
    const plannerApi = new ApiHelper(request, 'planner');
    const operation = await createOperationViaAPI(plannerApi);

    // Update the operation
    await plannerApi.put(`/operations/${operation.id}`, {
      orderNumber: operation.orderNumber,
      shortDescription: 'Changed description',
      activityTypes: ['VISUAL_INSPECTION'],
      proposedDateEarliest: '2027-01-15',
      proposedDateLatest: '2027-01-30',
    });

    // Fetch and check history
    const res = await plannerApi.get(`/operations/${operation.id}`);
    const op = await res.json();
    expect(op.changeHistory.length).toBeGreaterThan(0);

    const descChange = op.changeHistory.find(
      (h: { fieldName: string }) => h.fieldName === 'shortDescription',
    );
    expect(descChange).toBeTruthy();
    expect(descChange.newValue).toBe('Changed description');
  });
});

test.describe('Operations API — Role-Based Access', () => {
  test('PILOT can read operations', async ({ request }) => {
    const api = new ApiHelper(request, 'pilot');
    const res = await api.get('/operations');
    expect(res.status()).toBe(200);
  });

  test('ADMIN can read operations', async ({ request }) => {
    const api = new ApiHelper(request, 'admin');
    const res = await api.get('/operations');
    expect(res.status()).toBe(200);
  });

  test('PILOT cannot create operations', async ({ request }) => {
    const api = new ApiHelper(request, 'pilot');
    const res = await api.post('/operations', {
      orderNumber: 'OP-PILOT',
      shortDescription: 'Pilot should not create',
      activityTypes: ['VISUAL_INSPECTION'],
    });
    expect(res.status()).toBe(403);
  });
});
