import client from './client';
import type { DictionaryEntry } from './types';

/**
 * GET /api/dictionaries/activity-types
 * Returns all flight operation activity types as `{value, label}` pairs.
 * Used to populate dropdowns in the flight operations form.
 */
export async function getActivityTypes(): Promise<DictionaryEntry[]> {
  const response = await client.get<DictionaryEntry[]>('/dictionaries/activity-types');
  return response.data;
}

/**
 * GET /api/dictionaries/crew-roles
 * Returns crew roles: PILOT and OBSERVER.
 */
export async function getCrewRoles(): Promise<DictionaryEntry[]> {
  const response = await client.get<DictionaryEntry[]>('/dictionaries/crew-roles');
  return response.data;
}

/**
 * GET /api/dictionaries/operation-statuses
 * Returns all 7 flight operation statuses with Polish labels.
 * Used for filter dropdowns on the operations list page.
 */
export async function getOperationStatuses(): Promise<DictionaryEntry[]> {
  const response = await client.get<DictionaryEntry[]>('/dictionaries/operation-statuses');
  return response.data;
}

/**
 * GET /api/dictionaries/order-statuses
 * Returns all 7 flight order statuses with Polish labels.
 * Used for filter dropdowns on the orders list page.
 */
export async function getOrderStatuses(): Promise<DictionaryEntry[]> {
  const response = await client.get<DictionaryEntry[]>('/dictionaries/order-statuses');
  return response.data;
}
