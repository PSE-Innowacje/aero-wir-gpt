import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { aeroColors } from '../../theme';

/* ── Types ──────────────────────────────────────────────────────────────── */
export type OperationStatus =
  | 'SUBMITTED'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'SCHEDULED'
  | 'PARTIALLY_COMPLETED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OperationData {
  id?: string;
  orderProjectNumber: string;
  shortDescription: string;
  kmlFile?: File | null;
  kmlFileName?: string;
  proposedDateFrom?: string;
  proposedDateTo?: string;
  activityTypes: string[];
  additionalInfo?: string;
  routeLengthKm?: number;
  plannedDateFrom?: string;
  plannedDateTo?: string;
  comment?: string;
  status: OperationStatus;
  contactEmails?: string[];
  completionNotes?: string;
}

/* ── Status config ──────────────────────────────────────────────────────── */
export const OPERATION_STATUS_OPTIONS: Array<{
  value: OperationStatus;
  label: string;
  color: string;
}> = [
  { value: 'SUBMITTED',           label: 'Wprowadzone',               color: aeroColors.primary },
  { value: 'REJECTED',            label: 'Odrzucone',                  color: aeroColors.error },
  { value: 'CONFIRMED',           label: 'Potwierdzone do planu',      color: aeroColors.tertiary },
  { value: 'SCHEDULED',           label: 'Zaplanowane do zlecenia',    color: '#4caf50' },
  { value: 'PARTIALLY_COMPLETED', label: 'Częściowo zrealizowane',     color: aeroColors.secondary },
  { value: 'COMPLETED',           label: 'Zrealizowane',               color: '#4caf50' },
  { value: 'CANCELLED',           label: 'Rezygnacja',                 color: aeroColors.onSurfaceVariant },
];

/* ── Activity types dictionary ──────────────────────────────────────────── */
export const ACTIVITY_TYPE_OPTIONS = [
  'Oględziny wizualne',
  'Skan 3D',
  'Lokalizacja awarii',
  'Zdjęcia',
  'Patrolowanie',
] as const;

/* ── Zod schema ─────────────────────────────────────────────────────────── */
const STATUS_VALUES = [
  'SUBMITTED', 'REJECTED', 'CONFIRMED', 'SCHEDULED',
  'PARTIALLY_COMPLETED', 'COMPLETED', 'CANCELLED',
] as const;

const operationSchema = z.object({
  orderProjectNumber: z
    .string()
    .min(1, 'Pole wymagane')
    .max(30, 'Maks. 30 znaków'),
  shortDescription: z
    .string()
    .min(1, 'Pole wymagane')
    .max(100, 'Maks. 100 znaków'),
  proposedDateFrom:  z.string().optional(),
  proposedDateTo:    z.string().optional(),
  activityTypes:     z.array(z.string()).min(1, 'Wybierz co najmniej jeden rodzaj czynności'),
  additionalInfo:    z.string().max(500, 'Maks. 500 znaków').optional(),
  plannedDateFrom:   z.string().optional(),
  plannedDateTo:     z.string().optional(),
  comment:           z.string().max(500, 'Maks. 500 znaków').optional(),
  status:            z.enum(STATUS_VALUES),
  contactEmails:     z.array(z.string()).optional(),
  completionNotes:   z.string().max(500, 'Maks. 500 znaków').optional(),
});

type OperationFormValues = z.infer<typeof operationSchema>;

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
    '&.Mui-focused fieldset': { borderColor: `${aeroColors.primary}50`, borderWidth: 1 },
    '&.Mui-error fieldset': { borderColor: `${aeroColors.secondary}90` },
    '&.Mui-error:hover fieldset': { borderColor: aeroColors.secondary },
    '&.Mui-error.Mui-focused fieldset': { borderColor: aeroColors.secondary, borderWidth: 1 },
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

const AUTOCOMPLETE_SX = {
  '& .MuiAutocomplete-popupIndicator': { color: aeroColors.outline },
  '& .MuiAutocomplete-clearIndicator': { color: aeroColors.outline },
} as const;

/* ── Helpers ────────────────────────────────────────────────────────────── */
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

const CHAR_COUNTER_SX = {
  fontSize: '0.5625rem',
  color: aeroColors.outline,
  textAlign: 'right' as const,
  mt: 0.5,
  letterSpacing: '0.04em',
};

/* ── Default form values ────────────────────────────────────────────────── */
const EMPTY_DEFAULTS: OperationFormValues = {
  orderProjectNumber: '',
  shortDescription:   '',
  proposedDateFrom:   '',
  proposedDateTo:     '',
  activityTypes:      [],
  additionalInfo:     '',
  plannedDateFrom:    '',
  plannedDateTo:      '',
  comment:            '',
  status:             'SUBMITTED',
  contactEmails:      [],
  completionNotes:    '',
};

/* ── Props ──────────────────────────────────────────────────────────────── */
export interface OperationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (operation: OperationData) => void;
  operation: OperationData | null;
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function OperationModal({
  open,
  onClose,
  onSave,
  operation,
}: OperationModalProps) {
  const isEdit = Boolean(operation);

  /* KML file — managed outside Zod schema to avoid FileList complexity */
  const [kmlFile, setKmlFile]       = useState<File | null>(null);
  const [kmlFileError, setKmlFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<OperationFormValues>({
    resolver: zodResolver(operationSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      reset(
        operation
          ? {
              orderProjectNumber: operation.orderProjectNumber,
              shortDescription:   operation.shortDescription,
              proposedDateFrom:   operation.proposedDateFrom   ?? '',
              proposedDateTo:     operation.proposedDateTo     ?? '',
              activityTypes:      operation.activityTypes,
              additionalInfo:     operation.additionalInfo     ?? '',
              plannedDateFrom:    operation.plannedDateFrom    ?? '',
              plannedDateTo:      operation.plannedDateTo      ?? '',
              comment:            operation.comment            ?? '',
              status:             operation.status,
              contactEmails:      operation.contactEmails      ?? [],
              completionNotes:    operation.completionNotes    ?? '',
            }
          : EMPTY_DEFAULTS,
      );
      setKmlFile(null);
      setKmlFileError('');
    }
  }, [operation, open, reset]);

  const watchAdditionalInfo = watch('additionalInfo') ?? '';
  const watchComment        = watch('comment')        ?? '';
  const watchCompletionNote = watch('completionNotes') ?? '';
  const watchStatus         = watch('status');

  const showCompletionNotes =
    watchStatus === 'COMPLETED' || watchStatus === 'PARTIALLY_COMPLETED';

  const onSubmit = (values: OperationFormValues) => {
    if (!isEdit && !kmlFile) {
      setKmlFileError('Plik KML jest wymagany');
      return;
    }
    setKmlFileError('');
    onSave({
      id:                 operation?.id,
      orderProjectNumber: values.orderProjectNumber,
      shortDescription:   values.shortDescription,
      kmlFile:            kmlFile,
      kmlFileName:        kmlFile?.name ?? operation?.kmlFileName,
      proposedDateFrom:   values.proposedDateFrom  || undefined,
      proposedDateTo:     values.proposedDateTo    || undefined,
      activityTypes:      values.activityTypes,
      additionalInfo:     values.additionalInfo    || undefined,
      routeLengthKm:      operation?.routeLengthKm,
      plannedDateFrom:    values.plannedDateFrom   || undefined,
      plannedDateTo:      values.plannedDateTo     || undefined,
      comment:            values.comment           || undefined,
      status:             values.status,
      contactEmails:      values.contactEmails     ?? [],
      completionNotes:    values.completionNotes   || undefined,
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
          background: `linear-gradient(135deg, ${aeroColors.surfaceContainerHigh} 0%, ${aeroColors.surfaceContainerHighest} 55%, ${aeroColors.primaryContainer}60 100%)`,
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 90%, ${aeroColors.primary}18 0%, transparent 65%)`,
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
              bgcolor: `${aeroColors.primary}14`,
              border: `1.5px solid ${aeroColors.primary}35`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.25,
            }}
          >
            <RouteOutlinedIcon sx={{ fontSize: 24, color: aeroColors.primary }} />
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
            {isEdit ? 'Edycja operacji lotniczej' : 'Nowa operacja lotnicza'}
          </Typography>
          <Typography sx={{ ...SECTION_LABEL_SX, fontSize: '0.5625rem', mt: 0.25 }}>
            {isEdit ? `Aktualizacja danych operacji` : 'Nr operacji nadany automatycznie'}
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
          {/* Nr operacji — auto */}
          <Box sx={{ flex: 0.8 }}>
            <Typography sx={FIELD_LABEL_SX}>Nr operacji</Typography>
            <TextField
              size="small"
              fullWidth
              value={isEdit ? (operation?.id ?? 'Autonumer') : 'Autonumer'}
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

          {/* Nr zlecenia / projektu */}
          <Box sx={{ flex: 1.2 }}>
            <Typography sx={FIELD_LABEL_SX}>Nr zlecenia / projektu</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="np. DE-25-12020"
              error={!!errors.orderProjectNumber}
              helperText={errors.orderProjectNumber?.message}
              sx={INPUT_SX}
              {...register('orderProjectNumber')}
            />
          </Box>
        </Box>

        {/* Status */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Status</Typography>
          <Controller
            name="status"
            control={control}
            render={({ field }) => {
              const cfg = OPERATION_STATUS_OPTIONS.find((o) => o.value === field.value);
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
                  {OPERATION_STATUS_OPTIONS.map((opt) => (
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

        {/* ─── Opis operacji ─────────────────────────────────────────────── */}
        <SectionDivider label="Opis operacji" />

        {/* Opis skrócony */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
            <Typography sx={FIELD_LABEL_SX}>Opis skrócony</Typography>
            <Typography sx={CHAR_COUNTER_SX}>
              {watch('shortDescription')?.length ?? 0}/100
            </Typography>
          </Box>
          <TextField
            size="small"
            fullWidth
            placeholder="Krótki opis celu operacji"
            error={!!errors.shortDescription}
            helperText={errors.shortDescription?.message}
            sx={INPUT_SX}
            {...register('shortDescription')}
          />
        </Box>

        {/* Rodzaj czynności */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Rodzaj czynności</Typography>
          <Controller
            name="activityTypes"
            control={control}
            render={({ field }) => {
              const selected = (field.value ?? []) as string[];
              return (
                <Autocomplete
                  multiple
                  options={[...ACTIVITY_TYPE_OPTIONS]}
                  getOptionLabel={(opt) => opt}
                  isOptionEqualToValue={(opt, val) => opt === val}
                  value={selected}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          {...tagProps}
                          label={option}
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
                      placeholder={selected.length === 0 ? 'Wybierz rodzaje czynności...' : ''}
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

        {/* Dodatkowe informacje */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
            <Typography sx={FIELD_LABEL_SX}>Dodatkowe informacje (termin/priorytet)</Typography>
            <Typography sx={CHAR_COUNTER_SX}>{watchAdditionalInfo.length}/500</Typography>
          </Box>
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            placeholder="Informacje o terminie, priorytecie lub inne uwagi..."
            error={!!errors.additionalInfo}
            helperText={errors.additionalInfo?.message}
            sx={INPUT_SX}
            {...register('additionalInfo')}
          />
        </Box>

        {/* ─── Trasa KML ─────────────────────────────────────────────────── */}
        <SectionDivider label="Trasa KML" />

        {/* KML file upload */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>
            Zbiór punktów / ślad trasy
            {!isEdit && <Box component="span" sx={{ color: aeroColors.secondary, ml: 0.5 }}>*</Box>}
          </Typography>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".kml"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setKmlFile(file);
              if (file) setKmlFileError('');
            }}
          />

          {/* Upload zone */}
          <Box
            onClick={() => fileInputRef.current?.click()}
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
              cursor: 'pointer',
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
                bgcolor: kmlFile ? `${aeroColors.primary}18` : `${aeroColors.outlineVariant}20`,
                border: `1px solid ${kmlFile ? `${aeroColors.primary}25` : `${aeroColors.outlineVariant}25`}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: kmlFile ? aeroColors.primary : aeroColors.outline,
                flexShrink: 0,
              }}
            >
              {kmlFile
                ? <InsertDriveFileOutlinedIcon sx={{ fontSize: 18 }} />
                : <UploadFileOutlinedIcon sx={{ fontSize: 18 }} />
              }
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {kmlFile ? (
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
                  <Typography sx={{ fontSize: '0.625rem', color: aeroColors.outline, mt: 0.25 }}>
                    {(kmlFile.size / 1024).toFixed(1)} KB · kliknij, aby zmienić
                  </Typography>
                </>
              ) : isEdit && operation?.kmlFileName ? (
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
                    {operation.kmlFileName}
                  </Typography>
                  <Typography sx={{ fontSize: '0.625rem', color: aeroColors.outline, mt: 0.25 }}>
                    Plik wgrany · kliknij, aby zastąpić
                  </Typography>
                </>
              ) : (
                <>
                  <Typography sx={{ fontSize: '0.8125rem', color: aeroColors.onSurfaceVariant }}>
                    Kliknij, aby wybrać plik KML
                  </Typography>
                  <Typography sx={{ fontSize: '0.625rem', color: aeroColors.outline, mt: 0.25 }}>
                    Maks. 5000 punktów · teren Polski · format .kml
                  </Typography>
                </>
              )}
            </Box>

            <Button
              size="small"
              component="span"
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
              Przeglądaj
            </Button>
          </Box>

          {kmlFileError && (
            <Typography sx={{ fontSize: '0.625rem', color: aeroColors.secondary, mt: 0.5, letterSpacing: '0.04em' }}>
              {kmlFileError}
            </Typography>
          )}
        </Box>

        {/* Liczba km trasy — auto */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Liczba km trasy</Typography>
          <TextField
            size="small"
            fullWidth
            value={
              operation?.routeLengthKm != null
                ? `${operation.routeLengthKm} km`
                : '— zostanie obliczona po wgraniu pliku KML'
            }
            disabled
            sx={{
              ...INPUT_SX,
              '& .MuiOutlinedInput-root.Mui-disabled': {
                bgcolor: operation?.routeLengthKm != null
                  ? `${aeroColors.primary}08`
                  : `${aeroColors.surfaceContainerLowest}60`,
              },
              '& .MuiOutlinedInput-input.Mui-disabled': {
                WebkitTextFillColor: operation?.routeLengthKm != null
                  ? aeroColors.primary
                  : `${aeroColors.outline}60`,
                fontWeight: operation?.routeLengthKm != null ? 700 : 400,
                fontStyle: operation?.routeLengthKm != null ? 'normal' : 'italic',
                fontSize: '0.8125rem',
              },
            }}
          />
        </Box>

        {/* ─── Proponowane daty ──────────────────────────────────────────── */}
        <SectionDivider label="Proponowane daty" />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Najwcześniej</Typography>
            <TextField
              size="small"
              fullWidth
              type="date"
              sx={{
                ...INPUT_SX,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(0.6)',
                  cursor: 'pointer',
                },
                '& input[type="date"]': { colorScheme: 'dark' },
              }}
              {...register('proposedDateFrom')}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Najpóźniej</Typography>
            <TextField
              size="small"
              fullWidth
              type="date"
              sx={{
                ...INPUT_SX,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(0.6)',
                  cursor: 'pointer',
                },
                '& input[type="date"]': { colorScheme: 'dark' },
              }}
              {...register('proposedDateTo')}
            />
          </Box>
        </Box>

        {/* ─── Planowane daty ────────────────────────────────────────────── */}
        <SectionDivider label="Planowane daty" />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Najwcześniej</Typography>
            <TextField
              size="small"
              fullWidth
              type="date"
              sx={{
                ...INPUT_SX,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(0.6)',
                  cursor: 'pointer',
                },
                '& input[type="date"]': { colorScheme: 'dark' },
              }}
              {...register('plannedDateFrom')}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Najpóźniej</Typography>
            <TextField
              size="small"
              fullWidth
              type="date"
              sx={{
                ...INPUT_SX,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(0.6)',
                  cursor: 'pointer',
                },
                '& input[type="date"]': { colorScheme: 'dark' },
              }}
              {...register('plannedDateTo')}
            />
          </Box>
        </Box>

        {/* ─── Kontakt i uwagi ───────────────────────────────────────────── */}
        <SectionDivider label="Kontakt i uwagi" />

        {/* Osoby kontaktowe */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Osoby kontaktowe (adresy email)</Typography>
          <Controller
            name="contactEmails"
            control={control}
            render={({ field }) => {
              const selected = (field.value ?? []) as string[];
              return (
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={selected}
                  onChange={(_, newValue) => field.onChange(newValue as string[])}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
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
                      placeholder={selected.length === 0 ? 'Wpisz email i naciśnij Enter...' : ''}
                      sx={INPUT_SX}
                    />
                  )}
                  sx={AUTOCOMPLETE_SX}
                />
              );
            }}
          />
        </Box>

        {/* Komentarz */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
            <Typography sx={FIELD_LABEL_SX}>Komentarz</Typography>
            <Typography sx={CHAR_COUNTER_SX}>{watchComment.length}/500</Typography>
          </Box>
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            placeholder="Komentarz do operacji..."
            error={!!errors.comment}
            helperText={errors.comment?.message}
            sx={INPUT_SX}
            {...register('comment')}
          />
        </Box>

        {/* ─── Uwagi po realizacji ───────────────────────────────────────── */}
        {showCompletionNotes && (
          <>
            <SectionDivider label="Realizacja" />

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: `${aeroColors.secondary}0a`,
                border: `1px solid ${aeroColors.secondary}20`,
              }}
            >
              <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.secondary, lineHeight: 1.6 }}>
                Wybrany status wymaga podania uwag po realizacji.
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
                <Typography sx={FIELD_LABEL_SX}>
                  Uwagi po realizacji
                  <Box component="span" sx={{ color: aeroColors.secondary, ml: 0.5 }}>*</Box>
                </Typography>
                <Typography sx={CHAR_COUNTER_SX}>{watchCompletionNote.length}/500</Typography>
              </Box>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={3}
                maxRows={5}
                placeholder="Opis przebiegu realizacji..."
                error={!!errors.completionNotes}
                helperText={errors.completionNotes?.message}
                sx={INPUT_SX}
                {...register('completionNotes')}
              />
            </Box>
          </>
        )}

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
            Numer operacji oraz osoba wprowadzająca zostaną nadane automatycznie.
            Długość trasy zostanie obliczona na podstawie wgranego pliku KML.
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.25 }}>
          <Button
            fullWidth
            variant="outlined"
            type="button"
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
            {isEdit ? 'Zapisz zmiany' : 'Utwórz operację'}
          </Button>
        </Box>

        <Box sx={{ pb: 0.5 }} />
      </Box>
    </Dialog>
  );
}
