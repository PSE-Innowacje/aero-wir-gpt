import { useEffect, useCallback } from 'react';

/**
 * Prevents accidental navigation away from a form with unsaved changes.
 *
 * Uses the `beforeunload` event so the browser shows its native
 * "Leave site?" prompt when the user tries to close the tab or refresh.
 *
 * Note: In-app navigation blocking via react-router's `useBlocker` is
 * not available because the app uses `<BrowserRouter>` instead of a
 * data router (`createBrowserRouter`).
 *
 * @param isDirty - When `true`, navigation is blocked. When `false` (or on
 *   unmount), listeners are cleaned up automatically.
 */
export function useUnsavedChanges(isDirty: boolean): void {
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
}
