import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  IconButton,
  Dialog,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { aeroColors } from '../../theme';

/* ── Shared types ───────────────────────────────────────────────────────── */
export interface Helicopter {
  id: number;
  registration: string;
  type: string;
  description?: string;
  maxCrewCount: number;
  status: string;
  inspectionExpiry: string;
  rangeKm: number;
  maxCrewWeightKg: number;
}

export type StatusKey = 'Aktywny' | 'Nieaktywny' | 'W naprawie';

export const STATUS_CONFIG: Record<StatusKey, { color: string; bg: string }> = {
  Aktywny: {
    color: aeroColors.tertiary,
    bg: `${aeroColors.tertiary}18`,
  },
  'W naprawie': {
    color: aeroColors.secondary,
    bg: `${aeroColors.secondary}18`,
  },
  Nieaktywny: {
    color: aeroColors.onSurfaceVariant,
    bg: `${aeroColors.outlineVariant}40`,
  },
};

export const STATUS_OPTIONS: StatusKey[] = ['Aktywny', 'Nieaktywny', 'W naprawie'];

/* ── Zod schema ─────────────────────────────────────────────────────────── */
const helicopterSchema = z
  .object({
    registration: z
      .string()
      .min(1, 'Pole wymagane')
      .max(30, 'Maks. 30 znaków'),
    type: z
      .string()
      .min(1, 'Pole wymagane')
      .max(100, 'Maks. 100 znaków'),
    description: z.string().max(100, 'Maks. 100 znaków'),
    maxCrewCount: z
      .string()
      .min(1, 'Pole wymagane')
      .transform(Number)
      .pipe(
        z.number({ error: 'Podaj liczbę' })
          .int('Musi być liczbą całkowitą')
          .min(1, 'Min. 1')
          .max(10, 'Maks. 10'),
      ),
    maxCrewWeightKg: z
      .string()
      .min(1, 'Pole wymagane')
      .transform(Number)
      .pipe(
        z.number({ error: 'Podaj liczbę' })
          .int('Musi być liczbą całkowitą')
          .min(1, 'Min. 1 kg')
          .max(1000, 'Maks. 1000 kg'),
      ),
    status: z.enum(['Aktywny', 'Nieaktywny', 'W naprawie']),
    inspectionExpiry: z.string(),
    rangeKm: z
      .string()
      .min(1, 'Pole wymagane')
      .transform(Number)
      .pipe(
        z.number({ error: 'Podaj liczbę' })
          .int('Musi być liczbą całkowitą')
          .min(1, 'Min. 1 km')
          .max(1000, 'Maks. 1000 km'),
      ),
  })
  .refine(
    (data) => data.status !== 'Aktywny' || Boolean(data.inspectionExpiry),
    {
      message: 'Data wymagana dla statusu Aktywny',
      path: ['inspectionExpiry'],
    },
  );

type HelicopterFormInput = z.input<typeof helicopterSchema>;
type HelicopterFormValues = z.output<typeof helicopterSchema>;

/* ── Local design tokens ────────────────────────────────────────────────── */
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

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZxqWR9uO8aCwvOvyQgic2ZcxAAGBPWOvW6UP75Za8lzn5yfNXWmOBu9viOQvZiglIaHBs_blFZSavL5938cXtZXf_PFkyWCkSfzKMBEeu9PHy3ZmUYUvhrXaKd_hB5ADjhL3NQbpiB7LytJdZW8j_bP6wUmtRwwL3Y4QlTDzqJSE8wHMt3kzNa75DvXsD2v907DAoATmVsaLRWel2IIeVKX406nwiSjKqV73ectOOFB8_leSElVYw45zzSjWnd9RwPlyQZXEv77Ns';

/* ── Component ──────────────────────────────────────────────────────────── */
export interface HelicopterModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (heli: Helicopter) => void;
  helicopter: Helicopter | null;
}

export default function HelicopterModal({ open, onClose, onSave, helicopter }: HelicopterModalProps) {
  const isEdit = Boolean(helicopter);
  const [musicOn, setMusicOn] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<HelicopterFormInput, unknown, HelicopterFormValues>({
    resolver: zodResolver(helicopterSchema),
    defaultValues: {
      registration: '',
      type: '',
      description: '',
      maxCrewCount: '',
      maxCrewWeightKg: '',
      status: 'Aktywny',
      inspectionExpiry: '',
      rangeKm: '',
    },
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    if (!open) {
      setMusicOn(false);
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setMusicOn((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      reset(
        helicopter
          ? {
              registration: helicopter.registration,
              type: helicopter.type,
              description: helicopter.description ?? '',
              maxCrewCount: String(helicopter.maxCrewCount),
              maxCrewWeightKg: String(helicopter.maxCrewWeightKg),
              status: helicopter.status as HelicopterFormInput['status'],
              inspectionExpiry: helicopter.inspectionExpiry,
              rangeKm: String(helicopter.rangeKm),
            }
          : {
              registration: '',
              type: '',
              description: '',
              maxCrewCount: '',
              maxCrewWeightKg: '',
              status: 'Aktywny',
              inspectionExpiry: '',
              rangeKm: '',
            },
      );
    }
  }, [helicopter, open, reset]);

  const onSubmit = (values: HelicopterFormValues) => {
    onSave({
      id: helicopter?.id ?? Date.now(),
      registration: values.registration,
      type: values.type,
      description: values.description || undefined,
      maxCrewCount: values.maxCrewCount,
      maxCrewWeightKg: values.maxCrewWeightKg,
      status: values.status,
      inspectionExpiry: values.inspectionExpiry,
      rangeKm: values.rangeKm,
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
          width: 480,
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
      {/* Background music (Ctrl/Cmd+H to toggle) */}
      {musicOn && (
        <iframe
          src="https://www.youtube.com/embed/a0DbzUe-r4Q?autoplay=1&loop=1&playlist=a0DbzUe-r4Q&controls=0"
          allow="autoplay"
          style={{ position: 'absolute', width: 0, height: 0, border: 'none', opacity: 0 }}
          title="background-music"
        />
      )}

      {/* Hero image */}
      <Box
        sx={{
          height: 180,
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          flexShrink: 0,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(30,32,35,1) 0%, rgba(30,32,35,0.4) 50%, rgba(30,32,35,0.15) 100%)',
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

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            px: 3,
            pb: 2,
            zIndex: 1,
          }}
        >
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
            {isEdit ? 'Edycja helikoptera' : 'Nowy helikopter'}
          </Typography>
          {isEdit && helicopter && (
            <Typography
              sx={{
                ...SECTION_LABEL_SX,
                fontSize: '0.5625rem',
                mt: 0.25,
              }}
            >
              ID jednostki: {helicopter.registration}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        {/* Registration */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Numer rejestracyjny</Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="np. SP-AER1"
            error={!!errors.registration}
            helperText={errors.registration?.message}
            sx={INPUT_SX}
            {...register('registration')}
          />
        </Box>

        {/* Type */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Typ helikoptera</Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="np. Airbus H145"
            error={!!errors.type}
            helperText={errors.type?.message}
            sx={INPUT_SX}
            {...register('type')}
          />
        </Box>

        {/* Description */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Opis</Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Opcjonalny opis jednostki"
            error={!!errors.description}
            helperText={errors.description?.message}
            sx={INPUT_SX}
            {...register('description')}
          />
        </Box>

        {/* Max crew count + Max crew weight — side by side */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Maks. liczba załogi</Typography>
            <TextField
              size="small"
              fullWidth
              type="number"
              placeholder="np. 4"
              error={!!errors.maxCrewCount}
              helperText={errors.maxCrewCount?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, fontWeight: 600 }}>
                      OS.
                    </Typography>
                  </InputAdornment>
                ),
                inputProps: { min: 1, max: 10, step: 1 },
              }}
              sx={INPUT_SX}
              {...register('maxCrewCount')}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Maks. udźwig załogi</Typography>
            <TextField
              size="small"
              fullWidth
              type="number"
              placeholder="np. 480"
              error={!!errors.maxCrewWeightKg}
              helperText={errors.maxCrewWeightKg?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, fontWeight: 600 }}>
                      KG
                    </Typography>
                  </InputAdornment>
                ),
                inputProps: { min: 1, max: 1000, step: 1 },
              }}
              sx={INPUT_SX}
              {...register('maxCrewWeightKg')}
            />
          </Box>
        </Box>

        {/* Status */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Status</Typography>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                select
                error={!!errors.status}
                helperText={errors.status?.message}
                sx={{
                  ...INPUT_SX,
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
                SelectProps={{
                  renderValue: (val) => {
                    const cfg = STATUS_CONFIG[val as StatusKey];
                    return (
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
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: cfg?.color,
                          }}
                        >
                          {val as string}
                        </Typography>
                      </Box>
                    );
                  },
                }}
              >
                {STATUS_OPTIONS.map((opt) => {
                  const cfg = STATUS_CONFIG[opt];
                  return (
                    <MenuItem key={opt} value={opt}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: cfg.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: cfg.color }}>
                          {opt}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
            )}
          />
        </Box>

        {/* Inspection expiry */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>
            Data ważności przeglądu
            {watchedStatus !== 'Aktywny' && (
              <Box
                component="span"
                sx={{ ml: 0.75, color: aeroColors.outline, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}
              >
                (opcjonalne)
              </Box>
            )}
          </Typography>
          <TextField
            size="small"
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
            error={!!errors.inspectionExpiry}
            helperText={errors.inspectionExpiry?.message}
            sx={INPUT_SX}
            {...register('inspectionExpiry')}
          />
        </Box>

        {/* Range */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Zasięg bez lądowania</Typography>
          <TextField
            size="small"
            fullWidth
            type="number"
            placeholder="np. 650"
            error={!!errors.rangeKm}
            helperText={errors.rangeKm?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, fontWeight: 600 }}>
                    KM
                  </Typography>
                </InputAdornment>
              ),
              inputProps: { min: 1, max: 1000, step: 1 },
            }}
            sx={INPUT_SX}
            {...register('rangeKm')}
          />
        </Box>

        <Box
          sx={{
            mt: 0.5,
            p: 2,
            borderRadius: 1.5,
            bgcolor: `${aeroColors.outlineVariant}12`,
            border: `1px solid ${aeroColors.outlineVariant}20`,
          }}
        >
          <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, lineHeight: 1.6 }}>
            Każdy serwis i przegląd wymagają aktualizacji daty ważności. Helikoptery muszą mieć
            ważny przegląd techniczny przy przypisywaniu do zlecenia lotniczego.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
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
            {isEdit ? 'Zapisz zmiany' : 'Dodaj helikopter'}
          </Button>
        </Box>

        {/* Extra bottom padding for scrollable overflow */}
        <Box sx={{ pb: 0.5 }} />
      </Box>
    </Dialog>
  );
}
