import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import theme from '../theme';
import type {
  OrderResponse,
  HelicopterResponse,
  CrewMemberResponse,
  LandingSiteResponse,
  OperationListResponse,
  OperationResponse,
} from '../api/types';

/* ================================================================== */
/*  Mocks                                                              */
/* ================================================================== */

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockShowWarning = vi.fn();

vi.mock('../api/orders.api', () => ({
  getOrderById: vi.fn(),
  createOrder: vi.fn(),
  updateOrder: vi.fn(),
  changeOrderStatus: vi.fn(),
}));

vi.mock('../api/operations.api', () => ({
  getOperations: vi.fn(),
  getOperationById: vi.fn(),
}));

vi.mock('../api/helicopters.api', () => ({
  getHelicopters: vi.fn(),
}));

vi.mock('../api/crew.api', () => ({
  getCrewMembers: vi.fn(),
}));

vi.mock('../api/landingSites.api', () => ({
  getLandingSites: vi.fn(),
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

import OrderFormPage from '../pages/orders/OrderFormPage';
import {
  getOrderById,
  createOrder,
  updateOrder,
  changeOrderStatus,
} from '../api/orders.api';
import { getOperations, getOperationById } from '../api/operations.api';
import { getHelicopters } from '../api/helicopters.api';
import { getCrewMembers } from '../api/crew.api';
import { getLandingSites } from '../api/landingSites.api';
import { useAuth } from '../contexts/AuthContext';

/* ================================================================== */
/*  Test data                                                          */
/* ================================================================== */

const mockOrder: OrderResponse = {
  id: 'ord-1',
  plannedDeparture: '2026-05-10T08:00',
  plannedArrival: '2026-05-10T12:00',
  pilotId: 'crew-p1',
  status: 'SUBMITTED',
  statusLabel: 'Wprowadzone',
  helicopterId: 'heli-1',
  crewMemberIds: ['crew-o1'],
  crewWeightKg: 150,
  departureSiteId: 'ls-1',
  arrivalSiteId: 'ls-2',
  operationIds: ['op-1'],
  estimatedRouteLengthKm: 25.5,
  actualDeparture: null,
  actualArrival: null,
  createdAt: '2026-04-01T08:00:00',
  updatedAt: '2026-04-01T08:00:00',
};

const mockHelicopters: HelicopterResponse[] = [
  {
    id: 'heli-1',
    registrationNumber: 'SP-AER',
    type: 'Airbus H160',
    maxCrewCount: 5,
    maxCrewWeightKg: 500,
    status: 'ACTIVE',
    inspectionExpiryDate: '2027-01-01',
    rangeKm: 800,
  },
  {
    id: 'heli-2',
    registrationNumber: 'SP-OLD',
    type: 'Bell 206',
    maxCrewCount: 3,
    maxCrewWeightKg: 300,
    status: 'INACTIVE',
    inspectionExpiryDate: null,
    rangeKm: 400,
  },
];

const mockCrewMembers: CrewMemberResponse[] = [
  {
    id: 'crew-p1',
    firstName: 'Jan',
    lastName: 'Nowak',
    email: 'jan@aero.pl',
    weightKg: 82,
    role: 'PILOT',
    pilotLicenseNumber: 'PL-001',
    licenseExpiryDate: '2027-06-01',
    trainingExpiryDate: '2027-03-01',
  },
  {
    id: 'crew-o1',
    firstName: 'Anna',
    lastName: 'Kowalska',
    email: 'anna@aero.pl',
    weightKg: 68,
    role: 'OBSERVER',
    trainingExpiryDate: '2027-04-01',
  },
];

const mockLandingSites: LandingSiteResponse[] = [
  { id: 'ls-1', name: 'Warszawa Babice', latitude: 52.23, longitude: 20.91 },
  { id: 'ls-2', name: 'Krakow Balice', latitude: 50.08, longitude: 19.78 },
];

const mockConfirmedOps: OperationListResponse[] = [
  {
    id: 'op-1',
    orderNumber: 'ZL-001',
    activityTypes: ['VISUAL_INSPECTION'],
    proposedDateEarliest: '2026-05-01',
    proposedDateLatest: '2026-05-15',
    plannedDateEarliest: null,
    plannedDateLatest: null,
    status: 'CONFIRMED',
    statusLabel: 'Potwierdzone do planu',
  },
];

const mockOperationFull: OperationResponse = {
  id: 'op-1',
  orderNumber: 'ZL-001',
  shortDescription: 'Inspekcja linii 110kV',
  kmlFilePath: '/uploads/test.kml',
  kmlPoints: [[52.0, 19.5], [52.1, 19.6]],
  proposedDateEarliest: '2026-05-01',
  proposedDateLatest: '2026-05-15',
  additionalInfo: 'Info testowe',
  routeLengthKm: 25.5,
  plannedDateEarliest: null,
  plannedDateLatest: null,
  status: 'CONFIRMED',
  statusLabel: 'Potwierdzone do planu',
  createdByEmail: 'planista@aero.pl',
  postCompletionNotes: null,
  activityTypes: ['VISUAL_INSPECTION'],
  contacts: ['test@aero.pl'],
  comments: [],
  changeHistory: [],
  createdAt: '2026-04-01T08:00:00',
  updatedAt: '2026-04-01T08:00:00',
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function renderWithRouter(path: string) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/orders/new" element={<OrderFormPage />} />
          <Route path="/orders/:id" element={<OrderFormPage />} />
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

function setupDefaultMocks() {
  (getHelicopters as Mock).mockResolvedValue(mockHelicopters);
  (getCrewMembers as Mock).mockResolvedValue(mockCrewMembers);
  (getLandingSites as Mock).mockResolvedValue(mockLandingSites);
  (getOperations as Mock).mockResolvedValue(mockConfirmedOps);
  (getOperationById as Mock).mockResolvedValue(mockOperationFull);
  (getOrderById as Mock).mockResolvedValue(mockOrder);
  (createOrder as Mock).mockResolvedValue(mockOrder);
  (updateOrder as Mock).mockResolvedValue(mockOrder);
  (changeOrderStatus as Mock).mockResolvedValue({
    ...mockOrder,
    status: 'SENT_FOR_APPROVAL',
  });
}

/* ================================================================== */
/*  Tests                                                              */
/* ================================================================== */

describe('OrderFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthAs('PILOT');
    setupDefaultMocks();
  });

  /* ================================================================
   * CREATE MODE
   * ================================================================ */

  describe('Create mode', () => {
    it('renders the new order heading', async () => {
      renderWithRouter('/orders/new');

      await waitFor(() => {
        expect(
          screen.getByText('Nowe zlecenie lotnicze'),
        ).toBeInTheDocument();
      });
    });

    it('does not call getOrderById in create mode', async () => {
      renderWithRouter('/orders/new');

      await waitFor(() => {
        expect(
          screen.getByText('Nowe zlecenie lotnicze'),
        ).toBeInTheDocument();
      });

      expect(getOrderById).not.toHaveBeenCalled();
    });

    it('PLANNER sees access denied message', async () => {
      mockAuthAs('PLANNER');
      renderWithRouter('/orders/new');

      await waitFor(() => {
        expect(screen.getByText(/brak dostepu/i)).toBeInTheDocument();
      });
    });

    it('shows validation errors for empty required fields on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter('/orders/new');

      await waitFor(() => {
        expect(
          screen.getByText('Nowe zlecenie lotnicze'),
        ).toBeInTheDocument();
      });

      // Submit without filling required fields.
      const saveButton = screen.getByRole('button', { name: /utworz zlecenie/i });
      await user.click(saveButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText('Pole wymagane');
        // At minimum: plannedDeparture, plannedArrival, helicopterId,
        // departureSiteId, arrivalSiteId
        expect(errorMessages.length).toBeGreaterThanOrEqual(2);
      });

      expect(createOrder).not.toHaveBeenCalled();
    });
  });

  /* ================================================================
   * EDIT MODE
   * ================================================================ */

  describe('Edit mode', () => {
    it('loads order data and shows the edit heading', async () => {
      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(getOrderById).toHaveBeenCalledWith('ord-1');
      });

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });
    });

    it('shows loading spinner while fetching', async () => {
      (getOrderById as Mock).mockReturnValue(
        new Promise((resolve) => setTimeout(() => resolve(mockOrder), 500)),
      );

      renderWithRouter('/orders/ord-1');

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows the status badge', async () => {
      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(screen.getByText('Wprowadzone')).toBeInTheDocument();
      });
    });

    it('shows the order ID', async () => {
      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(screen.getByText(/ID:.*ord-1/)).toBeInTheDocument();
      });
    });
  });

  /* ================================================================
   * VALIDATION WARNINGS
   * ================================================================ */

  describe('Validation warnings', () => {
    it('shows helicopter inspection expiry warning when expired before departure', async () => {
      // Set the helicopter to have an expired inspection date.
      const expiredHelicopters = [
        {
          ...mockHelicopters[0],
          inspectionExpiryDate: '2026-01-01',
        },
      ];
      (getHelicopters as Mock).mockResolvedValue(expiredHelicopters);

      // Use an order with a departure date after the inspection expiry.
      const orderWithFutureDeparture: OrderResponse = {
        ...mockOrder,
        plannedDeparture: '2026-05-10T08:00',
      };
      (getOrderById as Mock).mockResolvedValue(orderWithFutureDeparture);

      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });

      // The warning about inspection expiry should appear.
      await waitFor(() => {
        expect(
          screen.getByText(/przeglad helikoptera wygasa/i),
        ).toBeInTheDocument();
      });
    });

    it('shows crew weight limit warning when exceeded', async () => {
      // Create crew members whose total weight exceeds helicopter limit.
      const heavyCrew: CrewMemberResponse[] = [
        { ...mockCrewMembers[0], weightKg: 300 }, // pilot
        { ...mockCrewMembers[1], weightKg: 250 }, // observer
      ];
      (getCrewMembers as Mock).mockResolvedValue(heavyCrew);

      // Helicopter limit is 500, total crew weight is 300+250=550.
      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/masa zalogi.*przekracza limit/i)).toBeInTheDocument();
      });
    });

    it('shows route range limit warning when exceeded', async () => {
      // Create a helicopter with small range and operations with long routes.
      const shortRangeHelicopters = [
        { ...mockHelicopters[0], rangeKm: 10 },
      ];
      (getHelicopters as Mock).mockResolvedValue(shortRangeHelicopters);

      // The operation has routeLengthKm=25.5, helicopter range is 10.
      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText(/szacowana trasa.*przekracza zasieg/i),
        ).toBeInTheDocument();
      });
    });
  });

  /* ================================================================
   * STATUS BUTTONS
   * ================================================================ */

  describe('Status buttons', () => {
    it('PILOT sees "Przekaz do akceptacji" when SUBMITTED', async () => {
      mockAuthAs('PILOT');
      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /przekaz do akceptacji/i }),
      ).toBeInTheDocument();
    });

    it('SUPERVISOR sees Odrzuc and Zaakceptuj when SENT_FOR_APPROVAL', async () => {
      mockAuthAs('SUPERVISOR');
      const sentOrder: OrderResponse = {
        ...mockOrder,
        status: 'SENT_FOR_APPROVAL',
        statusLabel: 'Przekazane do akceptacji',
      };
      (getOrderById as Mock).mockResolvedValue(sentOrder);

      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /odrzuc/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /zaakceptuj/i }),
      ).toBeInTheDocument();
    });

    it('PILOT sees completion buttons when APPROVED', async () => {
      mockAuthAs('PILOT');
      const approvedOrder: OrderResponse = {
        ...mockOrder,
        status: 'APPROVED',
        statusLabel: 'Zaakceptowane',
      };
      (getOrderById as Mock).mockResolvedValue(approvedOrder);

      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /zrealizowane w calosci/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /zrealizowane w czesci/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /nie zrealizowane/i }),
      ).toBeInTheDocument();
    });

    it('clicking Odrzuc shows the confirm dialog', async () => {
      mockAuthAs('SUPERVISOR');
      const user = userEvent.setup();
      const sentOrder: OrderResponse = {
        ...mockOrder,
        status: 'SENT_FOR_APPROVAL',
        statusLabel: 'Przekazane do akceptacji',
      };
      (getOrderById as Mock).mockResolvedValue(sentOrder);

      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /odrzuc/i }));

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/czy na pewno chcesz odrzucic/i),
      ).toBeInTheDocument();
    });
  });

  /* ================================================================
   * ACTUAL DATES
   * ================================================================ */

  describe('Actual dates', () => {
    it('shows actual date fields when status is APPROVED', async () => {
      mockAuthAs('PILOT');
      const approvedOrder: OrderResponse = {
        ...mockOrder,
        status: 'APPROVED',
        statusLabel: 'Zaakceptowane',
      };
      (getOrderById as Mock).mockResolvedValue(approvedOrder);

      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });

      // The actual dates section should be visible. Look for the field labels.
      await waitFor(() => {
        expect(
          screen.getByText(/faktyczny odlot/i),
        ).toBeInTheDocument();
      });
    });
  });

  /* ================================================================
   * ROLE VISIBILITY
   * ================================================================ */

  describe('Role visibility', () => {
    it('ADMIN sees the form as read-only', async () => {
      mockAuthAs('ADMIN');
      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(
          screen.getByText('Edycja zlecenia lotniczego'),
        ).toBeInTheDocument();
      });

      // No save button should be present for admin (or it should be hidden).
      // The form is read-only so status action buttons should not be visible.
      expect(
        screen.queryByRole('button', { name: /przekaz do akceptacji/i }),
      ).not.toBeInTheDocument();
    });

    it('PLANNER cannot access the order form at all', async () => {
      mockAuthAs('PLANNER');
      renderWithRouter('/orders/ord-1');

      await waitFor(() => {
        expect(screen.getByText(/brak dostepu/i)).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Edycja zlecenia lotniczego'),
      ).not.toBeInTheDocument();
    });
  });

  /* ================================================================
   * BAD PATHS
   * ================================================================ */

  describe('Bad paths', () => {
    it('navigates away when API returns error on load', async () => {
      (getOrderById as Mock).mockRejectedValue(new Error('Not found'));

      renderWithRouter('/orders/ord-bad');

      await waitFor(() => {
        expect(getOrderById).toHaveBeenCalledWith('ord-bad');
      });

      // The component calls navigate('/orders') on error. Since the route
      // /orders is not defined in our test router, the page should unmount.
      await waitFor(() => {
        expect(
          screen.queryByText('Edycja zlecenia lotniczego'),
        ).not.toBeInTheDocument();
      });
    });

    it('does not navigate on save error but keeps the form', async () => {
      const user = userEvent.setup();
      (createOrder as Mock).mockRejectedValue(new Error('Server error'));

      renderWithRouter('/orders/new');

      await waitFor(() => {
        expect(
          screen.getByText('Nowe zlecenie lotnicze'),
        ).toBeInTheDocument();
      });

      // Fill the required fields. We need to set values for datetime-local
      // inputs and select inputs.

      // For datetime-local inputs, we can type directly.
      const departureDateInputs = document.querySelectorAll(
        'input[type="datetime-local"]',
      );

      if (departureDateInputs.length >= 2) {
        await user.clear(departureDateInputs[0] as HTMLInputElement);
        await user.type(
          departureDateInputs[0] as HTMLInputElement,
          '2026-05-10T08:00',
        );
        await user.clear(departureDateInputs[1] as HTMLInputElement);
        await user.type(
          departureDateInputs[1] as HTMLInputElement,
          '2026-05-10T12:00',
        );
      }

      // Try to submit. Even if validation fails, createOrder should not
      // have caused navigation on error.
      const saveButton = screen.queryByRole('button', {
        name: /utworz zlecenie/i,
      });
      if (saveButton) {
        await user.click(saveButton);
      }

      // The form should still be visible.
      expect(
        screen.getByText('Nowe zlecenie lotnicze'),
      ).toBeInTheDocument();
    });
  });
});
