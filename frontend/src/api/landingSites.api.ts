import client from './client';
import type { LandingSiteRequest, LandingSiteResponse } from './types';

/**
 * GET /api/landing-sites
 * Returns all landing sites sorted by name.
 * Accessible by all authenticated roles.
 */
export async function getLandingSites(): Promise<LandingSiteResponse[]> {
  const response = await client.get<LandingSiteResponse[]>('/landing-sites');
  return response.data;
}

/**
 * GET /api/landing-sites/{id}
 * Returns a single landing site by its database ID.
 */
export async function getLandingSiteById(id: string): Promise<LandingSiteResponse> {
  const response = await client.get<LandingSiteResponse>(`/landing-sites/${id}`);
  return response.data;
}

/**
 * POST /api/landing-sites
 * Creates a new landing site.
 * Returns 201 with the created record on success.
 * Requires ADMIN or PLANNER role.
 */
export async function createLandingSite(data: LandingSiteRequest): Promise<LandingSiteResponse> {
  const response = await client.post<LandingSiteResponse>('/landing-sites', data);
  return response.data;
}

/**
 * PUT /api/landing-sites/{id}
 * Updates an existing landing site.
 * Requires ADMIN or PLANNER role.
 */
export async function updateLandingSite(id: string, data: LandingSiteRequest): Promise<LandingSiteResponse> {
  const response = await client.put<LandingSiteResponse>(`/landing-sites/${id}`, data);
  return response.data;
}
