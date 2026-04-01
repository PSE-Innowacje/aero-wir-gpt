import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Autocomplete,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import { aeroColors } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  getOrderById,
  createOrder,
  updateOrder,
  changeOrderStatus,
} from '../../api/orders.api';
import { getHelicopters } from '../../api/helicopters.api';
import { getCrewMembers } from '../../api/crew.api';
import { getLandingSites } from '../../api/landingSites.api';
import { getOperations, getOperationById } from '../../api/operations.api';
import type {
  OrderResponse,
  OrderStatus,
  HelicopterResponse,
  CrewMemberResponse,
  LandingSiteResponse,
  OperationListResponse,
  OperationResponse,
} from '../../api/types';

/* ======================================================================
 * Constants
 * ====================================================================== */

const TERMINAL_STATUSES: OrderStatus[] = [
  'COMPLETED',
  'PARTIALLY_COMPLETED',
  'NOT_COMPLETED',
  'REJECTED',
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  SUBMITTED: { label: 'Wprowadzone', color: aeroColors.primary },
  SENT_FOR_APPROVAL: {
    label: 'Przekazane do akceptacji',
    color: aeroColors.secondary,
  },
  REJECTED: { label: 'Odrzucone', color: aeroColors.error },
  APPROVED: { label: 'Zaakceptowane', color: aeroColors.tertiary },
  PARTIALLY_COMPLETED: {
    label: 'Zrealizowane w czesci',
    color: aeroColors.secondary,
  },
  COMPLETED: { label: 'Zrealizowane w calosci', color: '#4caf50' },
  NOT_COMPLETED: {
    label: 'Nie zrealizowane',
    color: aeroColors.onSurfaceVariant,
  },
};

/* ======================================================================
 * Design tokens (matching existing codebase)
 * ====================================================================== */

const GLASS_CARD = {
  background: 'rgba(30, 32, 35, 0.65)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid rgba(255,255,255,0.04)`,
  borderRadius: 2,
} as const;

const SECTION_LABEL_SX = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: aeroColors.outline,
};

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    bgcolor: aeroColors.surfaceContainerLowest,
    '& fieldset': { borderColor: `${aeroColors.outlineVariant}30` },
    '&:hover fieldset': { borderColor: `${aeroColors.outline}50` },
    '&.Mui-focused fieldset': {
      borderColor: `${aeroColors.primary}50`,
      borderWidth: 1,
    },
    '&.Mui-error fieldset': { borderColor: `${aeroColors.secondary}90` },
    '&.Mui-error:hover fieldset': { borderColor: aeroColors.secondary },
    '&.Mui-error.Mui-focused fieldset': {
      borderColor: aeroColors.secondary,
      borderWidth: 1,
    },
  },
  '& .MuiOutlinedInput-input': {
    fontSize: '0.8125rem',
    color: aeroColors.onSurface,
    py: 1.25,
  },
  '& .MuiFormHelperText-root': {
    fontSize: '0.625rem',
    mx: 0,
    mt: 0.5,
    letterSpacing: '0.04em',
  },
} as const;

const DISABLED_INPUT_SX = {
  ...INPUT_SX,
  '& .MuiOutlinedInput-root.Mui-disabled': {
    bgcolor: `${aeroColors.surfaceContainerLowest}60`,
  },
  '& .MuiOutlinedInput-input.Mui-disabled': {
    WebkitTextFillColor: `${aeroColors.outline}70`,
    fontStyle: 'italic',
    fontSize: '0.75rem',
  },
} as const;

const FIELD_LABEL_SX = {
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: aeroColors.onSurfaceVariant,
  mb: 0.75,
};

const AUTOCOMPLETE_SX = {
  '& .MuiAutocomplete-popupIndicator': { color: aeroColors.outline },
  '& .MuiAutocomplete-clearIndicator': { color: aeroColors.outline },
} as const;

const DATETIME_SX = {
  ...INPUT_SX,
  '& input::-webkit-calendar-picker-indicator': {
    filter: 'invert(0.6)',
    cursor: 'pointer',
  },
  '& input[type="datetime-local"]': { colorScheme: 'dark' },
} as const;

const ACTION_BTN_SX = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: 700,
  fontSize: '0.625rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
};

/* ======================================================================
 * Helpers
 * ====================================================================== */

function SectionDivider({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 0.25 }}>
      <Box
        sx={{
          flex: 1,
          height: '1px',
          bgcolor: `${aeroColors.outlineVariant}20`,
        }}
      />
      <Typography
        sx={{ ...SECTION_LABEL_SX, fontSize: '0.5625rem', flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          flex: 1,
          height: '1px',
          bgcolor: `${aeroColors.outlineVariant}20`,
        }}
      />
    </Box>
  );
}

function StatusChip({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Chip
      size="small"
      label={cfg.label}
      sx={{
        bgcolor: `${cfg.color}14`,
        color: cfg.color,
        border: `1px solid ${cfg.color}28`,
        fontWeight: 700,
        fontSize: '0.625rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        height: 24,
      }}
    />
  );
}

/** Convert ISO string to datetime-local input value (YYYY-MM-DDTHH:mm). */
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    // Handle both "2026-04-10T08:00:00" and "2026-04-10T08:00" formats
    return iso.slice(0, 16);
  } catch {
    return '';
  }
}

/** Format an ISO date string (YYYY-MM-DD) for display. */
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '---';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/* ======================================================================
 * Zod schema
 * ====================================================================== */

const orderSchema = z.object({
  plannedDeparture: z.string().min(1, 'Pole wymagane'),
  plannedArrival: z.string().min(1, 'Pole wymagane'),
  helicopterId: z.string().min(1, 'Pole wymagane'),
  crewMemberIds: z.array(z.string()),
  departureSiteId: z.string().min(1, 'Pole wymagane'),
  arrivalSiteId: z.string().min(1, 'Pole wymagane'),
  operationIds: z.array(z.string()),
  actualDeparture: z.string().optional(),
  actualArrival: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

/* ======================================================================
 * Component
 * ====================================================================== */

export default function OrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const isEdit = Boolean(id);
  const userRole = user?.role ?? 'PILOT';
  const isPlanner = userRole === 'PLANNER';
  const isAdminReadOnly = userRole === 'ADMIN';

  /* -- Data state ------------------------------------------------------ */
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<OrderResponse | null>(null);

  /* -- Reference data -------------------------------------------------- */
  const [helicopters, setHelicopters] = useState<HelicopterResponse[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMemberResponse[]>([]);
  const [landingSites, setLandingSites] = useState<LandingSiteResponse[]>([]);
  const [confirmedOps, setConfirmedOps] = useState<OperationListResponse[]>([]);
  const [loadedOps, setLoadedOps] = useState<Map<string, OperationResponse>>(
    new Map(),
  );

  /* -- Confirm dialog -------------------------------------------------- */
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: string;
    color: 'error' | 'primary' | 'warning';
  }>({
    open: false,
    title: '',
    message: '',
    action: '',
    color: 'primary',
  });

  /* -- Form ------------------------------------------------------------ */
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      plannedDeparture: '',
      plannedArrival: '',
      helicopterId: '',
      crewMemberIds: [],
      departureSiteId: '',
      arrivalSiteId: '',
      operationIds: [],
      actualDeparture: '',
      actualArrival: '',
    },
  });

  useUnsavedChanges(isDirty && !isAdminReadOnly);

  /* -- Watched values -------------------------------------------------- */
  const watchedHelicopterId = useWatch({ control, name: 'helicopterId' });
  const watchedCrewMemberIds = useWatch({ control, name: 'crewMemberIds' });
  const watchedOperationIds = useWatch({ control, name: 'operationIds' });
  const watchedPlannedDeparture = useWatch({
    control,
    name: 'plannedDeparture',
  });
  const watchedActualDeparture = useWatch({
    control,
    name: 'actualDeparture',
  });
  const watchedActualArrival = useWatch({ control, name: 'actualArrival' });

  /* -- Derived state --------------------------------------------------- */
  const currentStatus: OrderStatus = order?.status ?? 'SUBMITTED';
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
  const isFormReadOnly = isTerminal || isAdminReadOnly;

  /* -- Selected helicopter --------------------------------------------- */
  const selectedHelicopter = useMemo(
    () => helicopters.find((h) => h.id === watchedHelicopterId) ?? null,
    [helicopters, watchedHelicopterId],
  );

  /* -- Active helicopters for dropdown --------------------------------- */
  const activeHelicopters = useMemo(
    () => helicopters.filter((h) => h.status === 'ACTIVE'),
    [helicopters],
  );

  /* -- Sorted crew members --------------------------------------------- */
  const sortedCrewMembers = useMemo(
    () =>
      [...crewMembers].sort((a, b) =>
        a.lastName.localeCompare(b.lastName, 'pl'),
      ),
    [crewMembers],
  );

  /* -- Pilot crew member ----------------------------------------------- */
  const pilotCrewMember = useMemo(() => {
    if (!order?.pilotId) return null;
    return crewMembers.find((m) => m.id === order.pilotId) ?? null;
  }, [crewMembers, order?.pilotId]);

  /* -- Pilot display name ---------------------------------------------- */
  const pilotDisplayName = useMemo(() => {
    if (pilotCrewMember) {
      return `${pilotCrewMember.firstName} ${pilotCrewMember.lastName}`;
    }
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return '---';
  }, [pilotCrewMember, user]);

  /* -- Crew weight (auto-calculated) ----------------------------------- */
  const crewWeightKg = useMemo(() => {
    let total = 0;
    // Include pilot weight
    if (pilotCrewMember) {
      total += pilotCrewMember.weightKg;
    }
    // Include selected crew members
    const ids = watchedCrewMemberIds ?? [];
    for (const memberId of ids) {
      const member = crewMembers.find((m) => m.id === memberId);
      if (member) total += member.weightKg;
    }
    return total;
  }, [pilotCrewMember, watchedCrewMemberIds, crewMembers]);

  /* -- Estimated route length (auto-calculated) ------------------------ */
  const estimatedRouteLengthKm = useMemo(() => {
    const ids = watchedOperationIds ?? [];
    let total = 0;
    for (const opId of ids) {
      const op = loadedOps.get(opId);
      if (op) total += op.routeLengthKm;
    }
    return total;
  }, [watchedOperationIds, loadedOps]);

  /* -- Validation warnings (Task 63) ----------------------------------- */
  const validationWarnings = useMemo(() => {
    const warnings: string[] = [];
    const departureStr = watchedPlannedDeparture;
    if (!departureStr) return warnings;

    const departureDate = departureStr.slice(0, 10); // YYYY-MM-DD

    // 1. Helicopter inspection
    if (selectedHelicopter?.inspectionExpiryDate) {
      if (selectedHelicopter.inspectionExpiryDate < departureDate) {
        warnings.push(
          `Przeglad helikoptera wygasa ${formatDate(selectedHelicopter.inspectionExpiryDate)} \u2014 przed planowanym odlotem`,
        );
      }
    }

    // 2. Pilot license
    if (pilotCrewMember?.licenseExpiryDate) {
      if (pilotCrewMember.licenseExpiryDate < departureDate) {
        warnings.push(
          `Licencja pilota wygasa ${formatDate(pilotCrewMember.licenseExpiryDate)} \u2014 przed planowanym odlotem`,
        );
      }
    }

    // 3. Crew training (pilot + all crew)
    if (pilotCrewMember?.trainingExpiryDate) {
      if (pilotCrewMember.trainingExpiryDate < departureDate) {
        warnings.push(
          `Szkolenie ${pilotCrewMember.firstName} ${pilotCrewMember.lastName} wygasa ${formatDate(pilotCrewMember.trainingExpiryDate)} \u2014 przed planowanym odlotem`,
        );
      }
    }
    const crewIds = watchedCrewMemberIds ?? [];
    for (const memberId of crewIds) {
      const member = crewMembers.find((m) => m.id === memberId);
      if (member?.trainingExpiryDate && member.trainingExpiryDate < departureDate) {
        warnings.push(
          `Szkolenie ${member.firstName} ${member.lastName} wygasa ${formatDate(member.trainingExpiryDate)} \u2014 przed planowanym odlotem`,
        );
      }
    }

    // 4. Crew weight
    if (selectedHelicopter && crewWeightKg > selectedHelicopter.maxCrewWeightKg) {
      warnings.push(
        `Masa zalogi (${crewWeightKg} kg) przekracza limit helikoptera (${selectedHelicopter.maxCrewWeightKg} kg)`,
      );
    }

    // 5. Route range
    if (selectedHelicopter && estimatedRouteLengthKm > selectedHelicopter.rangeKm) {
      warnings.push(
        `Szacowana trasa (${estimatedRouteLengthKm} km) przekracza zasieg helikoptera (${selectedHelicopter.rangeKm} km)`,
      );
    }

    return warnings;
  }, [
    watchedPlannedDeparture,
    selectedHelicopter,
    pilotCrewMember,
    watchedCrewMemberIds,
    crewMembers,
    crewWeightKg,
    estimatedRouteLengthKm,
  ]);

  /* -- Status action visibility (Task 64) ------------------------------ */
  const canSendForApproval =
    isEdit && userRole === 'PILOT' && currentStatus === 'SUBMITTED';
  const canReject =
    isEdit && userRole === 'SUPERVISOR' && currentStatus === 'SENT_FOR_APPROVAL';
  const canApprove =
    isEdit && userRole === 'SUPERVISOR' && currentStatus === 'SENT_FOR_APPROVAL';
  const canPartialComplete =
    isEdit && userRole === 'PILOT' && currentStatus === 'APPROVED';
  const canComplete =
    isEdit && userRole === 'PILOT' && currentStatus === 'APPROVED';
  const canNotComplete =
    isEdit && userRole === 'PILOT' && currentStatus === 'APPROVED';

  const hasAnyStatusAction =
    canSendForApproval ||
    canReject ||
    canApprove ||
    canPartialComplete ||
    canComplete ||
    canNotComplete;

  const showActualDates = currentStatus === 'APPROVED';

  // Completion buttons require actual dates
  const actualDatesProvided = Boolean(
    watchedActualDeparture && watchedActualArrival,
  );

  /* -- Load reference data --------------------------------------------- */
  useEffect(() => {
    Promise.all([
      getHelicopters(),
      getCrewMembers(),
      getLandingSites(),
      getOperations('CONFIRMED'),
    ])
      .then(([helis, crew, sites, ops]) => {
        setHelicopters(helis);
        setCrewMembers(crew);
        setLandingSites(sites);
        setConfirmedOps(ops);
      })
      .catch(() => {
        /* Global interceptor handles notification */
      });
  }, []);

  /* -- Load order in edit mode ----------------------------------------- */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOrderById(id)
      .then((o) => {
        setOrder(o);
        reset({
          plannedDeparture: toDatetimeLocal(o.plannedDeparture),
          plannedArrival: toDatetimeLocal(o.plannedArrival),
          helicopterId: o.helicopterId,
          crewMemberIds: o.crewMemberIds ?? [],
          departureSiteId: o.departureSiteId,
          arrivalSiteId: o.arrivalSiteId,
          operationIds: o.operationIds ?? [],
          actualDeparture: toDatetimeLocal(o.actualDeparture),
          actualArrival: toDatetimeLocal(o.actualArrival),
        });
      })
      .catch(() => {
        navigate('/orders');
      })
      .finally(() => setLoading(false));
  }, [id, reset, navigate]);

  /* -- Fetch full operation details for selected operations ------------ */
  useEffect(() => {
    const ids = watchedOperationIds ?? [];
    const missing = ids.filter((opId) => !loadedOps.has(opId));
    if (missing.length === 0) return;

    Promise.all(missing.map((opId) => getOperationById(opId)))
      .then((results) => {
        setLoadedOps((prev) => {
          const next = new Map(prev);
          for (const op of results) {
            next.set(op.id, op);
          }
          return next;
        });
      })
      .catch(() => {
        /* Global interceptor handles notification */
      });
  }, [watchedOperationIds, loadedOps]);

  /* -- Save handler ---------------------------------------------------- */
  const onSubmit = useCallback(
    async (values: OrderFormValues) => {
      if (isAdminReadOnly) return;
      setSaving(true);
      try {
        const payload = {
          plannedDeparture: values.plannedDeparture,
          plannedArrival: values.plannedArrival,
          helicopterId: values.helicopterId,
          crewMemberIds: values.crewMemberIds,
          departureSiteId: values.departureSiteId,
          arrivalSiteId: values.arrivalSiteId,
          operationIds: values.operationIds,
          actualDeparture: values.actualDeparture || undefined,
          actualArrival: values.actualArrival || undefined,
        };

        if (isEdit && id) {
          await updateOrder(id, payload);
          showSuccess('Zlecenie zaktualizowane');
        } else {
          await createOrder(payload);
          showSuccess('Zlecenie utworzone');
        }
        navigate('/orders');
      } catch {
        /* Global interceptor shows error notification */
      } finally {
        setSaving(false);
      }
    },
    [isEdit, id, isAdminReadOnly, navigate, showSuccess],
  );

  /* -- Status change handler ------------------------------------------- */
  const handleStatusAction = useCallback(
    async (action: string) => {
      if (!id) return;

      // For completion actions, save actual dates first
      if (
        ['partialComplete', 'complete'].includes(action) &&
        (watchedActualDeparture || watchedActualArrival)
      ) {
        try {
          const currentValues = {
            plannedDeparture:
              order?.plannedDeparture ??
              toDatetimeLocal(order?.plannedDeparture),
            plannedArrival:
              order?.plannedArrival ??
              toDatetimeLocal(order?.plannedArrival),
            helicopterId: order?.helicopterId ?? '',
            crewMemberIds: order?.crewMemberIds ?? [],
            departureSiteId: order?.departureSiteId ?? '',
            arrivalSiteId: order?.arrivalSiteId ?? '',
            operationIds: order?.operationIds ?? [],
            actualDeparture: watchedActualDeparture || undefined,
            actualArrival: watchedActualArrival || undefined,
          };
          await updateOrder(id, currentValues);
        } catch {
          showError(
            'Nie udalo sie zapisac dat rzeczywistych przed zmiana statusu',
          );
          return;
        }
      }

      setSaving(true);
      try {
        const updated = await changeOrderStatus(id, { action });
        setOrder(updated);
        reset({
          plannedDeparture: toDatetimeLocal(updated.plannedDeparture),
          plannedArrival: toDatetimeLocal(updated.plannedArrival),
          helicopterId: updated.helicopterId,
          crewMemberIds: updated.crewMemberIds ?? [],
          departureSiteId: updated.departureSiteId,
          arrivalSiteId: updated.arrivalSiteId,
          operationIds: updated.operationIds ?? [],
          actualDeparture: toDatetimeLocal(updated.actualDeparture),
          actualArrival: toDatetimeLocal(updated.actualArrival),
        });
        showSuccess('Status zlecenia zmieniony');
      } catch {
        /* Global interceptor shows error notification */
      } finally {
        setSaving(false);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      }
    },
    [
      id,
      order,
      watchedActualDeparture,
      watchedActualArrival,
      reset,
      showSuccess,
      showError,
    ],
  );

  /* -- Merge confirmed ops with already-selected ops in edit mode ------ */
  const allAvailableOps = useMemo(() => {
    const opMap = new Map<string, OperationListResponse>();
    for (const op of confirmedOps) {
      opMap.set(op.id, op);
    }
    // In edit mode, the order may reference operations that are now SCHEDULED
    // (because creating the order moved them from CONFIRMED to SCHEDULED).
    // We need to include those so they show up in the Autocomplete.
    const selectedIds = watchedOperationIds ?? [];
    for (const opId of selectedIds) {
      if (!opMap.has(opId)) {
        const loaded = loadedOps.get(opId);
        if (loaded) {
          opMap.set(opId, {
            id: loaded.id,
            orderNumber: loaded.orderNumber,
            activityTypes: loaded.activityTypes,
            proposedDateEarliest: loaded.proposedDateEarliest,
            proposedDateLatest: loaded.proposedDateLatest,
            plannedDateEarliest: loaded.plannedDateEarliest,
            plannedDateLatest: loaded.plannedDateLatest,
            status: loaded.status,
            statusLabel: loaded.statusLabel,
          });
        }
      }
    }
    return Array.from(opMap.values());
  }, [confirmedOps, watchedOperationIds, loadedOps]);

  /* ==================================================================
   * Access control (PLANNER has no access)
   * ================================================================== */

  if (isPlanner) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <Typography sx={{ color: aeroColors.error, fontSize: '1rem' }}>
          Brak dostepu
        </Typography>
      </Box>
    );
  }

  /* ==================================================================
   * Loading state
   * ================================================================== */

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress size={48} sx={{ color: aeroColors.primary }} />
      </Box>
    );
  }

  /* ==================================================================
   * Render
   * ================================================================== */

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 3, px: 2 }}>
      {/* -- Back button + header --------------------------------------- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Powrot do listy zlecen">
          <IconButton
            onClick={() => navigate('/orders')}
            sx={{
              color: aeroColors.onSurfaceVariant,
              bgcolor: `${aeroColors.outlineVariant}15`,
              '&:hover': { bgcolor: `${aeroColors.outlineVariant}25` },
            }}
            aria-label="Powrot do listy zlecen"
          >
            <ArrowBackOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              color: aeroColors.onSurface,
              letterSpacing: '0.02em',
            }}
          >
            {isEdit ? 'Edycja zlecenia lotniczego' : 'Nowe zlecenie lotnicze'}
          </Typography>
          {isEdit && order && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: aeroColors.outline,
                mt: 0.25,
              }}
            >
              ID: {order.id}
            </Typography>
          )}
        </Box>
        {isEdit && (
          <Box sx={{ ml: 'auto' }}>
            <StatusChip status={currentStatus} />
          </Box>
        )}
      </Box>

      {/* -- Validation warnings (Task 63) ------------------------------ */}
      {validationWarnings.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {validationWarnings.map((warning, idx) => (
            <Alert
              key={idx}
              severity="warning"
              sx={{
                bgcolor: 'rgba(255, 152, 0, 0.08)',
                color: aeroColors.secondary,
                border: `1px solid rgba(255, 152, 0, 0.2)`,
                '& .MuiAlert-icon': { color: aeroColors.secondary },
                fontSize: '0.8125rem',
              }}
            >
              {warning}
            </Alert>
          ))}
        </Box>
      )}

      {/* -- Status action buttons (Task 64) ---------------------------- */}
      {isEdit && hasAnyStatusAction && (
        <Box
          sx={{
            ...GLASS_CARD,
            p: 2,
            mb: 3,
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography
            sx={{
              ...SECTION_LABEL_SX,
              fontSize: '0.5625rem',
              mr: 'auto',
            }}
          >
            Akcje statusu
          </Typography>

          {/* PILOT: SUBMITTED -> SEND_FOR_APPROVAL */}
          {canSendForApproval && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={saving}
              onClick={() => handleStatusAction('submitForApproval')}
              sx={ACTION_BTN_SX}
            >
              Przekaz do akceptacji
            </Button>
          )}

          {/* SUPERVISOR: SENT_FOR_APPROVAL -> REJECT */}
          {canReject && (
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={saving}
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  title: 'Odrzucenie zlecenia',
                  message:
                    'Czy na pewno chcesz odrzucic to zlecenie? Ta akcja jest nieodwracalna.',
                  action: 'reject',
                  color: 'error',
                })
              }
              sx={ACTION_BTN_SX}
            >
              Odrzuc
            </Button>
          )}

          {/* SUPERVISOR: SENT_FOR_APPROVAL -> APPROVE */}
          {canApprove && (
            <Button
              variant="contained"
              size="small"
              disabled={saving}
              onClick={() => handleStatusAction('approve')}
              sx={{
                ...ACTION_BTN_SX,
                bgcolor: '#4caf50',
                color: '#fff',
                '&:hover': { bgcolor: '#43a047' },
              }}
            >
              Zaakceptuj
            </Button>
          )}

          {/* PILOT: APPROVED -> completion actions */}
          {canPartialComplete && (
            <Button
              variant="contained"
              size="small"
              disabled={saving || !actualDatesProvided}
              onClick={() => handleStatusAction('partialComplete')}
              sx={{
                ...ACTION_BTN_SX,
                bgcolor: '#ff9800',
                color: '#fff',
                '&:hover': { bgcolor: '#f57c00' },
                '&.Mui-disabled': {
                  bgcolor: '#ff980040',
                  color: '#ffffff60',
                },
              }}
            >
              Zrealizowane w czesci
            </Button>
          )}

          {canComplete && (
            <Button
              variant="contained"
              size="small"
              disabled={saving || !actualDatesProvided}
              onClick={() => handleStatusAction('complete')}
              sx={{
                ...ACTION_BTN_SX,
                bgcolor: '#4caf50',
                color: '#fff',
                '&:hover': { bgcolor: '#43a047' },
                '&.Mui-disabled': {
                  bgcolor: '#4caf5040',
                  color: '#ffffff60',
                },
              }}
            >
              Zrealizowane w calosci
            </Button>
          )}

          {canNotComplete && (
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={saving}
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  title: 'Zlecenie niezrealizowane',
                  message:
                    'Czy na pewno chcesz oznaczyc zlecenie jako niezrealizowane? Operacje wroca do statusu "Potwierdzone".',
                  action: 'notCompleted',
                  color: 'error',
                })
              }
              sx={ACTION_BTN_SX}
            >
              Nie zrealizowane
            </Button>
          )}

          {/* Hint when actual dates are required */}
          {(canPartialComplete || canComplete) && !actualDatesProvided && (
            <Typography
              sx={{
                fontSize: '0.625rem',
                color: aeroColors.outline,
                fontStyle: 'italic',
                width: '100%',
              }}
            >
              Uzupelnij daty faktycznego odlotu i przylotu, aby odblokac
              przyciski realizacji.
            </Typography>
          )}
        </Box>
      )}

      {/* -- Main form -------------------------------------------------- */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box sx={{ ...GLASS_CARD, p: 3, mb: 3 }}>
          {/* --- Pilot ------------------------------------------------- */}
          <SectionDivider label="Pilot" />
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography sx={FIELD_LABEL_SX}>Pilot</Typography>
            <TextField
              size="small"
              fullWidth
              value={pilotDisplayName}
              disabled
              sx={DISABLED_INPUT_SX}
              inputProps={{ 'aria-label': 'Pilot' }}
            />
            <Typography
              sx={{
                fontSize: '0.5625rem',
                color: aeroColors.outline,
                mt: 0.5,
                fontStyle: 'italic',
              }}
            >
              Pilot jest ustalany automatycznie na podstawie zalogowanego
              uzytkownika
            </Typography>
          </Box>

          {/* --- Daty planowane ----------------------------------------- */}
          <SectionDivider label="Daty planowane" />
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Planowany odlot
                <Box
                  component="span"
                  sx={{ color: aeroColors.secondary, ml: 0.5 }}
                >
                  *
                </Box>
              </Typography>
              <TextField
                type="datetime-local"
                size="small"
                fullWidth
                disabled={isFormReadOnly}
                error={!!errors.plannedDeparture}
                helperText={errors.plannedDeparture?.message}
                sx={isFormReadOnly ? DISABLED_INPUT_SX : DATETIME_SX}
                inputProps={{
                  'aria-label': 'Planowany odlot',
                }}
                {...register('plannedDeparture')}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Planowany przylot
                <Box
                  component="span"
                  sx={{ color: aeroColors.secondary, ml: 0.5 }}
                >
                  *
                </Box>
              </Typography>
              <TextField
                type="datetime-local"
                size="small"
                fullWidth
                disabled={isFormReadOnly}
                error={!!errors.plannedArrival}
                helperText={errors.plannedArrival?.message}
                sx={isFormReadOnly ? DISABLED_INPUT_SX : DATETIME_SX}
                inputProps={{
                  'aria-label': 'Planowany przylot',
                }}
                {...register('plannedArrival')}
              />
            </Box>
          </Box>

          {/* --- Helikopter -------------------------------------------- */}
          <SectionDivider label="Helikopter" />
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography sx={FIELD_LABEL_SX}>
              Helikopter
              <Box
                component="span"
                sx={{ color: aeroColors.secondary, ml: 0.5 }}
              >
                *
              </Box>
            </Typography>
            <Controller
              name="helicopterId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  size="small"
                  fullWidth
                  disabled={isFormReadOnly}
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.helicopterId}
                  helperText={errors.helicopterId?.message}
                  sx={isFormReadOnly ? DISABLED_INPUT_SX : INPUT_SX}
                  inputProps={{ 'aria-label': 'Helikopter' }}
                >
                  <MenuItem value="" disabled>
                    <em>Wybierz helikopter</em>
                  </MenuItem>
                  {activeHelicopters.map((h) => (
                    <MenuItem key={h.id} value={h.id}>
                      {h.registrationNumber} &mdash; {h.type}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>

          {/* --- Czlonkowie zalogi -------------------------------------- */}
          <SectionDivider label="Zaloga" />
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography sx={FIELD_LABEL_SX}>Czlonkowie zalogi</Typography>
            <Controller
              name="crewMemberIds"
              control={control}
              render={({ field }) => {
                const selected = sortedCrewMembers.filter((m) =>
                  (field.value ?? []).includes(m.id),
                );
                return (
                  <Autocomplete
                    multiple
                    options={sortedCrewMembers}
                    value={selected}
                    disabled={isFormReadOnly}
                    getOptionLabel={(opt) =>
                      `${opt.firstName} ${opt.lastName} (${opt.role === 'PILOT' ? 'Pilot' : 'Obserwator'})`
                    }
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    onChange={(_, newVal) =>
                      field.onChange(newVal.map((m) => m.id))
                    }
                    renderTags={(tags, getTagProps) =>
                      tags.map((tag, idx) => (
                        <Chip
                          {...getTagProps({ index: idx })}
                          key={tag.id}
                          size="small"
                          label={`${tag.firstName} ${tag.lastName}`}
                          sx={{
                            bgcolor: `${aeroColors.primary}18`,
                            color: aeroColors.primary,
                            border: `1px solid ${aeroColors.primary}30`,
                            fontSize: '0.6875rem',
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Wyszukaj czlonkow zalogi..."
                        sx={INPUT_SX}
                      />
                    )}
                    sx={AUTOCOMPLETE_SX}
                  />
                );
              }}
            />
          </Box>

          {/* --- Lotniska ----------------------------------------------- */}
          <SectionDivider label="Lotniska" />
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Lotnisko odlotu
                <Box
                  component="span"
                  sx={{ color: aeroColors.secondary, ml: 0.5 }}
                >
                  *
                </Box>
              </Typography>
              <Controller
                name="departureSiteId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    size="small"
                    fullWidth
                    disabled={isFormReadOnly}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.departureSiteId}
                    helperText={errors.departureSiteId?.message}
                    sx={isFormReadOnly ? DISABLED_INPUT_SX : INPUT_SX}
                    inputProps={{ 'aria-label': 'Lotnisko odlotu' }}
                  >
                    <MenuItem value="" disabled>
                      <em>Wybierz lotnisko</em>
                    </MenuItem>
                    {landingSites.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Lotnisko przylotu
                <Box
                  component="span"
                  sx={{ color: aeroColors.secondary, ml: 0.5 }}
                >
                  *
                </Box>
              </Typography>
              <Controller
                name="arrivalSiteId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    size="small"
                    fullWidth
                    disabled={isFormReadOnly}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.arrivalSiteId}
                    helperText={errors.arrivalSiteId?.message}
                    sx={isFormReadOnly ? DISABLED_INPUT_SX : INPUT_SX}
                    inputProps={{ 'aria-label': 'Lotnisko przylotu' }}
                  >
                    <MenuItem value="" disabled>
                      <em>Wybierz lotnisko</em>
                    </MenuItem>
                    {landingSites.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
          </Box>

          {/* --- Operacje (Task 62) ------------------------------------ */}
          <SectionDivider label="Operacje" />
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography sx={FIELD_LABEL_SX}>Operacje</Typography>
            <Controller
              name="operationIds"
              control={control}
              render={({ field }) => {
                const selected = allAvailableOps.filter((op) =>
                  (field.value ?? []).includes(op.id),
                );
                return (
                  <Autocomplete
                    multiple
                    options={allAvailableOps}
                    value={selected}
                    disabled={isFormReadOnly}
                    getOptionLabel={(opt) => opt.orderNumber}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    onChange={(_, newVal) =>
                      field.onChange(newVal.map((op) => op.id))
                    }
                    renderTags={(tags, getTagProps) =>
                      tags.map((tag, idx) => (
                        <Chip
                          {...getTagProps({ index: idx })}
                          key={tag.id}
                          size="small"
                          label={tag.orderNumber}
                          sx={{
                            bgcolor: `${aeroColors.tertiary}18`,
                            color: aeroColors.tertiary,
                            border: `1px solid ${aeroColors.tertiary}30`,
                            fontSize: '0.6875rem',
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Wyszukaj operacje (status: Potwierdzone)..."
                        sx={INPUT_SX}
                      />
                    )}
                    sx={AUTOCOMPLETE_SX}
                  />
                );
              }}
            />
          </Box>

          {/* --- Auto-calculated fields (Task 62) ---------------------- */}
          <SectionDivider label="Wartosci wyliczane" />
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>Masa zalogi (kg)</Typography>
              <TextField
                size="small"
                fullWidth
                value={crewWeightKg}
                disabled
                sx={DISABLED_INPUT_SX}
                inputProps={{ 'aria-label': 'Masa zalogi' }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Szacowana dlugosc trasy (km)
              </Typography>
              <TextField
                size="small"
                fullWidth
                value={estimatedRouteLengthKm}
                disabled
                sx={DISABLED_INPUT_SX}
                inputProps={{ 'aria-label': 'Szacowana dlugosc trasy' }}
              />
            </Box>
          </Box>

          {/* --- Actual dates (Task 64) -------------------------------- */}
          {showActualDates && (
            <>
              <SectionDivider label="Daty faktyczne" />
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={FIELD_LABEL_SX}>
                    Faktyczny odlot
                  </Typography>
                  <TextField
                    type="datetime-local"
                    size="small"
                    fullWidth
                    disabled={userRole !== 'PILOT'}
                    sx={
                      userRole !== 'PILOT' ? DISABLED_INPUT_SX : DATETIME_SX
                    }
                    inputProps={{
                      'aria-label': 'Faktyczny odlot',
                    }}
                    {...register('actualDeparture')}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={FIELD_LABEL_SX}>
                    Faktyczny przylot
                  </Typography>
                  <TextField
                    type="datetime-local"
                    size="small"
                    fullWidth
                    disabled={userRole !== 'PILOT'}
                    sx={
                      userRole !== 'PILOT' ? DISABLED_INPUT_SX : DATETIME_SX
                    }
                    inputProps={{
                      'aria-label': 'Faktyczny przylot',
                    }}
                    {...register('actualArrival')}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>



        {/* --- Save button --------------------------------------------- */}
        {!isAdminReadOnly && !isTerminal && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/orders')}
              sx={{
                color: aeroColors.onSurfaceVariant,
                borderColor: `${aeroColors.outlineVariant}50`,
                ...ACTION_BTN_SX,
                '&:hover': {
                  borderColor: aeroColors.outline,
                  bgcolor: `${aeroColors.outline}08`,
                },
              }}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              disabled={saving}
              sx={ACTION_BTN_SX}
            >
              {saving ? (
                <CircularProgress size={18} sx={{ color: 'inherit' }} />
              ) : isEdit ? (
                'Zapisz zmiany'
              ) : (
                'Utworz zlecenie'
              )}
            </Button>
          </Box>
        )}
      </Box>

      {/* -- Confirm dialog --------------------------------------------- */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmColor={confirmDialog.color}
        onConfirm={() => handleStatusAction(confirmDialog.action)}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, open: false }))
        }
      />
    </Box>
  );
}
