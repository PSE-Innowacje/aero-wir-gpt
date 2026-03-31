import client from './client';
import type { CrewMemberRequest, CrewMemberResponse } from './types';

/**
 * GET /api/crew-members
 * Returns all crew members sorted by email.
 * Accessible by all authenticated roles.
 */
export async function getCrewMembers(): Promise<CrewMemberResponse[]> {
  const response = await client.get<CrewMemberResponse[]>('/crew-members');
  return response.data;
}

/**
 * GET /api/crew-members/{id}
 * Returns a single crew member by their database ID.
 */
export async function getCrewMemberById(id: string): Promise<CrewMemberResponse> {
  const response = await client.get<CrewMemberResponse>(`/crew-members/${id}`);
  return response.data;
}

/**
 * POST /api/crew-members
 * Creates a new crew member.
 * Pilots additionally require `pilotLicenseNumber` and `licenseExpiryDate`.
 * Returns 201 with the created record on success.
 * Returns 400 on validation errors.
 * Requires ADMIN role.
 */
export async function createCrewMember(data: CrewMemberRequest): Promise<CrewMemberResponse> {
  const response = await client.post<CrewMemberResponse>('/crew-members', data);
  return response.data;
}

/**
 * PUT /api/crew-members/{id}
 * Updates an existing crew member.
 * Requires ADMIN role.
 */
export async function updateCrewMember(id: string, data: CrewMemberRequest): Promise<CrewMemberResponse> {
  const response = await client.put<CrewMemberResponse>(`/crew-members/${id}`, data);
  return response.data;
}
