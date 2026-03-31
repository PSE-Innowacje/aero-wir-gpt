import client from './client';
import type { HelicopterRequest, HelicopterResponse } from './types';

/**
 * GET /api/helicopters
 * Returns all helicopters sorted by status then registration number.
 * Accessible by all authenticated roles.
 */
export async function getHelicopters(): Promise<HelicopterResponse[]> {
  const response = await client.get<HelicopterResponse[]>('/helicopters');
  return response.data;
}

/**
 * GET /api/helicopters/{id}
 * Returns a single helicopter by its database ID.
 */
export async function getHelicopterById(id: string): Promise<HelicopterResponse> {
  const response = await client.get<HelicopterResponse>(`/helicopters/${id}`);
  return response.data;
}

/**
 * POST /api/helicopters
 * Creates a new helicopter.
 * Active helicopters require `inspectionExpiryDate`.
 * Returns 201 with the created record on success.
 * Returns 400 on validation errors.
 * Requires ADMIN role.
 */
export async function createHelicopter(data: HelicopterRequest): Promise<HelicopterResponse> {
  const response = await client.post<HelicopterResponse>('/helicopters', data);
  return response.data;
}

/**
 * PUT /api/helicopters/{id}
 * Updates an existing helicopter.
 * Requires ADMIN role.
 */
export async function updateHelicopter(id: string, data: HelicopterRequest): Promise<HelicopterResponse> {
  const response = await client.put<HelicopterResponse>(`/helicopters/${id}`, data);
  return response.data;
}
