import { useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

const UNSAVED_MESSAGE = 'Masz niezapisane zmiany. Czy chcesz opuscic strone?';

/**
 * Prevents accidental navigation away from a form with unsaved changes.
 *
 * - In-app navigation (react-router): uses `useBlocker` to intercept route
 *   changes and shows a browser `confirm()` dialog.
 * - Tab close / refresh: uses the `beforeunload` event so the browser shows
 *   its native "Leave site?" prompt.
 *
 * @param isDirty - When `true`, navigation is blocked. When `false` (or on
 *   unmount), all listeners are cleaned up automatically.
 */
export function useUnsavedChanges(isDirty: boolean): void {
  // ── Browser tab close / refresh ────────────────────────────────────
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    },
    [isDirty],
  );

  useEffect(() => {
    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, handleBeforeUnload]);

  // ── In-app navigation (react-router) ──────────────────────────────
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const leave = window.confirm(UNSAVED_MESSAGE);
      if (leave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
}
