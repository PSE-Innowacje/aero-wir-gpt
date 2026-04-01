import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  notificationEmitter,
  type NotificationCallback,
  type NotificationEvent,
} from '../utils/notificationEmitter';

describe('notificationEmitter', () => {
  let callback: NotificationCallback;

  beforeEach(() => {
    callback = vi.fn();
    // Clean slate: unsubscribe in case a previous test leaked.
    notificationEmitter.unsubscribe(callback);
  });

  /* ------------------------------------------------------------------
   * Happy path
   * ------------------------------------------------------------------ */

  it('delivers the correct event to a subscriber', () => {
    notificationEmitter.subscribe(callback);
    notificationEmitter.emit('success', 'Operacja zapisana');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      type: 'success',
      message: 'Operacja zapisana',
    });

    notificationEmitter.unsubscribe(callback);
  });

  /* ------------------------------------------------------------------
   * Multiple subscribers
   * ------------------------------------------------------------------ */

  it('delivers events to every subscriber', () => {
    const cb1: NotificationCallback = vi.fn();
    const cb2: NotificationCallback = vi.fn();
    const cb3: NotificationCallback = vi.fn();

    notificationEmitter.subscribe(cb1);
    notificationEmitter.subscribe(cb2);
    notificationEmitter.subscribe(cb3);

    notificationEmitter.emit('error', 'Blad serwera');

    const expected: NotificationEvent = {
      type: 'error',
      message: 'Blad serwera',
    };

    expect(cb1).toHaveBeenCalledWith(expected);
    expect(cb2).toHaveBeenCalledWith(expected);
    expect(cb3).toHaveBeenCalledWith(expected);

    notificationEmitter.unsubscribe(cb1);
    notificationEmitter.unsubscribe(cb2);
    notificationEmitter.unsubscribe(cb3);
  });

  /* ------------------------------------------------------------------
   * Unsubscribe
   * ------------------------------------------------------------------ */

  it('stops delivering events after unsubscribe', () => {
    notificationEmitter.subscribe(callback);

    // First emit - should be received.
    notificationEmitter.emit('success', 'msg1');
    expect(callback).toHaveBeenCalledTimes(1);

    // Unsubscribe, then emit again - should not be received.
    notificationEmitter.unsubscribe(callback);
    notificationEmitter.emit('success', 'msg2');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  /* ------------------------------------------------------------------
   * Emit with no subscribers
   * ------------------------------------------------------------------ */

  it('does not throw when emitting with no subscribers', () => {
    expect(() => {
      notificationEmitter.emit('warning', 'nobody is listening');
    }).not.toThrow();
  });

  /* ------------------------------------------------------------------
   * Duplicate subscribe is idempotent (Set semantics)
   * ------------------------------------------------------------------ */

  it('does not call the same callback twice when subscribed multiple times', () => {
    notificationEmitter.subscribe(callback);
    notificationEmitter.subscribe(callback);
    notificationEmitter.subscribe(callback);

    notificationEmitter.emit('success', 'once only');

    expect(callback).toHaveBeenCalledTimes(1);

    notificationEmitter.unsubscribe(callback);
  });

  /* ------------------------------------------------------------------
   * Different event types are passed correctly
   * ------------------------------------------------------------------ */

  describe('event types', () => {
    beforeEach(() => {
      notificationEmitter.subscribe(callback);
    });

    afterEach(() => {
      notificationEmitter.unsubscribe(callback);
    });

    it('passes success type correctly', () => {
      notificationEmitter.emit('success', 'OK');
      expect(callback).toHaveBeenCalledWith({ type: 'success', message: 'OK' });
    });

    it('passes error type correctly', () => {
      notificationEmitter.emit('error', 'Fail');
      expect(callback).toHaveBeenCalledWith({ type: 'error', message: 'Fail' });
    });

    it('passes warning type correctly', () => {
      notificationEmitter.emit('warning', 'Watch');
      expect(callback).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Watch',
      });
    });
  });

  /* ------------------------------------------------------------------
   * Unsubscribing a callback that was never subscribed is a no-op
   * ------------------------------------------------------------------ */

  it('does not throw when unsubscribing a non-subscriber', () => {
    const unknownCb: NotificationCallback = vi.fn();
    expect(() => {
      notificationEmitter.unsubscribe(unknownCb);
    }).not.toThrow();
  });
});
