import client from './client';
import type { LoginRequest, UserResponse } from './types';

/**
 * POST /api/auth/login
 * Authenticates the user and creates a server-side session (JSESSIONID cookie).
 * Returns the authenticated user on success, throws on invalid credentials (401).
 */
export async function login(data: LoginRequest): Promise<UserResponse> {
  const response = await client.post<UserResponse>('/auth/login', data);
  return response.data;
}

/**
 * POST /api/auth/logout
 * Invalidates the current server session.
 */
export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 * Throws a 401 AxiosError if the session is not valid.
 */
export async function getMe(): Promise<UserResponse> {
  const response = await client.get<UserResponse>('/auth/me');
  return response.data;
}

/**
 * GET /api/auth/users
 * Returns a flat list of all registered users (no pagination).
 */
export async function getAuthUsers(): Promise<UserResponse[]> {
  const response = await client.get<UserResponse[]>('/auth/users');
  return response.data;
}
