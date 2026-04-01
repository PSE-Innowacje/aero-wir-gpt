import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import ConfirmDialog from '../components/ConfirmDialog';

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function renderDialog(overrides: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
  const defaultProps: React.ComponentProps<typeof ConfirmDialog> = {
    open: true,
    message: 'Czy na pewno chcesz kontynuowac?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };

  const result = render(
    <ThemeProvider theme={theme}>
      <ConfirmDialog {...defaultProps} />
    </ThemeProvider>,
  );

  return { ...result, props: defaultProps };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('ConfirmDialog', () => {
  /* ── Happy path ─────────────────────────────────────────────────── */

  it('renders title, message, and both buttons when open', () => {
    renderDialog();

    expect(screen.getByText('Potwierdzenie')).toBeInTheDocument();
    expect(screen.getByText('Czy na pewno chcesz kontynuowac?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /potwierdz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anuluj/i })).toBeInTheDocument();
  });

  /* ── Default props ──────────────────────────────────────────────── */

  it('uses default title "Potwierdzenie"', () => {
    renderDialog();
    expect(screen.getByText('Potwierdzenie')).toBeInTheDocument();
  });

  it('uses default confirmLabel "Potwierdz"', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /potwierdz/i })).toBeInTheDocument();
  });

  it('uses default cancelLabel "Anuluj"', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /anuluj/i })).toBeInTheDocument();
  });

  /* ── Custom props ───────────────────────────────────────────────── */

  it('renders custom title, labels, and message', () => {
    renderDialog({
      title: 'Usuwanie elementu',
      message: 'Element zostanie trwale usuniety.',
      confirmLabel: 'Usun',
      cancelLabel: 'Wstecz',
    });

    expect(screen.getByText('Usuwanie elementu')).toBeInTheDocument();
    expect(screen.getByText('Element zostanie trwale usuniety.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /usun/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /wstecz/i })).toBeInTheDocument();
  });

  /* ── onConfirm callback ─────────────────────────────────────────── */

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();

    await user.click(screen.getByRole('button', { name: /potwierdz/i }));

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  /* ── onCancel callback ──────────────────────────────────────────── */

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();

    await user.click(screen.getByRole('button', { name: /anuluj/i }));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  /* ── Closed state ───────────────────────────────────────────────── */

  it('does not render dialog content when open=false', () => {
    renderDialog({ open: false });

    expect(screen.queryByText('Potwierdzenie')).not.toBeInTheDocument();
    expect(screen.queryByText('Czy na pewno chcesz kontynuowac?')).not.toBeInTheDocument();
  });

  /* ── Escape key ─────────────────────────────────────────────────── */

  it('calls onCancel when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();

    await user.keyboard('{Escape}');

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  /* ── Custom confirmColor ────────────────────────────────────────── */

  it('applies the confirmColor to the confirm button', () => {
    renderDialog({ confirmColor: 'error' });

    const confirmBtn = screen.getByRole('button', { name: /potwierdz/i });
    // MUI adds a class like MuiButton-containedError when color="error"
    expect(confirmBtn.className).toMatch(/error/i);
  });

  it('applies warning confirmColor to the confirm button', () => {
    renderDialog({ confirmColor: 'warning' });

    const confirmBtn = screen.getByRole('button', { name: /potwierdz/i });
    expect(confirmBtn.className).toMatch(/warning/i);
  });

  /* ── Confirm button does not call onCancel ──────────────────────── */

  it('does not call onCancel when confirm is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();

    await user.click(screen.getByRole('button', { name: /potwierdz/i }));

    expect(props.onCancel).not.toHaveBeenCalled();
  });

  /* ── Cancel button does not call onConfirm ──────────────────────── */

  it('does not call onConfirm when cancel is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();

    await user.click(screen.getByRole('button', { name: /anuluj/i }));

    expect(props.onConfirm).not.toHaveBeenCalled();
  });
});
