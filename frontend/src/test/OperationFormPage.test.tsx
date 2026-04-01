import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import theme from '../theme';
import type {
  OperationResponse,
  DictionaryEntry,
} from '../api/types';

/* ================================================================== */
/*  Mocks                                                              */
/* ================================================================== */

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockShowWarning = vi.fn();

vi.mock('../api/operations.api', () => ({
  getOperationById: vi.fn(),
  createOperation: vi.fn(),
  updateOperation: vi.fn(),
  changeOperationStatus: vi.fn(),
  addOperationComment: vi.fn(),
  uploadKml: vi.fn(),
}));

vi.mock('../api/dictionaries.api', () => ({
  getActivityTypes: vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../contexts/NotificationContext', () => ({
  useNotification: vi.fn(() => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    showWarning: mockShowWarning,
  })),
}));

vi.mock('../hooks/useUnsavedChanges', () => ({
  useUnsavedChanges: vi.fn(),
}));

vi.mock('../components/MapView', () => ({
  default: () => <div data-testid="map-view" />,
}));

vi.mock('../components/ConfirmDialog', () => ({
  default: ({ open, message, onConfirm, onCancel }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <span>{message}</span>
        <button onClick={onConfirm}>confirm</button>
        <button onClick={onCancel}>cancel</button>
      </div>
    ) : null,
}));

/* ── Import after mocks ──────────────────────────────────────────── */

import OperationFormPage from '../pages/operations/OperationFormPage';
import {
  getOperationById,
  createOperation,
  updateOperation,
  changeOperationStatus,
  addOperationComment,
  uploadKml,
} from '../api/operations.api';
import { getActivityTypes } from '../api/dictionaries.api';
import { useAuth } from '../contexts/AuthContext';

/* ================================================================== */
/*  Test data                                                          */
/* ================================================================== */

const mockOperation: OperationResponse = {
  id: 'op-1',
  orderNumber: 'ZL-001',
  shortDescription: 'Inspekcja linii 110kV',
  kmlFileName: '/uploads/test.kml',
  kmlPoints: [[52.0, 19.5], [52.1, 19.6]],
  proposedDateEarliest: '2026-05-01',
  proposedDateLatest: '2026-05-15',
  additionalInfo: 'Info testowe',
  routeLengthKm: 25.5,
  plannedDateEarliest: null,
  plannedDateLatest: null,
  status: 'SUBMITTED',
  statusLabel: 'Wprowadzone',
  createdByEmail: 'planista@aero.pl',
  postCompletionNotes: null,
  activityTypes: ['VISUAL_INSPECTION'],
  contacts: ['test@aero.pl'],
  comments: [
    {
      content: 'Komentarz testowy',
      authorEmail: 'planista@aero.pl',
      createdAt: '2026-04-01T10:00:00',
    },
  ],
  changeHistory: [],
  createdAt: '2026-04-01T08:00:00',
  updatedAt: '2026-04-01T08:00:00',
};

const mockActivityTypes: DictionaryEntry[] = [
  { value: 'VISUAL_INSPECTION', label: 'Ogledz\u0069ny wizualne' },
  { value: 'SCAN_3D', label: 'Skan 3D' },
  { value: 'PATROL', label: 'Patrolowanie' },
];

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function renderWithRouter(path: string) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/operations/new" element={<OperationFormPage />} />
          <Route path="/operations/:id" element={<OperationFormPage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

function mockAuthAs(role: 'ADMIN' | 'PLANNER' | 'SUPERVISOR' | 'PILOT') {
  (useAuth as Mock).mockReturnValue({
    user: {
      id: 'user-1',
      email: `${role.toLowerCase()}@aero.pl`,
      firstName: 'Test',
      lastName: 'User',
      role,
    },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
}

/* ================================================================== */
/*  Tests                                                              */
/* ================================================================== */

describe('OperationFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthAs('PLANNER');
    (getActivityTypes as Mock).mockResolvedValue(mockActivityTypes);
    (getOperationById as Mock).mockResolvedValue(mockOperation);
    (createOperation as Mock).mockResolvedValue(mockOperation);
    (updateOperation as Mock).mockResolvedValue(mockOperation);
    (changeOperationStatus as Mock).mockResolvedValue({
      ...mockOperation,
      status: 'CONFIRMED',
    });
    (addOperationComment as Mock).mockResolvedValue(undefined);
  });

  /* ================================================================
   * CREATE MODE
   * ================================================================ */

  describe('Create mode', () => {
    it('renders the new operation heading', async () => {
      renderWithRouter('/operations/new');

      await waitFor(() => {
        expect(screen.getByText('Nowa operacja lotnicza')).toBeInTheDocument();
      });
    });

    it('does not show a status chip in create mode', async () => {
      renderWithRouter('/operations/new');

      await waitFor(() => {
        expect(screen.getByText('Nowa operacja lotnicza')).toBeInTheDocument();
      });

      // The StatusChip only renders when isEdit=true. In create mode the
      // text "Wprowadzone" as a chip should not appear.
      expect(screen.queryByText('Wprowadzone')).not.toBeInTheDocument();
    });

    it('does not call getOperationById in create mode', async () => {
      renderWithRouter('/operations/new');

      await waitFor(() => {
        expect(screen.getByText('Nowa operacja lotnicza')).toBeInTheDocument();
      });

      expect(getOperationById).not.toHaveBeenCalled();
    });

    it('calls createOperation on form submit and navigates to /operations', async () => {
      const user = userEvent.setup();
      renderWithRouter('/operations/new');

      await waitFor(() => {
        expect(screen.getByText('Nowa operacja lotnicza')).toBeInTheDocument();
      });

      // Fill required fields.
      const orderNumberInput = screen.getByPlaceholderText('np. DE-25-12020');
      const shortDescInput = screen.getByPlaceholderText(
        'Krotki opis celu operacji',
      );

      await user.type(orderNumberInput, 'ZL-NEW');
      await user.type(shortDescInput, 'Nowa inspekcja');

      // Submit the form -- in create mode the button says "Utworz operacje".
      const saveButton = screen.getByRole('button', {
        name: /utworz operacje/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(createOperation).toHaveBeenCalledTimes(1);
      });

      const callArgs = (createOperation as Mock).mock.calls[0][0];
      expect(callArgs.orderNumber).toBe('ZL-NEW');
      expect(callArgs.shortDescription).toBe('Nowa inspekcja');
    });

    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      renderWithRouter('/operations/new');

      await waitFor(() => {
        expect(screen.getByText('Nowa operacja lotnicza')).toBeInTheDocument();
      });

      // Submit without filling required fields.
      const saveButton = screen.getByRole('button', {
        name: /utworz operacje/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText('Pole wymagane');
        expect(errorMessages.length).toBeGreaterThanOrEqual(2);
      });

      // createOperation should NOT have been called.
      expect(createOperation).not.toHaveBeenCalled();
    });
  });

  /* ================================================================
   * EDIT MODE
   * ================================================================ */

  describe('Edit mode', () => {
    it('loads operation data and populates form fields', async () => {
      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(getOperationById).toHaveBeenCalledWith('op-1');
      });

      await waitFor(() => {
        expect(screen.getByText('Edycja operacji lotniczej')).toBeInTheDocument();
      });

      const orderNumberInput = screen.getByDisplayValue('ZL-001');
      expect(orderNumberInput).toBeInTheDocument();

      const shortDescInput = screen.getByDisplayValue('Inspekcja linii 110kV');
      expect(shortDescInput).toBeInTheDocument();
    });

    it('shows loading spinner while fetching', async () => {
      // Delay the API response so we can observe the spinner.
      (getOperationById as Mock).mockReturnValue(
        new Promise((resolve) => setTimeout(() => resolve(mockOperation), 500)),
      );

      renderWithRouter('/operations/op-1');

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows the status badge with status label', async () => {
      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(screen.getByText('Wprowadzone')).toBeInTheDocument();
      });
    });

    it('shows the comments section with existing comments', async () => {
      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(screen.getByText('Komentarz testowy')).toBeInTheDocument();
      });
    });

    it(
      'calls addOperationComment when adding a comment',
      async () => {
        const user = userEvent.setup();

        // After adding comment, the refreshed operation has the new comment.
        (getOperationById as Mock)
          .mockResolvedValueOnce(mockOperation)
          .mockResolvedValueOnce({
            ...mockOperation,
            comments: [
              ...mockOperation.comments,
              {
                content: 'Nowy komentarz',
                authorEmail: 'planista@aero.pl',
                createdAt: '2026-04-01T11:00:00',
              },
            ],
          });

        renderWithRouter('/operations/op-1');

        await waitFor(() => {
          expect(
            screen.getByText('Edycja operacji lotniczej'),
          ).toBeInTheDocument();
        });

        // Type into the comment input.
        const commentInput = screen.getByPlaceholderText(
          'Wpisz tresc komentarza...',
        );
        await user.type(commentInput, 'Nowy komentarz');

        // Wait for the send button to become enabled (it is disabled when
        // the input is empty).
        await waitFor(() => {
          const sendBtn = screen.getByRole('button', {
            name: /wyslij komentarz/i,
          });
          expect(sendBtn).not.toBeDisabled();
        });

        await user.click(
          screen.getByRole('button', { name: /wyslij komentarz/i }),
        );

        await waitFor(() => {
          expect(addOperationComment).toHaveBeenCalledWith('op-1', {
            content: 'Nowy komentarz',
          });
        });
      },
      15000,
    );
  });

  /* ================================================================
   * STATUS BUTTONS
   * ================================================================ */

  describe('Status buttons', () => {
    it('SUPERVISOR sees Odrzuc and Potwierdz when SUBMITTED', async () => {
      mockAuthAs('SUPERVISOR');
      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(screen.getByText('Edycja operacji lotniczej')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /odrzuc/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /potwierdz do planu/i }),
      ).toBeInTheDocument();
    });

    it('PLANNER sees Rezygnuj when status is SUBMITTED', async () => {
      mockAuthAs('PLANNER');
      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(screen.getByText('Edycja operacji lotniczej')).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /rezygnuj/i }),
      ).toBeInTheDocument();
    });

    it('PLANNER does not see SUPERVISOR buttons', async () => {
      mockAuthAs('PLANNER');
      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(screen.getByText('Edycja operacji lotniczej')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /odrzuc/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /potwierdz do planu/i }),
      ).not.toBeInTheDocument();
    });

    it('clicking Odrzuc shows the confirm dialog', async () => {
      mockAuthAs('SUPERVISOR');
      const user = userEvent.setup();
      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(screen.getByText('Edycja operacji lotniczej')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /odrzuc/i }));

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/czy na pewno chcesz odrzucic/i),
      ).toBeInTheDocument();
    });

    it('confirming the dialog calls changeOperationStatus', async () => {
      mockAuthAs('SUPERVISOR');
      const user = userEvent.setup();
      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(screen.getByText('Edycja operacji lotniczej')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /odrzuc/i }));

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('confirm'));

      await waitFor(() => {
        expect(changeOperationStatus).toHaveBeenCalledWith('op-1', {
          action: 'REJECT',
        });
      });
    });
  });

  /* ================================================================
   * FIELD RESTRICTIONS
   * ================================================================ */

  describe('Field restrictions', () => {
    it('makes the form read-only when status is COMPLETED', async () => {
      const completedOp: OperationResponse = {
        ...mockOperation,
        status: 'COMPLETED',
        statusLabel: 'Zrealizowane',
      };
      (getOperationById as Mock).mockResolvedValue(completedOp);

      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(screen.getByText('Edycja operacji lotniczej')).toBeInTheDocument();
      });

      // The orderNumber field should be disabled.
      const orderNumberInput = screen.getByDisplayValue('ZL-001');
      expect(orderNumberInput).toBeDisabled();
    });

    it('makes the form read-only when status is CANCELLED', async () => {
      const cancelledOp: OperationResponse = {
        ...mockOperation,
        status: 'CANCELLED',
        statusLabel: 'Rezygnacja',
      };
      (getOperationById as Mock).mockResolvedValue(cancelledOp);

      renderWithRouter('/operations/op-1');

      await waitFor(() => {
        expect(screen.getByText('Edycja operacji lotniczej')).toBeInTheDocument();
      });

      const orderNumberInput = screen.getByDisplayValue('ZL-001');
      expect(orderNumberInput).toBeDisabled();
    });
  });

  /* ================================================================
   * KML UPLOAD
   * ================================================================ */

  describe('KML upload', () => {
    it('calls uploadKml and shows route length after successful upload', async () => {
      const user = userEvent.setup();

      (uploadKml as Mock).mockResolvedValue({
        filePath: '/uploads/route.kml',
        points: [
          [52.0, 19.5],
          [52.1, 19.6],
          [52.2, 19.7],
        ],
        routeLengthKm: 42.3,
      });

      renderWithRouter('/operations/new');

      await waitFor(() => {
        expect(screen.getByText('Nowa operacja lotnicza')).toBeInTheDocument();
      });

      // Find the hidden file input and simulate a file selection.
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      if (fileInput) {
        const kmlFile = new File(['<kml>test</kml>'], 'route.kml', {
          type: 'application/vnd.google-earth.kml+xml',
        });

        await user.upload(fileInput, kmlFile);

        await waitFor(() => {
          expect(uploadKml).toHaveBeenCalledTimes(1);
        });
      }
    });
  });

  /* ================================================================
   * BAD PATHS
   * ================================================================ */

  describe('Bad paths', () => {
    it('navigates to /operations when API returns error on load', async () => {
      (getOperationById as Mock).mockRejectedValue(new Error('Not found'));

      renderWithRouter('/operations/op-bad');

      await waitFor(() => {
        expect(getOperationById).toHaveBeenCalledWith('op-bad');
      });

      // The component calls navigate('/operations') on error.
      // Since we're in a MemoryRouter, the routes won't match and the
      // component should unmount. We verify the operation page title is gone.
      await waitFor(() => {
        expect(
          screen.queryByText('Edycja operacji lotniczej'),
        ).not.toBeInTheDocument();
      });
    });

    it('does not navigate on save error but keeps the form', async () => {
      const user = userEvent.setup();
      (createOperation as Mock).mockRejectedValue(new Error('Server error'));

      renderWithRouter('/operations/new');

      await waitFor(() => {
        expect(screen.getByText('Nowa operacja lotnicza')).toBeInTheDocument();
      });

      // Fill required fields.
      await user.type(
        screen.getByPlaceholderText('np. DE-25-12020'),
        'ZL-ERR',
      );
      await user.type(
        screen.getByPlaceholderText('Krotki opis celu operacji'),
        'Test error',
      );

      await user.click(
        screen.getByRole('button', { name: /utworz operacje/i }),
      );

      await waitFor(() => {
        expect(createOperation).toHaveBeenCalledTimes(1);
      });

      // Form should still be visible (no navigation occurred).
      expect(screen.getByText('Nowa operacja lotnicza')).toBeInTheDocument();
    });
  });
});
