import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Autocomplete,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';

import { aeroColors } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import MapView from '../../components/MapView';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  getOperationById,
  createOperation,
  updateOperation,
  changeOperationStatus,
  addOperationComment,
  uploadKml,
} from '../../api/operations.api';
import { getActivityTypes } from '../../api/dictionaries.api';
import type {
  OperationResponse,
  OperationStatus,
  ActivityType,
  DictionaryEntry,
  OperationComment,
  OperationChangeHistory,
} from '../../api/types';

/* ══════════════════════════════════════════════════════════════════════════
 * Constants
 * ══════════════════════════════════════════════════════════════════════════ */

const TERMINAL_STATUSES: OperationStatus[] = [
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
];

const STATUS_CONFIG: Record<
  OperationStatus,
  { label: string; color: string }
> = {
  SUBMITTED: { label: 'Wprowadzone', color: aeroColors.primary },
  REJECTED: { label: 'Odrzucone', color: aeroColors.error },
  CONFIRMED: { label: 'Potwierdzone do planu', color: aeroColors.tertiary },
  SCHEDULED: { label: 'Zaplanowane do zlecenia', color: '#4caf50' },
  PARTIALLY_COMPLETED: {
    label: 'Czesciowo zrealizowane',
    color: aeroColors.secondary,
  },
  COMPLETED: { label: 'Zrealizowane', color: '#4caf50' },
  CANCELLED: { label: 'Rezygnacja', color: aeroColors.onSurfaceVariant },
};

/* ══════════════════════════════════════════════════════════════════════════
 * Design tokens (matching existing codebase style)
 * ══════════════════════════════════════════════════════════════════════════ */

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

const CHAR_COUNTER_SX = {
  fontSize: '0.5625rem',
  color: aeroColors.outline,
  textAlign: 'right' as const,
  mt: 0.5,
  letterSpacing: '0.04em',
};

const DATE_INPUT_SX = {
  ...INPUT_SX,
  '& input::-webkit-calendar-picker-indicator': {
    filter: 'invert(0.6)',
    cursor: 'pointer',
  },
  '& input[type="date"]': { colorScheme: 'dark' },
} as const;

const TH_SX = {
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: aeroColors.outline,
  borderBottom: `1px solid ${aeroColors.outlineVariant}30`,
  py: 1,
  px: 1.5,
};

const TD_SX = {
  fontSize: '0.75rem',
  color: aeroColors.onSurfaceVariant,
  borderBottom: `1px solid ${aeroColors.outlineVariant}15`,
  py: 1,
  px: 1.5,
};

/* ══════════════════════════════════════════════════════════════════════════
 * Helpers
 * ══════════════════════════════════════════════════════════════════════════ */

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

function StatusChip({ status }: { status: OperationStatus }) {
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

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ══════════════════════════════════════════════════════════════════════════
 * Zod schema
 * ══════════════════════════════════════════════════════════════════════════ */

const operationSchema = z.object({
  orderNumber: z
    .string()
    .min(1, 'Pole wymagane')
    .max(30, 'Maks. 30 znakow'),
  shortDescription: z
    .string()
    .min(1, 'Pole wymagane')
    .max(100, 'Maks. 100 znakow'),
  proposedDateEarliest: z.string().optional(),
  proposedDateLatest: z.string().optional(),
  plannedDateEarliest: z.string().optional(),
  plannedDateLatest: z.string().optional(),
  additionalInfo: z.string().max(500, 'Maks. 500 znakow').optional(),
  postCompletionNotes: z.string().max(500, 'Maks. 500 znakow').optional(),
  activityTypes: z.array(z.string()),
  contacts: z.array(z.string()).optional(),
});

type OperationFormValues = z.infer<typeof operationSchema>;

/* ══════════════════════════════════════════════════════════════════════════
 * Component
 * ══════════════════════════════════════════════════════════════════════════ */

export default function OperationFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const isEdit = Boolean(id);
  const userRole = user?.role ?? 'PLANNER';

  /* ── Data state ──────────────────────────────────────────────────────── */
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [operation, setOperation] = useState<OperationResponse | null>(null);
  const [activityOptions, setActivityOptions] = useState<DictionaryEntry[]>(
    [],
  );

  /* ── KML state ───────────────────────────────────────────────────────── */
  const [kmlFile, setKmlFile] = useState<File | null>(null);
  const [kmlFileError, setKmlFileError] = useState('');
  const [kmlUploading, setKmlUploading] = useState(false);
  const [kmlPoints, setKmlPoints] = useState<number[][] | null>(null);
  const [kmlFilePath, setKmlFilePath] = useState<string | null>(null);
  const [routeLengthKm, setRouteLengthKm] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Comment state ───────────────────────────────────────────────────── */
  const [comments, setComments] = useState<OperationComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  /* ── Confirm dialog state ────────────────────────────────────────────── */
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

  /* ── Form ────────────────────────────────────────────────────────────── */
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<OperationFormValues>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      orderNumber: '',
      shortDescription: '',
      proposedDateEarliest: '',
      proposedDateLatest: '',
      plannedDateEarliest: '',
      plannedDateLatest: '',
      additionalInfo: '',
      postCompletionNotes: '',
      activityTypes: [],
      contacts: [],
    },
  });

  useUnsavedChanges(isDirty);

  /* ── Derived state ───────────────────────────────────────────────────── */
  const currentStatus = operation?.status ?? 'SUBMITTED';
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);

  const isFormReadOnly = isTerminal;

  const canEditPlannedDates = userRole !== 'PLANNER';
  const canEditPostCompletionNotes = userRole !== 'PLANNER';

  /* ── Status action visibility ────────────────────────────────────────── */
  const canConfirm =
    isEdit && userRole === 'SUPERVISOR' && currentStatus === 'SUBMITTED';
  const canReject =
    isEdit && userRole === 'SUPERVISOR' && currentStatus === 'SUBMITTED';
  const canCancel =
    isEdit &&
    userRole === 'PLANNER' &&
    ['SUBMITTED', 'CONFIRMED', 'SCHEDULED'].includes(currentStatus);

  /* ── Load activity types ─────────────────────────────────────────────── */
  useEffect(() => {
    getActivityTypes()
      .then(setActivityOptions)
      .catch(() => {
        /* Swallow -- global interceptor handles the notification */
      });
  }, []);

  /* ── Load operation in edit mode ─────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOperationById(id)
      .then((op) => {
        setOperation(op);
        setComments(op.comments ?? []);
        setKmlPoints(op.kmlPoints ?? null);
        setKmlFilePath(op.kmlFilePath ?? null);
        setRouteLengthKm(op.routeLengthKm ?? null);
        reset({
          orderNumber: op.orderNumber,
          shortDescription: op.shortDescription,
          proposedDateEarliest: op.proposedDateEarliest ?? '',
          proposedDateLatest: op.proposedDateLatest ?? '',
          plannedDateEarliest: op.plannedDateEarliest ?? '',
          plannedDateLatest: op.plannedDateLatest ?? '',
          additionalInfo: op.additionalInfo ?? '',
          postCompletionNotes: op.postCompletionNotes ?? '',
          activityTypes: (op.activityTypes ?? []) as string[],
          contacts: op.contacts ?? [],
        });
      })
      .catch(() => {
        navigate('/operations');
      })
      .finally(() => setLoading(false));
  }, [id, reset, navigate]);

  /* ── KML upload handler ──────────────────────────────────────────────── */
  const handleKmlUpload = useCallback(
    async (file: File) => {
      setKmlFile(file);
      setKmlFileError('');
      setKmlUploading(true);
      try {
        const result = await uploadKml(file);
        setKmlPoints(result.points);
        setKmlFilePath(result.filePath);
        setRouteLengthKm(result.routeLengthKm);
        showSuccess(
          `Plik KML przetworzony: ${result.points.length} punktow, ${result.routeLengthKm.toFixed(1)} km`,
        );
      } catch {
        setKmlFileError('Blad podczas przetwarzania pliku KML');
        setKmlFile(null);
      } finally {
        setKmlUploading(false);
      }
    },
    [showSuccess],
  );

  /* ── Save handler ────────────────────────────────────────────────────── */
  const onSubmit = useCallback(
    async (values: OperationFormValues) => {
      setSaving(true);
      try {
        const payload = {
          orderNumber: values.orderNumber,
          shortDescription: values.shortDescription,
          activityTypes: values.activityTypes as ActivityType[],
          proposedDateEarliest: values.proposedDateEarliest || undefined,
          proposedDateLatest: values.proposedDateLatest || undefined,
          additionalInfo: values.additionalInfo || undefined,
          plannedDateEarliest: values.plannedDateEarliest || undefined,
          plannedDateLatest: values.plannedDateLatest || undefined,
          contacts: values.contacts ?? [],
          postCompletionNotes: values.postCompletionNotes || undefined,
          kmlFilePath: kmlFilePath ?? undefined,
          kmlPoints: kmlPoints ?? undefined,
          routeLengthKm: routeLengthKm ?? undefined,
        };

        if (isEdit && id) {
          await updateOperation(id, payload);
          showSuccess('Operacja zaktualizowana');
        } else {
          await createOperation(payload);
          showSuccess('Operacja utworzona');
        }
        navigate('/operations');
      } catch {
        /* Global interceptor shows error notification */
      } finally {
        setSaving(false);
      }
    },
    [
      isEdit,
      id,
      kmlFilePath,
      kmlPoints,
      routeLengthKm,
      navigate,
      showSuccess,
    ],
  );

  /* ── Status change handler ───────────────────────────────────────────── */
  const handleStatusAction = useCallback(
    async (action: string) => {
      if (!id) return;
      setSaving(true);
      try {
        const updated = await changeOperationStatus(id, { action });
        setOperation(updated);
        setComments(updated.comments ?? []);
        reset({
          orderNumber: updated.orderNumber,
          shortDescription: updated.shortDescription,
          proposedDateEarliest: updated.proposedDateEarliest ?? '',
          proposedDateLatest: updated.proposedDateLatest ?? '',
          plannedDateEarliest: updated.plannedDateEarliest ?? '',
          plannedDateLatest: updated.plannedDateLatest ?? '',
          additionalInfo: updated.additionalInfo ?? '',
          postCompletionNotes: updated.postCompletionNotes ?? '',
          activityTypes: (updated.activityTypes ?? []) as string[],
          contacts: updated.contacts ?? [],
        });
        showSuccess('Status operacji zmieniony');
      } catch {
        /* Global interceptor shows error notification */
      } finally {
        setSaving(false);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      }
    },
    [id, reset, showSuccess],
  );

  /* ── Add comment handler ─────────────────────────────────────────────── */
  const handleAddComment = useCallback(async () => {
    if (!id || !newComment.trim()) return;
    setAddingComment(true);
    try {
      await addOperationComment(id, { content: newComment.trim() });
      // Refresh operation to get updated comments
      const refreshed = await getOperationById(id);
      setComments(refreshed.comments ?? []);
      setNewComment('');
      showSuccess('Komentarz dodany');
    } catch {
      /* Global interceptor shows error notification */
    } finally {
      setAddingComment(false);
    }
  }, [id, newComment, showSuccess]);

  /* ── Watched values for character counters ───────────────────────────── */
  const watchShortDesc = watch('shortDescription') ?? '';
  const watchAdditionalInfo = watch('additionalInfo') ?? '';
  const watchPostCompletionNotes = watch('postCompletionNotes') ?? '';

  /* ── Map polylines ───────────────────────────────────────────────────── */
  const mapPolylines = useMemo<number[][][]>(() => {
    if (!kmlPoints || kmlPoints.length === 0) return [];
    return [kmlPoints];
  }, [kmlPoints]);

  /* ── Activity type label mapping ─────────────────────────────────────── */
  const activityLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of activityOptions) {
      map.set(opt.value, opt.label);
    }
    return map;
  }, [activityOptions]);

  /* ── Change history ──────────────────────────────────────────────────── */
  const changeHistory: OperationChangeHistory[] =
    operation?.changeHistory ?? [];

  /* ══════════════════════════════════════════════════════════════════════
   * Loading state
   * ══════════════════════════════════════════════════════════════════════ */

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
        <CircularProgress
          size={48}
          sx={{ color: aeroColors.primary }}
        />
      </Box>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
   * Render
   * ══════════════════════════════════════════════════════════════════════ */

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 3, px: 2 }}>
      {/* ── Back button + header ───────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Powrot do listy operacji">
          <IconButton
            onClick={() => navigate('/operations')}
            sx={{
              color: aeroColors.onSurfaceVariant,
              bgcolor: `${aeroColors.outlineVariant}15`,
              '&:hover': { bgcolor: `${aeroColors.outlineVariant}25` },
            }}
            aria-label="Powrot do listy operacji"
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
            {isEdit ? 'Edycja operacji lotniczej' : 'Nowa operacja lotnicza'}
          </Typography>
          {isEdit && operation && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: aeroColors.outline,
                mt: 0.25,
              }}
            >
              ID: {operation.id}
            </Typography>
          )}
        </Box>
        {isEdit && (
          <Box sx={{ ml: 'auto' }}>
            <StatusChip status={currentStatus} />
          </Box>
        )}
      </Box>

      {/* ── Status action buttons ──────────────────────────────────────── */}
      {isEdit && (canConfirm || canReject || canCancel) && (
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

          {canReject && (
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={saving}
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  title: 'Odrzucenie operacji',
                  message:
                    'Czy na pewno chcesz odrzucic te operacje? Ta akcja jest nieodwracalna.',
                  action: 'REJECT',
                  color: 'error',
                })
              }
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: '0.625rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Odrzuc
            </Button>
          )}

          {canConfirm && (
            <Button
              variant="contained"
              size="small"
              disabled={saving}
              onClick={() => handleStatusAction('CONFIRM')}
              sx={{
                bgcolor: '#4caf50',
                color: '#fff',
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: '0.625rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': { bgcolor: '#43a047' },
              }}
            >
              Potwierdz do planu
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outlined"
              size="small"
              disabled={saving}
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  title: 'Rezygnacja z operacji',
                  message:
                    'Czy na pewno chcesz zrezygnowac z tej operacji?',
                  action: 'CANCEL',
                  color: 'warning',
                })
              }
              sx={{
                color: aeroColors.onSurfaceVariant,
                borderColor: `${aeroColors.outlineVariant}50`,
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: '0.625rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': {
                  borderColor: aeroColors.outline,
                  bgcolor: `${aeroColors.outline}08`,
                },
              }}
            >
              Rezygnuj
            </Button>
          )}
        </Box>
      )}

      {/* ── Main form ──────────────────────────────────────────────────── */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Box sx={{ ...GLASS_CARD, p: 3, mb: 3 }}>
          {/* ─── Identyfikacja ─────────────────────────────────────────── */}
          <SectionDivider label="Identyfikacja" />

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Nr zlecenia/projektu
                <Box
                  component="span"
                  sx={{ color: aeroColors.secondary, ml: 0.5 }}
                >
                  *
                </Box>
              </Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="np. DE-25-12020"
                disabled={isFormReadOnly}
                error={!!errors.orderNumber}
                helperText={errors.orderNumber?.message}
                sx={isFormReadOnly ? DISABLED_INPUT_SX : INPUT_SX}
                {...register('orderNumber')}
              />
            </Box>

            {isEdit && (
              <Box sx={{ flex: 1 }}>
                <Typography sx={FIELD_LABEL_SX}>
                  Osoba wprowadzajaca
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={operation?.createdByEmail ?? '---'}
                  disabled
                  sx={DISABLED_INPUT_SX}
                />
              </Box>
            )}
          </Box>

          {/* ─── Opis ──────────────────────────────────────────────────── */}
          <Box sx={{ mt: 2 }}>
            <SectionDivider label="Opis operacji" />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                mb: 0.75,
              }}
            >
              <Typography sx={FIELD_LABEL_SX}>
                Opis skrocony
                <Box
                  component="span"
                  sx={{ color: aeroColors.secondary, ml: 0.5 }}
                >
                  *
                </Box>
              </Typography>
              <Typography sx={CHAR_COUNTER_SX}>
                {watchShortDesc.length}/100
              </Typography>
            </Box>
            <TextField
              size="small"
              fullWidth
              placeholder="Krotki opis celu operacji"
              disabled={isFormReadOnly}
              error={!!errors.shortDescription}
              helperText={errors.shortDescription?.message}
              sx={isFormReadOnly ? DISABLED_INPUT_SX : INPUT_SX}
              {...register('shortDescription')}
            />
          </Box>

          {/* ─── Rodzaj czynnosci ──────────────────────────────────────── */}
          <Box sx={{ mt: 2 }}>
            <Typography sx={FIELD_LABEL_SX}>Rodzaj czynnosci</Typography>
            <Controller
              name="activityTypes"
              control={control}
              render={({ field }) => {
                const selected = (field.value ?? []) as string[];
                return (
                  <Autocomplete
                    multiple
                    disabled={isFormReadOnly}
                    options={activityOptions.map((o) => o.value)}
                    getOptionLabel={(opt) =>
                      activityLabelMap.get(opt) ?? opt
                    }
                    isOptionEqualToValue={(opt, val) => opt === val}
                    value={selected}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({
                          index,
                        });
                        return (
                          <Chip
                            key={key}
                            {...tagProps}
                            label={activityLabelMap.get(option) ?? option}
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
                                '&:hover': {
                                  color: aeroColors.primary,
                                },
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
                        placeholder={
                          selected.length === 0
                            ? 'Wybierz rodzaje czynnosci...'
                            : ''
                        }
                        error={!!errors.activityTypes}
                        helperText={errors.activityTypes?.message}
                        sx={INPUT_SX}
                      />
                    )}
                    sx={AUTOCOMPLETE_SX}
                  />
                );
              }}
            />
          </Box>

          {/* ─── Dodatkowe informacje ──────────────────────────────────── */}
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                mb: 0.75,
              }}
            >
              <Typography sx={FIELD_LABEL_SX}>
                Dodatkowe informacje
              </Typography>
              <Typography sx={CHAR_COUNTER_SX}>
                {watchAdditionalInfo.length}/500
              </Typography>
            </Box>
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder="Informacje o terminie, priorytecie lub inne uwagi..."
              disabled={isFormReadOnly}
              error={!!errors.additionalInfo}
              helperText={errors.additionalInfo?.message}
              sx={isFormReadOnly ? DISABLED_INPUT_SX : INPUT_SX}
              {...register('additionalInfo')}
            />
          </Box>

          {/* ─── Trasa KML ─────────────────────────────────────────────── */}
          <Box sx={{ mt: 2 }}>
            <SectionDivider label="Trasa KML" />
          </Box>

          {!isFormReadOnly && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Zbior punktow / slad trasy
              </Typography>

              <input
                ref={fileInputRef}
                type="file"
                accept=".kml"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) handleKmlUpload(file);
                }}
              />

              <Box
                onClick={() =>
                  !kmlUploading && fileInputRef.current?.click()
                }
                role="button"
                tabIndex={0}
                aria-label="Wgraj plik KML"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  bgcolor: kmlFileError
                    ? `${aeroColors.secondary}08`
                    : kmlFile
                      ? `${aeroColors.primary}08`
                      : aeroColors.surfaceContainerLowest,
                  border: `1px dashed ${
                    kmlFileError
                      ? `${aeroColors.secondary}80`
                      : kmlFile
                        ? `${aeroColors.primary}40`
                        : `${aeroColors.outlineVariant}40`
                  }`,
                  borderRadius: 1.5,
                  cursor: kmlUploading ? 'wait' : 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: `${aeroColors.primary}0a`,
                    borderColor: `${aeroColors.primary}35`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: kmlFile
                      ? `${aeroColors.primary}18`
                      : `${aeroColors.outlineVariant}20`,
                    border: `1px solid ${
                      kmlFile
                        ? `${aeroColors.primary}25`
                        : `${aeroColors.outlineVariant}25`
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: kmlFile
                      ? aeroColors.primary
                      : aeroColors.outline,
                    flexShrink: 0,
                  }}
                >
                  {kmlUploading ? (
                    <CircularProgress
                      size={18}
                      sx={{ color: aeroColors.primary }}
                    />
                  ) : kmlFile ? (
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <UploadFileOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {kmlUploading ? (
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color: aeroColors.primary,
                      }}
                    >
                      Przetwarzanie pliku KML...
                    </Typography>
                  ) : kmlFile ? (
                    <>
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: aeroColors.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {kmlFile.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.625rem',
                          color: aeroColors.outline,
                          mt: 0.25,
                        }}
                      >
                        {(kmlFile.size / 1024).toFixed(1)} KB · kliknij,
                        aby zmienic
                      </Typography>
                    </>
                  ) : kmlFilePath ? (
                    <>
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: aeroColors.onSurfaceVariant,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Plik KML wgrany
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.625rem',
                          color: aeroColors.outline,
                          mt: 0.25,
                        }}
                      >
                        Kliknij, aby zastapic
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          color: aeroColors.onSurfaceVariant,
                        }}
                      >
                        Kliknij, aby wybrac plik KML
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.625rem',
                          color: aeroColors.outline,
                          mt: 0.25,
                        }}
                      >
                        Maks. 5000 punktow · teren Polski · format .kml
                      </Typography>
                    </>
                  )}
                </Box>

                <Button
                  size="small"
                  component="span"
                  tabIndex={-1}
                  sx={{
                    bgcolor: `${aeroColors.primary}14`,
                    color: aeroColors.primary,
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: '0.5625rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    border: `1px solid ${aeroColors.primary}25`,
                    flexShrink: 0,
                    '&:hover': { bgcolor: `${aeroColors.primary}22` },
                  }}
                >
                  Przegladaj
                </Button>
              </Box>

              {kmlFileError && (
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    color: aeroColors.secondary,
                    mt: 0.5,
                    letterSpacing: '0.04em',
                  }}
                >
                  {kmlFileError}
                </Typography>
              )}
            </Box>
          )}

          {/* Route length display */}
          <Box sx={{ mt: 2 }}>
            <Typography sx={FIELD_LABEL_SX}>
              Liczba km trasy
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={
                routeLengthKm != null
                  ? `${routeLengthKm.toFixed(1)} km`
                  : '--- zostanie obliczona po wgraniu pliku KML'
              }
              disabled
              sx={{
                ...INPUT_SX,
                '& .MuiOutlinedInput-root.Mui-disabled': {
                  bgcolor:
                    routeLengthKm != null
                      ? `${aeroColors.primary}08`
                      : `${aeroColors.surfaceContainerLowest}60`,
                },
                '& .MuiOutlinedInput-input.Mui-disabled': {
                  WebkitTextFillColor:
                    routeLengthKm != null
                      ? aeroColors.primary
                      : `${aeroColors.outline}60`,
                  fontWeight: routeLengthKm != null ? 700 : 400,
                  fontStyle:
                    routeLengthKm != null ? 'normal' : 'italic',
                  fontSize: '0.8125rem',
                },
              }}
            />
          </Box>

          {/* ── Map view ───────────────────────────────────────────────── */}
          {kmlPoints && kmlPoints.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Podglad trasy na mapie
              </Typography>
              <MapView polylines={mapPolylines} height={350} />
            </Box>
          )}

          {/* ─── Proponowane daty ───────────────────────────────────────── */}
          <Box sx={{ mt: 2 }}>
            <SectionDivider label="Proponowane daty" />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Proponowany termin od
              </Typography>
              <TextField
                size="small"
                fullWidth
                type="date"
                disabled={isFormReadOnly}
                sx={
                  isFormReadOnly ? DISABLED_INPUT_SX : DATE_INPUT_SX
                }
                {...register('proposedDateEarliest')}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Proponowany termin do
              </Typography>
              <TextField
                size="small"
                fullWidth
                type="date"
                disabled={isFormReadOnly}
                sx={
                  isFormReadOnly ? DISABLED_INPUT_SX : DATE_INPUT_SX
                }
                {...register('proposedDateLatest')}
              />
            </Box>
          </Box>

          {/* ─── Planowane daty ─────────────────────────────────────────── */}
          <Box sx={{ mt: 2 }}>
            <SectionDivider label="Planowane daty" />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Planowany termin od
              </Typography>
              <TextField
                size="small"
                fullWidth
                type="date"
                disabled={isFormReadOnly || !canEditPlannedDates}
                sx={
                  isFormReadOnly || !canEditPlannedDates
                    ? DISABLED_INPUT_SX
                    : DATE_INPUT_SX
                }
                {...register('plannedDateEarliest')}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={FIELD_LABEL_SX}>
                Planowany termin do
              </Typography>
              <TextField
                size="small"
                fullWidth
                type="date"
                disabled={isFormReadOnly || !canEditPlannedDates}
                sx={
                  isFormReadOnly || !canEditPlannedDates
                    ? DISABLED_INPUT_SX
                    : DATE_INPUT_SX
                }
                {...register('plannedDateLatest')}
              />
            </Box>
          </Box>

          {/* ─── Osoby kontaktowe ──────────────────────────────────────── */}
          <Box sx={{ mt: 2 }}>
            <SectionDivider label="Kontakt" />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography sx={FIELD_LABEL_SX}>
              Osoby kontaktowe (adresy email)
            </Typography>
            <Controller
              name="contacts"
              control={control}
              render={({ field }) => {
                const selected = (field.value ?? []) as string[];
                return (
                  <Autocomplete
                    multiple
                    freeSolo
                    disabled={isFormReadOnly}
                    options={[] as string[]}
                    value={selected}
                    onChange={(_, newValue) => {
                      // Validate emails on add
                      const validated = newValue.filter((v) => {
                        if (typeof v !== 'string') return false;
                        if (!EMAIL_REGEX.test(v)) {
                          showError(
                            `Nieprawidlowy adres email: ${v}`,
                          );
                          return false;
                        }
                        return true;
                      });
                      field.onChange(validated);
                    }}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({
                          index,
                        });
                        return (
                          <Chip
                            key={key}
                            {...tagProps}
                            label={option}
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
                                '&:hover': {
                                  color: aeroColors.tertiary,
                                },
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
                        placeholder={
                          selected.length === 0
                            ? 'Wpisz email i nacisnij Enter...'
                            : ''
                        }
                        sx={INPUT_SX}
                      />
                    )}
                    sx={AUTOCOMPLETE_SX}
                  />
                );
              }}
            />
          </Box>

          {/* ─── Uwagi po realizacji ───────────────────────────────────── */}
          <Box sx={{ mt: 2 }}>
            <SectionDivider label="Realizacja" />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                mb: 0.75,
              }}
            >
              <Typography sx={FIELD_LABEL_SX}>
                Uwagi po realizacji
              </Typography>
              <Typography sx={CHAR_COUNTER_SX}>
                {watchPostCompletionNotes.length}/500
              </Typography>
            </Box>
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder="Opis przebiegu realizacji..."
              disabled={isFormReadOnly || !canEditPostCompletionNotes}
              error={!!errors.postCompletionNotes}
              helperText={errors.postCompletionNotes?.message}
              sx={
                isFormReadOnly || !canEditPostCompletionNotes
                  ? DISABLED_INPUT_SX
                  : INPUT_SX
              }
              {...register('postCompletionNotes')}
            />
          </Box>

          {/* ─── Save buttons ──────────────────────────────────────────── */}
          {!isFormReadOnly && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                type="button"
                onClick={() => navigate('/operations')}
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
                startIcon={
                  saving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{
                  background: `linear-gradient(135deg, ${aeroColors.primary} 0%, ${aeroColors.onPrimaryContainer} 100%)`,
                  color: aeroColors.onPrimaryFixed,
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  py: 1.25,
                  borderRadius: 1,
                  boxShadow: `0 4px 20px ${aeroColors.primaryContainer}60`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${aeroColors.primary} 0%, ${aeroColors.onPrimaryContainer} 100%)`,
                    opacity: 0.9,
                  },
                }}
              >
                {isEdit ? 'Zapisz zmiany' : 'Utworz operacje'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════
       * Comments section (edit mode only)
       * ══════════════════════════════════════════════════════════════════ */}
      {isEdit && (
        <Box sx={{ ...GLASS_CARD, p: 3, mb: 3 }}>
          <SectionDivider label="Komentarze" />

          {/* Existing comments */}
          {comments.length > 0 ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {comments.map((comment, idx) => (
                <Box
                  key={`comment-${idx}-${comment.createdAt}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: `${aeroColors.outlineVariant}10`,
                    border: `1px solid ${aeroColors.outlineVariant}15`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.75,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: aeroColors.primary,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {comment.authorEmail}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.5625rem',
                        color: aeroColors.outline,
                      }}
                    >
                      {formatDateTime(comment.createdAt)}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      color: aeroColors.onSurface,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {comment.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: aeroColors.outline,
                mt: 2,
                fontStyle: 'italic',
              }}
            >
              Brak komentarzy
            </Typography>
          )}

          {/* Add comment form */}
          <Box sx={{ mt: 2 }}>
            <Typography sx={FIELD_LABEL_SX}>Dodaj komentarz</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={1}
                maxRows={3}
                placeholder="Wpisz tresc komentarza..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={INPUT_SX}
              />
              <Tooltip title="Wyslij komentarz">
                <span>
                  <IconButton
                    onClick={handleAddComment}
                    disabled={
                      addingComment || !newComment.trim()
                    }
                    sx={{
                      bgcolor: `${aeroColors.primary}14`,
                      color: aeroColors.primary,
                      border: `1px solid ${aeroColors.primary}28`,
                      alignSelf: 'flex-end',
                      '&:hover': {
                        bgcolor: `${aeroColors.primary}22`,
                      },
                      '&.Mui-disabled': {
                        color: `${aeroColors.outline}50`,
                        bgcolor: `${aeroColors.outlineVariant}10`,
                        borderColor: `${aeroColors.outlineVariant}20`,
                      },
                    }}
                    aria-label="Wyslij komentarz"
                  >
                    {addingComment ? (
                      <CircularProgress
                        size={20}
                        sx={{ color: aeroColors.primary }}
                      />
                    ) : (
                      <SendOutlinedIcon sx={{ fontSize: 20 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════
       * Linked orders section (edit mode only)
       * ══════════════════════════════════════════════════════════════════ */}
      {isEdit && (
        <Box sx={{ ...GLASS_CARD, p: 3, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
            }}
          >
            <LinkOutlinedIcon
              sx={{ fontSize: 18, color: aeroColors.outline }}
            />
            <Typography sx={SECTION_LABEL_SX}>
              Powiazane zlecenia
            </Typography>
          </Box>

          {/*
           * The OperationResponse type does not include an explicit
           * linkedOrderIds field. This section serves as a placeholder
           * that can be populated once the backend provides this data
           * on the operation response, or via a separate API call.
           */}
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: aeroColors.outline,
              fontStyle: 'italic',
            }}
          >
            Brak powiazanych zlecen
          </Typography>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════
       * Change history section (edit mode only)
       * ══════════════════════════════════════════════════════════════════ */}
      {isEdit && changeHistory.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Accordion
            sx={{
              ...GLASS_CARD,
              '&::before': { display: 'none' },
              '&.Mui-expanded': { margin: 0 },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  sx={{ color: aeroColors.onSurfaceVariant }}
                />
              }
              sx={{
                px: 3,
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 1,
                },
              }}
            >
              <HistoryOutlinedIcon
                sx={{ fontSize: 18, color: aeroColors.outline }}
              />
              <Typography sx={SECTION_LABEL_SX}>
                Historia zmian ({changeHistory.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={TH_SX}>Pole</TableCell>
                      <TableCell sx={TH_SX}>
                        Stara wartosc
                      </TableCell>
                      <TableCell sx={TH_SX}>
                        Nowa wartosc
                      </TableCell>
                      <TableCell sx={TH_SX}>
                        Zmienione przez
                      </TableCell>
                      <TableCell sx={TH_SX}>Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {changeHistory.map((entry, idx) => (
                      <TableRow key={`history-${idx}`}>
                        <TableCell sx={TD_SX}>
                          {entry.fieldName}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...TD_SX,
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Tooltip title={entry.oldValue || '---'}>
                            <span>{entry.oldValue || '---'}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          sx={{
                            ...TD_SX,
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Tooltip title={entry.newValue || '---'}>
                            <span>{entry.newValue || '---'}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={TD_SX}>
                          {entry.changedByEmail}
                        </TableCell>
                        <TableCell sx={TD_SX}>
                          {formatDateTime(entry.changedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* ── Confirm dialog for destructive status actions ──────────────── */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Potwierdz"
        cancelLabel="Anuluj"
        confirmColor={confirmDialog.color}
        onConfirm={() => handleStatusAction(confirmDialog.action)}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, open: false }))
        }
      />
    </Box>
  );
}
