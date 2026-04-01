/**
 * Lightweight event emitter for bridging notifications between
 * non-React code (e.g. Axios interceptors) and the React
 * NotificationContext.
 *
 * Usage from Axios interceptor:
 *   notificationEmitter.emit('error', 'Something went wrong');
 *
 * Usage from NotificationContext:
 *   notificationEmitter.subscribe(callback);
 *   notificationEmitter.unsubscribe(callback);
 */

export type NotificationType = 'success' | 'error' | 'warning';

export interface NotificationEvent {
  type: NotificationType;
  message: string;
}

export type NotificationCallback = (event: NotificationEvent) => void;

const listeners: Set<NotificationCallback> = new Set();

export const notificationEmitter = {
  emit(type: NotificationType, message: string): void {
    const event: NotificationEvent = { type, message };
    listeners.forEach((cb) => cb(event));
  },

  subscribe(callback: NotificationCallback): void {
    listeners.add(callback);
  },

  unsubscribe(callback: NotificationCallback): void {
    listeners.delete(callback);
  },
};
