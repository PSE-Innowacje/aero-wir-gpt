import client from './client';
import type { UserRequest, UserResponse } from './types';

/**
 * GET /api/users
 * Returns all users sorted by email.
 * Requires ADMIN role.
 */
export async function getUsers(): Promise<UserResponse[]> {
  const response = await client.get<UserResponse[]>('/users');
  return response.data;
}

/**
 * GET /api/users/{id}
 * Returns a single user by their database ID.
 * Requires ADMIN role.
 */
export async function getUserById(id: string): Promise<UserResponse> {
  const response = await client.get<UserResponse>(`/users/${id}`);
  return response.data;
}

/**
 * POST /api/users
 * Creates a new user. Password is required and stored as a BCrypt hash.
 * Returns 201 with the created user on success.
 * Returns 400 on validation errors.
 * Requires ADMIN role.
 */
export async function createUser(data: UserRequest): Promise<UserResponse> {
  const response = await client.post<UserResponse>('/users', data);
  return response.data;
}

/**
 * PUT /api/users/{id}
 * Updates an existing user.
 * Password is optional — only changed if provided in the request body.
 * Requires ADMIN role.
 */
export async function updateUser(id: string, data: UserRequest): Promise<UserResponse> {
  const response = await client.put<UserResponse>(`/users/${id}`, data);
  return response.data;
}
