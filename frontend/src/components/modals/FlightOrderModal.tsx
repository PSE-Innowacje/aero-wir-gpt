import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  Autocomplete,
  Chip,
  CircularProgress,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { aeroColors } from '../../theme';
import { getHelicopters } from '../../api/helicopters.api';
import { getCrewMembers } from '../../api/crew.api';
import { getLandingSites } from '../../api/landingSites.api';
import { getOperations } from '../../api/operations.api';
import type { HelicopterResponse, CrewMemberResponse, LandingSiteResponse, OperationListResponse } from '../../api/types';

/* ── Types ──────────────────────────────────────────────────────────────── */
export type FlightOrderStatus =
  | 'SUBMITTED'
  | 'SENT_FOR_APPROVAL'
  | 'REJECTED'
  | 'APPROVED'
  | 'PARTIALLY_COMPLETED'
  | 'COMPLETED'
  | 'NOT_COMPLETED';

export interface FlightOrderData {
  id?: string;
  plannedDeparture: string;
  plannedArrival: string;
  pilotId: string;
  status: FlightOrderStatus;
  helicopterId: string;
  crewMemberIds: string[];
  departureLandingSiteId: string;
  arrivalLandingSiteId: string;
  operationIds: string[];
  estimatedRouteLengthKm: number;
  actualDeparture?: string;
  actualArrival?: string;
}

/* ── Status config ──────────────────────────────────────────────────────── */
export const ORDER_STATUS_OPTIONS: Array<{
  value: FlightOrderStatus;
  label: string;
  color: string;
}> = [
  { value: 'SUBMITTED',           label: 'Wprowadzone',               color: aeroColors.primary },
  { value: 'SENT_FOR_APPROVAL',   label: 'Przekazane do akceptacji',   color: aeroColors.secondary },
  { value: 'REJECTED',            label: 'Odrzucone',                  color: aeroColors.error },
  { value: 'APPROVED',            label: 'Zaakceptowane',              color: aeroColors.tertiary },
  { value: 'PARTIALLY_COMPLETED', label: 'Zrealizowane w części',      color: aeroColors.secondary },
  { value: 'COMPLETED',           label: 'Zrealizowane w całości',     color: '#4caf50' },
  { value: 'NOT_COMPLETED',       label: 'Nie zrealizowane',           color: aeroColors.onSurfaceVariant },
];

/* ── Mock options (replaced by API calls once backend is integrated) ─────── */
interface MockCrewMember {
  id: string;
  firstName: string;
  lastName: string;
  weightKg: number;
  role: 'PILOT' | 'OBSERVER';
}
interface MockHelicopter { id: string; registrationNumber: string; type: string }
interface MockLandingSite { id: string; name: string }

export const MOCK_CREW_MEMBERS: MockCrewMember[] = [
  { id: 'p1', firstName: 'Jan',       lastName: 'Nowak',       weightKg: 82, role: 'PILOT' },
  { id: 'p2', firstName: 'Anna',      lastName: 'Kowalczyk',   weightKg: 65, role: 'PILOT' },
  { id: 'p3', firstName: 'Marek',     lastName: 'Zieliński',   weightKg: 78, role: 'PILOT' },
  { id: 'c1', firstName: 'Katarzyna', lastName: 'Wiśniewska',  weightKg: 60, role: 'OBSERVER' },
  { id: 'c2', firstName: 'Tomasz',    lastName: 'Adamski',     weightKg: 75, role: 'OBSERVER' },
  { id: 'c3', firstName: 'Piotr',     lastName: 'Wróbel',      weightKg: 70, role: 'OBSERVER' },
];

export const MOCK_PILOTS = MOCK_CREW_MEMBERS.filter((m) => m.role === 'PILOT');

export const MOCK_HELICOPTERS: MockHelicopter[] = [
  { id: 'h1', registrationNumber: 'SP-AER', type: 'Airbus H160' },
  { id: 'h2', registrationNumber: 'SP-HLP', type: 'Bell 429' },
  { id: 'h3', registrationNumber: 'SP-LPR', type: 'Eurocopter EC135' },
];

export const MOCK_LANDING_SITES: MockLandingSite[] = [
  { id: 'ls1', name: 'Warszawa Babice' },
  { id: 'ls2', name: 'Kraków Balice' },
  { id: 'ls3', name: 'Gdańsk Rębiechowo' },
  { id: 'ls4', name: 'Poznań Ławica' },
];


/* ── Zod schema ─────────────────────────────────────────────────────────── */
const STATUS_VALUES = [
  'SUBMITTED',
  'SENT_FOR_APPROVAL',
  'REJECTED',
  'APPROVED',
  'PARTIALLY_COMPLETED',
  'COMPLETED',
  'NOT_COMPLETED',
] as const;

const flightOrderSchema = z
  .object({
    plannedDeparture:       z.string().min(1, 'Pole wymagane'),
    plannedArrival:         z.string().min(1, 'Pole wymagane'),
    pilotId:                z.string().min(1, 'Pole wymagane'),
    status:                 z.enum(STATUS_VALUES),
    helicopterId:           z.string().min(1, 'Pole wymagane'),
    crewMemberIds:          z.array(z.string()),
    departureLandingSiteId: z.string().min(1, 'Pole wymagane'),
    arrivalLandingSiteId:   z.string().min(1, 'Pole wymagane'),
    operationIds:           z.array(z.string()).min(1, 'Wybierz co najmniej jedną operację'),
    estimatedRouteLengthKm: z.coerce
      .number({ message: 'Podaj liczbę' })
      .int('Musi być liczbą całkowitą')
      .min(1, 'Wartość musi być > 0'),
    actualDeparture: z.string().optional(),
    actualArrival:   z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const needsActual =
      data.status === 'PARTIALLY_COMPLETED' || data.status === 'COMPLETED';
    if (needsActual && !data.actualDeparture) {
      ctx.addIssue({ code: 'custom', path: ['actualDeparture'], message: 'Wymagane dla tego statusu' });
    }
    if (needsActual && !data.actualArrival) {
      ctx.addIssue({ code: 'custom', path: ['actualArrival'], message: 'Wymagane dla tego statusu' });
    }
  });

type FlightOrderFormValues = z.infer<typeof flightOrderSchema>;

/* ── Design tokens ──────────────────────────────────────────────────────── */
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
    '&.Mui-focused fieldset': { borderColor: `${aeroColors.tertiary}50`, borderWidth: 1 },
    '&.Mui-error fieldset': { borderColor: `${aeroColors.secondary}90` },
    '&.Mui-error:hover fieldset': { borderColor: aeroColors.secondary },
    '&.Mui-error.Mui-focused fieldset': { borderColor: aeroColors.secondary, borderWidth: 1 },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.75rem',
    color: aeroColors.outline,
    '&.Mui-focused': { color: aeroColors.tertiary },
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

const FIELD_LABEL_SX = {
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: aeroColors.onSurfaceVariant,
  mb: 0.75,
};

const DATETIME_SX = {
  ...INPUT_SX,
  '& input::-webkit-calendar-picker-indicator': {
    filter: 'invert(0.6)',
    cursor: 'pointer',
  },
  '& input[type="datetime-local"]': {
    colorScheme: 'dark',
  },
} as const;

const AUTOCOMPLETE_SX = {
  '& .MuiAutocomplete-popupIndicator': { color: aeroColors.outline },
  '& .MuiAutocomplete-clearIndicator': { color: aeroColors.outline },
} as const;

/* ── Internal helpers ───────────────────────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 0.25 }}>
      <Box sx={{ flex: 1, height: '1px', bgcolor: `${aeroColors.outlineVariant}20` }} />
      <Typography sx={{ ...SECTION_LABEL_SX, fontSize: '0.5625rem', flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: `${aeroColors.outlineVariant}20` }} />
    </Box>
  );
}

/* ── Default form values ────────────────────────────────────────────────── */
const EMPTY_DEFAULTS: FlightOrderFormValues = {
  plannedDeparture:       '',
  plannedArrival:         '',
  pilotId:                '',
  status:                 'SUBMITTED',
  helicopterId:           '',
  crewMemberIds:          [],
  departureLandingSiteId: '',
  arrivalLandingSiteId:   '',
  operationIds:           [],
  estimatedRouteLengthKm: '' as unknown as number,
  actualDeparture:        '',
  actualArrival:          '',
};

/* ── Props ──────────────────────────────────────────────────────────────── */
export interface FlightOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (order: FlightOrderData) => void;
  order: FlightOrderData | null;
  saving?: boolean;
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function FlightOrderModal({
  open,
  onClose,
  onSave,
  order,
  saving = false,
}: FlightOrderModalProps) {
  const isEdit = Boolean(order);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FlightOrderFormValues>({
    resolver: zodResolver(flightOrderSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  /* ── Helicopter list from API ── */
  const [helicopters, setHelicopters] = useState<HelicopterResponse[]>([]);
  const [helicoptersLoading, setHelicoptersLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setHelicoptersLoading(true);
    getHelicopters()
      .then(setHelicopters)
      .catch(() => setHelicopters([]))
      .finally(() => setHelicoptersLoading(false));
  }, [open]);

  /* ── All crew members from API (pilots derived below) ── */
  const [allCrewMembers, setAllCrewMembers] = useState<CrewMemberResponse[]>([]);
  const [crewMembersLoading, setCrewMembersLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCrewMembersLoading(true);
    getCrewMembers()
      .then(setAllCrewMembers)
      .catch(() => setAllCrewMembers([]))
      .finally(() => setCrewMembersLoading(false));
  }, [open]);

  const pilots = useMemo(
    () => allCrewMembers.filter((m) => m.role === 'PILOT'),
    [allCrewMembers],
  );

  /* ── Landing sites from API ── */
  const [landingSites, setLandingSites] = useState<LandingSiteResponse[]>([]);
  const [landingSitesLoading, setLandingSitesLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLandingSitesLoading(true);
    getLandingSites()
      .then(setLandingSites)
      .catch(() => setLandingSites([]))
      .finally(() => setLandingSitesLoading(false));
  }, [open]);

  /* ── Operations from API ── */
  const [operations, setOperations] = useState<OperationListResponse[]>([]);
  const [operationsLoading, setOperationsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOperationsLoading(true);
    getOperations()
      .then(setOperations)
      .catch(() => setOperations([]))
      .finally(() => setOperationsLoading(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      reset(
        order
          ? {
              plannedDeparture:       order.plannedDeparture,
              plannedArrival:         order.plannedArrival,
              pilotId:                order.pilotId,
              status:                 order.status,
              helicopterId:           order.helicopterId,
              crewMemberIds:          order.crewMemberIds,
              departureLandingSiteId: order.departureLandingSiteId,
              arrivalLandingSiteId:   order.arrivalLandingSiteId,
              operationIds:           order.operationIds,
              estimatedRouteLengthKm: order.estimatedRouteLengthKm,
              actualDeparture:        order.actualDeparture ?? '',
              actualArrival:          order.actualArrival ?? '',
            }
          : EMPTY_DEFAULTS,
      );
    }
  }, [order, open, reset]);

  /* Crew weight — auto-calculated */
  const watchedPilotId              = useWatch({ control, name: 'pilotId' });
  const watchedCrewMemberIds        = useWatch({ control, name: 'crewMemberIds' });
  const watchedStatus               = useWatch({ control, name: 'status' });
  const watchedDepartureSiteId      = useWatch({ control, name: 'departureLandingSiteId' });
  const watchedArrivalSiteId        = useWatch({ control, name: 'arrivalLandingSiteId' });

  const crewWeightKg = useMemo(() => {
    const pilot      = pilots.find((m) => m.id === watchedPilotId);
    const pilotKg    = pilot?.weightKg ?? 0;
    const crewKg     = allCrewMembers
      .filter((m) => (watchedCrewMemberIds ?? []).includes(m.id))
      .reduce((sum, m) => sum + m.weightKg, 0);
    return pilotKg + crewKg;
  }, [watchedPilotId, watchedCrewMemberIds, pilots, allCrewMembers]);

  const requiresActualTimes =
    watchedStatus === 'PARTIALLY_COMPLETED' || watchedStatus === 'COMPLETED';

  /* ── Live flight-rule warnings (mirrors backend 5 rules) ── */
  const watchedHelicopterId = useWatch({ control, name: 'helicopterId' });
  const watchedDeparture    = useWatch({ control, name: 'plannedDeparture' });
  const watchedRouteKm      = useWatch({ control, name: 'estimatedRouteLengthKm' });

  const flightWarnings = useMemo(() => {
    const warnings: string[] = [];
    const selectedHeli = helicopters.find(h => h.id === watchedHelicopterId);
    const selectedPilot = allCrewMembers.find(m => m.id === watchedPilotId);
    const flightDate = watchedDeparture ? watchedDeparture.split('T')[0] : null;

    if (!flightDate || !selectedHeli) return warnings;

    // Rule 1: Helicopter inspection
    if (selectedHeli.inspectionExpiryDate && selectedHeli.inspectionExpiryDate < flightDate) {
      warnings.push(`Przegląd helikoptera wygasa przed datą lotu (${selectedHeli.inspectionExpiryDate})`);
    }

    // Rule 2: Pilot license
    if (selectedPilot?.licenseExpiryDate && selectedPilot.licenseExpiryDate < flightDate) {
      warnings.push(`Licencja pilota wygasa przed datą lotu (${selectedPilot.licenseExpiryDate})`);
    }

    // Rule 3: Training — pilot + crew
    if (selectedPilot?.trainingExpiryDate && selectedPilot.trainingExpiryDate < flightDate) {
      warnings.push(`Szkolenie ${selectedPilot.firstName} ${selectedPilot.lastName} wygasa przed datą lotu`);
    }
    for (const memberId of (watchedCrewMemberIds ?? [])) {
      const member = allCrewMembers.find(m => m.id === memberId);
      if (member?.trainingExpiryDate && member.trainingExpiryDate < flightDate) {
        warnings.push(`Szkolenie ${member.firstName} ${member.lastName} wygasa przed datą lotu`);
      }
    }

    // Rule 4: Crew weight
    if (selectedHeli.maxCrewWeightKg && crewWeightKg > selectedHeli.maxCrewWeightKg) {
      warnings.push(`Waga załogi (${crewWeightKg} kg) przekracza udźwig helikoptera (${selectedHeli.maxCrewWeightKg} kg)`);
    }

    // Rule 5: Route vs range
    const routeKm = Number(watchedRouteKm) || 0;
    if (selectedHeli.rangeKm && routeKm > selectedHeli.rangeKm) {
      warnings.push(`Szacowana trasa (${routeKm} km) przekracza zasięg helikoptera (${selectedHeli.rangeKm} km)`);
    }

    return warnings;
  }, [watchedHelicopterId, watchedPilotId, watchedCrewMemberIds, watchedDeparture, watchedRouteKm, crewWeightKg, helicopters, allCrewMembers]);

  const onSubmit = (values: FlightOrderFormValues) => {
    onSave({
      id:                     order?.id,
      plannedDeparture:       values.plannedDeparture,
      plannedArrival:         values.plannedArrival,
      pilotId:                values.pilotId,
      status:                 values.status,
      helicopterId:           values.helicopterId,
      crewMemberIds:          values.crewMemberIds,
      departureLandingSiteId: values.departureLandingSiteId,
      arrivalLandingSiteId:   values.arrivalLandingSiteId,
      operationIds:           values.operationIds,
      estimatedRouteLengthKm: values.estimatedRouteLengthKm,
      actualDeparture:        values.actualDeparture || undefined,
      actualArrival:          values.actualArrival   || undefined,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 600,
          maxHeight: '90vh',
          ...GLASS_CARD,
          bgcolor: aeroColors.surfaceContainer,
          overflow: 'hidden',
          m: 2,
        },
      }}
      slotProps={{
        backdrop: {
          sx: { bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' },
        },
      }}
    >
      {/* ── Hero header ── */}
      <Box
        sx={{
          height: 148,
          background: `linear-gradient(135deg, ${aeroColors.surfaceContainerHigh} 0%, ${aeroColors.surfaceContainerHighest} 55%, ${aeroColors.tertiaryContainer}80 100%)`,
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 90%, ${aeroColors.tertiary}1c 0%, transparent 65%)`,
          },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            color: aeroColors.onSurface,
            bgcolor: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' },
            width: 30,
            height: 30,
          }}
        >
          <CloseOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: `${aeroColors.tertiary}14`,
              border: `1.5px solid ${aeroColors.tertiary}35`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.25,
            }}
          >
            <FlightTakeoffIcon sx={{ fontSize: 24, color: aeroColors.tertiary }} />
          </Box>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: '1.125rem',
              color: aeroColors.onSurface,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {isEdit ? 'Edycja zlecenia na lot' : 'Nowe zlecenie na lot'}
          </Typography>
          <Typography sx={{ ...SECTION_LABEL_SX, fontSize: '0.5625rem', mt: 0.25 }}>
            {isEdit ? 'Aktualizacja danych zlecenia' : 'Nr zlecenia nadany automatycznie'}
          </Typography>
        </Box>
      </Box>

      {/* ── Form ── */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.75,
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 148px)',
        }}
      >

        {/* ─── Identyfikacja ─────────────────────────────────────────────── */}
        <SectionDivider label="Identyfikacja" />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {/* Nr zlecenia — read-only autonumber */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Nr zlecenia</Typography>
            <TextField
              size="small"
              fullWidth
              value={isEdit ? order?.id ?? 'Autonumer' : 'Autonumer'}
              disabled
              sx={{
                ...INPUT_SX,
                '& .MuiOutlinedInput-root.Mui-disabled': {
                  bgcolor: `${aeroColors.surfaceContainerLowest}60`,
                },
                '& .MuiOutlinedInput-input.Mui-disabled': {
                  WebkitTextFillColor: `${aeroColors.outline}70`,
                  fontStyle: 'italic',
                  fontSize: '0.75rem',
                },
              }}
            />
          </Box>

          {/* Status */}
          <Box sx={{ flex: 1.5 }}>
            <Typography sx={FIELD_LABEL_SX}>Status</Typography>
            <Controller
              name="status"
              control={control}
              render={({ field }) => {
                const cfg = ORDER_STATUS_OPTIONS.find((o) => o.value === field.value);
                return (
                  <TextField
                    {...field}
                    size="small"
                    fullWidth
                    select
                    error={!!errors.status}
                    helperText={errors.status?.message}
                    sx={{
                      ...INPUT_SX,
                      '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 },
                    }}
                    SelectProps={{
                      renderValue: () => (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: cfg?.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            component="span"
                            sx={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: cfg?.color,
                            }}
                          >
                            {cfg?.label}
                          </Typography>
                        </Box>
                      ),
                    }}
                  >
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: opt.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: opt.color }}>
                            {opt.label}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }}
            />
          </Box>
        </Box>

        {/* Helikopter */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Helikopter</Typography>
          <Controller
            name="helicopterId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                select
                disabled={helicoptersLoading}
                error={!!errors.helicopterId}
                helperText={errors.helicopterId?.message}
                sx={INPUT_SX}
                InputProps={helicoptersLoading ? {
                  endAdornment: (
                    <CircularProgress
                      size={14}
                      sx={{ color: aeroColors.outline, mr: 1, flexShrink: 0 }}
                    />
                  ),
                } : undefined}
              >
                {helicoptersLoading && (
                  <MenuItem disabled value="">
                    <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, fontStyle: 'italic' }}>
                      Ładowanie...
                    </Typography>
                  </MenuItem>
                )}
                {!helicoptersLoading && helicopters.length === 0 && (
                  <MenuItem disabled value="">
                    <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, fontStyle: 'italic' }}>
                      Brak dostępnych helikopterów
                    </Typography>
                  </MenuItem>
                )}
                {helicopters.map((h) => (
                  <MenuItem key={h.id} value={h.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Typography
                        sx={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: aeroColors.tertiary,
                          fontFamily: '"Space Grotesk", monospace',
                          letterSpacing: '0.1em',
                          minWidth: 54,
                        }}
                      >
                        {h.registrationNumber}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurfaceVariant }}>
                        {h.type}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>

        {/* ─── Planowane czasy ───────────────────────────────────────────── */}
        <SectionDivider label="Planowane czasy lotu" />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Planowany start</Typography>
            <Controller
              control={control}
              name="plannedDeparture"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(v) => field.onChange(v ? v.format('YYYY-MM-DDTHH:mm:ss') : '')}
                  ampm={false}
                  format="DD.MM.YYYY HH:mm"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!errors.plannedDeparture,
                      helperText: errors.plannedDeparture?.message,
                      sx: DATETIME_SX,
                    },
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Planowane lądowanie</Typography>
            <Controller
              control={control}
              name="plannedArrival"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(v) => field.onChange(v ? v.format('YYYY-MM-DDTHH:mm:ss') : '')}
                  ampm={false}
                  format="DD.MM.YYYY HH:mm"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!errors.plannedArrival,
                      helperText: errors.plannedArrival?.message,
                      sx: DATETIME_SX,
                    },
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* ─── Załoga ────────────────────────────────────────────────────── */}
        <SectionDivider label="Załoga" />

        {/* Pilot */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Pilot</Typography>
          <Controller
            name="pilotId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                select
                disabled={crewMembersLoading}
                error={!!errors.pilotId}
                helperText={errors.pilotId?.message}
                sx={INPUT_SX}
                InputProps={crewMembersLoading ? {
                  endAdornment: (
                    <CircularProgress
                      size={14}
                      sx={{ color: aeroColors.outline, mr: 1, flexShrink: 0 }}
                    />
                  ),
                } : undefined}
              >
                {crewMembersLoading && (
                  <MenuItem disabled value="">
                    <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, fontStyle: 'italic' }}>
                      Ładowanie...
                    </Typography>
                  </MenuItem>
                )}
                {!crewMembersLoading && pilots.length === 0 && (
                  <MenuItem disabled value="">
                    <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, fontStyle: 'italic' }}>
                      Brak dostępnych pilotów
                    </Typography>
                  </MenuItem>
                )}
                {pilots.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurface }}>
                      {p.firstName} {p.lastName}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>

        {/* Członkowie załogi — multi-select */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Członkowie załogi</Typography>
          <Controller
            name="crewMemberIds"
            control={control}
            render={({ field }) => {
              const selected = allCrewMembers.filter((m) =>
                (field.value ?? []).includes(m.id),
              );
              return (
                <Autocomplete
                  multiple
                  options={allCrewMembers.filter((m) => m.id !== watchedPilotId)}
                  loading={crewMembersLoading}
                  loadingText="Ładowanie członków załogi..."
                  noOptionsText="Brak dostępnych członków załogi"
                  getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName}`}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  value={selected}
                  onChange={(_, newValue) => field.onChange(newValue.map((m) => m.id))}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          {...tagProps}
                          label={`${option.firstName} ${option.lastName}`}
                          size="small"
                          sx={{
                            bgcolor: `${aeroColors.tertiary}14`,
                            color: aeroColors.tertiary,
                            border: `1px solid ${aeroColors.tertiary}28`,
                            fontSize: '0.5625rem',
                            fontWeight: 700,
                            height: 20,
                            letterSpacing: '0.04em',
                            '& .MuiChip-deleteIcon': {
                              color: `${aeroColors.tertiary}70`,
                              fontSize: 13,
                              '&:hover': { color: aeroColors.tertiary },
                            },
                          }}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder={selected.length === 0 ? 'Wybierz członków załogi...' : ''}
                      sx={INPUT_SX}
                    />
                  )}
                  sx={AUTOCOMPLETE_SX}
                />
              );
            }}
          />
        </Box>

        {/* Waga załogi — auto-calculated, read-only */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Łączna waga załogi (kg)</Typography>
          <TextField
            size="small"
            fullWidth
            value={crewWeightKg > 0 ? `${crewWeightKg} kg` : '— wybierz pilota'}
            disabled
            sx={{
              ...INPUT_SX,
              '& .MuiOutlinedInput-root.Mui-disabled': {
                bgcolor: crewWeightKg > 0
                  ? `${aeroColors.tertiary}08`
                  : `${aeroColors.surfaceContainerLowest}60`,
                border: crewWeightKg > 0
                  ? `1px solid ${aeroColors.tertiary}20`
                  : undefined,
              },
              '& .MuiOutlinedInput-input.Mui-disabled': {
                WebkitTextFillColor: crewWeightKg > 0
                  ? aeroColors.tertiary
                  : `${aeroColors.outline}60`,
                fontWeight: crewWeightKg > 0 ? 700 : 400,
                fontStyle:  crewWeightKg > 0 ? 'normal' : 'italic',
                fontSize: '0.8125rem',
                letterSpacing: crewWeightKg > 0 ? '0.04em' : 'normal',
              },
            }}
          />
        </Box>

        {/* ─── Lądowiska ─────────────────────────────────────────────────── */}
        <SectionDivider label="Lądowiska" />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Lądowisko startowe</Typography>
            <Controller
              name="departureLandingSiteId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  select
                  disabled={landingSitesLoading}
                  error={!!errors.departureLandingSiteId}
                  helperText={errors.departureLandingSiteId?.message}
                  sx={INPUT_SX}
                  InputProps={landingSitesLoading ? {
                    endAdornment: (
                      <CircularProgress size={14} sx={{ color: aeroColors.outline, mr: 1, flexShrink: 0 }} />
                    ),
                  } : undefined}
                >
                  {landingSitesLoading && (
                    <MenuItem disabled value="">
                      <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, fontStyle: 'italic' }}>Ładowanie...</Typography>
                    </MenuItem>
                  )}
                  {!landingSitesLoading && landingSites.length === 0 && (
                    <MenuItem disabled value="">
                      <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, fontStyle: 'italic' }}>Brak lądowisk</Typography>
                    </MenuItem>
                  )}
                  {landingSites
                    .filter((ls) => ls.id !== watchedArrivalSiteId)
                    .map((ls) => (
                      <MenuItem key={ls.id} value={ls.id}>
                        <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurface }}>{ls.name}</Typography>
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Lądowisko końcowe</Typography>
            <Controller
              name="arrivalLandingSiteId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  select
                  disabled={landingSitesLoading}
                  error={!!errors.arrivalLandingSiteId}
                  helperText={errors.arrivalLandingSiteId?.message}
                  sx={INPUT_SX}
                  InputProps={landingSitesLoading ? {
                    endAdornment: (
                      <CircularProgress size={14} sx={{ color: aeroColors.outline, mr: 1, flexShrink: 0 }} />
                    ),
                  } : undefined}
                >
                  {landingSitesLoading && (
                    <MenuItem disabled value="">
                      <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, fontStyle: 'italic' }}>Ładowanie...</Typography>
                    </MenuItem>
                  )}
                  {!landingSitesLoading && landingSites.length === 0 && (
                    <MenuItem disabled value="">
                      <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, fontStyle: 'italic' }}>Brak lądowisk</Typography>
                    </MenuItem>
                  )}
                  {landingSites
                    .filter((ls) => ls.id !== watchedDepartureSiteId)
                    .map((ls) => (
                      <MenuItem key={ls.id} value={ls.id}>
                        <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurface }}>{ls.name}</Typography>
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
          </Box>
        </Box>

        {/* ─── Planowane operacje ─────────────────────────────────────────── */}
        <SectionDivider label="Planowane operacje" />

        <Box>
          <Typography sx={FIELD_LABEL_SX}>Wybrane planowane operacje</Typography>
          <Controller
            name="operationIds"
            control={control}
            render={({ field }) => {
              const selectedOps = operations.filter((o) =>
                (field.value ?? []).includes(o.id),
              );
              return (
                <Autocomplete
                  multiple
                  options={operations}
                  loading={operationsLoading}
                  loadingText="Ładowanie operacji..."
                  noOptionsText="Brak dostępnych operacji"
                  getOptionLabel={(opt) => opt.orderNumber}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  value={selectedOps}
                  onChange={(_, newValue) => field.onChange(newValue.map((o) => o.id))}
                  renderOption={(props, option) => {
                    const { key, ...optProps } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>;
                    const dateLabel = option.proposedDateEarliest ?? option.plannedDateEarliest ?? null;
                    return (
                      <Box component="li" key={key} {...optProps} sx={{ py: '6px !important' }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurface, lineHeight: 1.3 }}>
                            {option.orderNumber}
                            {option.activityTypes.length > 0 && (
                              <Box component="span" sx={{ color: aeroColors.onSurfaceVariant, ml: 0.75 }}>
                                — {option.activityTypes.join(', ')}
                              </Box>
                            )}
                          </Typography>
                          {dateLabel && (
                            <Typography sx={{ fontSize: '0.5625rem', color: aeroColors.outline, letterSpacing: '0.08em', mt: 0.25, fontFamily: '"Inter", monospace' }}>
                              {dateLabel}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          {...tagProps}
                          label={option.orderNumber}
                          size="small"
                          sx={{
                            bgcolor: `${aeroColors.primary}14`,
                            color: aeroColors.primary,
                            border: `1px solid ${aeroColors.primary}28`,
                            fontSize: '0.5625rem',
                            fontWeight: 700,
                            height: 20,
                            letterSpacing: '0.04em',
                            '& .MuiChip-deleteIcon': {
                              color: `${aeroColors.primary}70`,
                              fontSize: 13,
                              '&:hover': { color: aeroColors.primary },
                            },
                          }}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder={selectedOps.length === 0 ? 'Wybierz operacje lotnicze...' : ''}
                      error={!!errors.operationIds}
                      helperText={errors.operationIds?.message}
                      sx={INPUT_SX}
                    />
                  )}
                  sx={AUTOCOMPLETE_SX}
                />
              );
            }}
          />
        </Box>

        {/* Szacowana długość trasy */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Szacowana długość trasy (km)</Typography>
          <TextField
            size="small"
            fullWidth
            type="number"
            placeholder="np. 350"
            error={!!errors.estimatedRouteLengthKm}
            helperText={errors.estimatedRouteLengthKm?.message}
            inputProps={{ min: 1, step: 1 }}
            sx={INPUT_SX}
            {...register('estimatedRouteLengthKm')}
          />
        </Box>

        {/* ─── Realizacja ────────────────────────────────────────────────── */}
        <SectionDivider label="Realizacja" />

        {requiresActualTimes && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: `${aeroColors.secondary}0a`,
              border: `1px solid ${aeroColors.secondary}20`,
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.secondary, lineHeight: 1.6 }}>
              Wybrany status wymaga podania rzeczywistych czasów startu i lądowania.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>
              Rzeczywisty start
              {requiresActualTimes && (
                <Box component="span" sx={{ color: aeroColors.secondary, ml: 0.5 }}>*</Box>
              )}
            </Typography>
            <Controller
              control={control}
              name="actualDeparture"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(v) => field.onChange(v ? v.format('YYYY-MM-DDTHH:mm:ss') : '')}
                  ampm={false}
                  format="DD.MM.YYYY HH:mm"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!errors.actualDeparture,
                      helperText: errors.actualDeparture?.message,
                      sx: DATETIME_SX,
                    },
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>
              Rzeczywiste lądowanie
              {requiresActualTimes && (
                <Box component="span" sx={{ color: aeroColors.secondary, ml: 0.5 }}>*</Box>
              )}
            </Typography>
            <Controller
              control={control}
              name="actualArrival"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(v) => field.onChange(v ? v.format('YYYY-MM-DDTHH:mm:ss') : '')}
                  ampm={false}
                  format="DD.MM.YYYY HH:mm"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!errors.actualArrival,
                      helperText: errors.actualArrival?.message,
                      sx: DATETIME_SX,
                    },
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Info note */}
        <Box
          sx={{
            mt: 0.25,
            p: 2,
            borderRadius: 1.5,
            bgcolor: `${aeroColors.outlineVariant}12`,
            border: `1px solid ${aeroColors.outlineVariant}20`,
          }}
        >
          <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, lineHeight: 1.6 }}>
            Numer zlecenia zostanie nadany automatycznie po zapisaniu. Waga załogi jest
            obliczana na bieżąco na podstawie pilota i wybranych członków.
          </Typography>
        </Box>

        {/* ── Flight-rule warnings ── */}
        {flightWarnings.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: `${aeroColors.error}12`,
              border: `1px solid ${aeroColors.error}40`,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: aeroColors.error,
                mb: 0.75,
              }}
            >
              Ostrzeżenia walidacji
            </Typography>
            {flightWarnings.map((w, i) => (
              <Typography
                key={i}
                sx={{
                  fontSize: '0.75rem',
                  color: aeroColors.error,
                  lineHeight: 1.6,
                  '&::before': { content: '"⚠ "' },
                }}
              >
                {w}
              </Typography>
            ))}
          </Box>
        )}

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.25 }}>
          <Button
            fullWidth
            variant="outlined"
            type="button"
            disabled={saving}
            onClick={onClose}
            sx={{
              color: aeroColors.outline,
              borderColor: `${aeroColors.outlineVariant}40`,
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              py: 1.25,
              borderRadius: 1,
              '&:hover': {
                borderColor: aeroColors.outline,
                bgcolor: `${aeroColors.outline}08`,
              },
            }}
          >
            Anuluj
          </Button>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : undefined}
            sx={{
              background: `linear-gradient(135deg, ${aeroColors.tertiary} 0%, ${aeroColors.onTertiaryContainer} 100%)`,
              color: aeroColors.onTertiary,
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              py: 1.25,
              borderRadius: 1,
              boxShadow: `0 4px 20px ${aeroColors.tertiary}25`,
              '&:hover': {
                background: `linear-gradient(135deg, ${aeroColors.tertiary} 0%, ${aeroColors.onTertiaryContainer} 100%)`,
                opacity: 0.9,
              },
            }}
          >
            {saving ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Utwórz zlecenie'}
          </Button>
        </Box>

        <Box sx={{ pb: 0.5 }} />
      </Box>
    </Dialog>
  );
}
