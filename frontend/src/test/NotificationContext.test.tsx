import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import {
  NotificationProvider,
  useNotification,
} from '../contexts/NotificationContext';
import { notificationEmitter } from '../utils/notificationEmitter';

/* ------------------------------------------------------------------ */
/*  Test component that exposes the hook methods as buttons            */
/* ------------------------------------------------------------------ */

function TestComponent() {
  const { showSuccess, showError, showWarning } = useNotification();
  return (
    <div>
      <button onClick={() => showSuccess('OK')}>success</button>
      <button onClick={() => showError('Fail')}>error</button>
      <button onClick={() => showWarning('Watch')}>warning</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Render helper                                                      */
/* ------------------------------------------------------------------ */

function renderWithProvider() {
  return render(
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    </ThemeProvider>,
  );
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  /* ── Hook throws outside provider ───────────────────────────────── */

  it('throws an error when useNotification is used outside NotificationProvider', () => {
    // Suppress console.error from the expected React error boundary crash.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Orphan() {
      useNotification();
      return null;
    }

    expect(() => {
      render(
        <ThemeProvider theme={theme}>
          <Orphan />
        </ThemeProvider>,
      );
    }).toThrow('useNotification must be used within NotificationProvider');

    spy.mockRestore();
  });

  /* ── showSuccess ────────────────────────────────────────────────── */

  it('displays a success alert with the message', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();

    await user.click(screen.getByText('success'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('OK');
  });

  /* ── showError ──────────────────────────────────────────────────── */

  it('displays an error alert with the message', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();

    await user.click(screen.getByText('error'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Fail');
  });

  /* ── showWarning ────────────────────────────────────────────────── */

  it('displays a warning alert with the message', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();

    await user.click(screen.getByText('warning'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Watch');
  });

  /* ── Multiple notifications queue ───────────────────────────────── */

  it('queues multiple notifications and shows them one at a time', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();

    // Fire three notifications rapidly.
    await user.click(screen.getByText('success'));
    await user.click(screen.getByText('error'));
    await user.click(screen.getByText('warning'));

    // The first one should be visible.
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('OK');
    });

    // There should only be one alert visible at a time.
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(1);
  });

  /* ── Auto-dismiss ───────────────────────────────────────────────── */

  it('auto-dismisses the snackbar after the timeout', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();

    await user.click(screen.getByText('success'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('OK');
    });

    // The autoHideDuration in NotificationProvider is 5000ms.
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // After the hide duration + transition, the alert should disappear.
    await waitFor(
      () => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  /* ── Emitter integration ────────────────────────────────────────── */

  it('shows an error notification when notificationEmitter emits error', async () => {
    renderWithProvider();

    act(() => {
      notificationEmitter.emit('error', 'Blad polaczenia');
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Blad polaczenia');
  });

  it('shows a success notification when notificationEmitter emits success', async () => {
    renderWithProvider();

    act(() => {
      notificationEmitter.emit('success', 'Zapisano');
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Zapisano');
    });
  });
});
