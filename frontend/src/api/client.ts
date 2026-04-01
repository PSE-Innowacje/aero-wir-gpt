import axios, { type AxiosError } from 'axios';
import { notificationEmitter } from '../utils/notificationEmitter';

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

/* ------------------------------------------------------------------ */
/*  Response interceptor — global error notifications                  */
/* ------------------------------------------------------------------ */

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    if (!status) {
      notificationEmitter.emit(
        'error',
        'Brak połączenia z serwerem. Sprawdź połączenie sieciowe.',
      );
      return Promise.reject(error);
    }

    let message: string;

    switch (status) {
      case 400:
        message =
          error.response?.data?.message || 'Nieprawidłowe dane';
        break;
      case 401:
        message = 'Sesja wygasła. Zaloguj się ponownie.';
        break;
      case 403:
        message = 'Brak uprawnień do wykonania tej operacji';
        break;
      case 404:
        message = 'Nie znaleziono zasobu';
        break;
      default:
        if (status >= 500) {
          message = 'Błąd serwera. Spróbuj ponownie później.';
        } else {
          message =
            error.response?.data?.message || 'Wystąpił nieoczekiwany błąd';
        }
        break;
    }

    notificationEmitter.emit('error', message);
    return Promise.reject(error);
  },
);

export default client;
