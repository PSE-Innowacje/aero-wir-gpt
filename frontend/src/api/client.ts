import axios from 'axios';

/**
 * Axios instance shared by all API modules.
 *
 * Base URL is intentionally empty — Vite dev proxy rewrites
 * any `/api/**` request to `http://localhost:8080`.
 * In production the same path works if the SPA is served
 * behind the same origin as the Spring Boot app.
 *
 * `withCredentials: true` ensures the JSESSIONID cookie is
 * sent on every request (required for Spring Security sessions).
 */
const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
