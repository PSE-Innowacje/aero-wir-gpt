import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import { aeroColors } from '../../theme';

/* ── Types ──────────────────────────────────────────────────────────────── */
export interface LandingSiteData {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
}

/* ── Zod schema ─────────────────────────────────────────────────────────── */
const landingSiteSchema = z.object({
  name: z
    .string()
    .min(1, 'Pole wymagane')
    .max(200, 'Maks. 200 znaków'),
  latitude: z.coerce
    .number({ message: 'Podaj liczbę' })
    .min(-90,  'Min. −90°')
    .max(90,   'Maks. 90°'),
  longitude: z.coerce
    .number({ message: 'Podaj liczbę' })
    .min(-180, 'Min. −180°')
    .max(180,  'Maks. 180°'),
});

type LandingSiteFormValues = z.infer<typeof landingSiteSchema>;

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

/* ── Default values ─────────────────────────────────────────────────────── */
const EMPTY_DEFAULTS: LandingSiteFormValues = {
  name:      '',
  latitude:  '' as unknown as number,
  longitude: '' as unknown as number,
};

/* ── Props ──────────────────────────────────────────────────────────────── */
export interface LandingSiteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (site: LandingSiteData) => void;
  site: LandingSiteData | null;
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function LandingSiteModal({
  open,
  onClose,
  onSave,
  site,
}: LandingSiteModalProps) {
  const isEdit = Boolean(site);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LandingSiteFormValues>({
    resolver: zodResolver(landingSiteSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      reset(
        site
          ? { name: site.name, latitude: site.latitude, longitude: site.longitude }
          : EMPTY_DEFAULTS,
      );
    }
  }, [site, open, reset]);

  const watchLat = watch('latitude');
  const watchLng = watch('longitude');
  const hasCoords =
    watchLat !== ('' as unknown as number) &&
    watchLng !== ('' as unknown as number) &&
    !isNaN(Number(watchLat)) &&
    !isNaN(Number(watchLng));

  const onSubmit = (values: LandingSiteFormValues) => {
    onSave({ id: site?.id, name: values.name, latitude: values.latitude, longitude: values.longitude });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 440,
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
            <AddLocationAltOutlinedIcon sx={{ fontSize: 24, color: aeroColors.tertiary }} />
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
            {isEdit ? 'Edycja lądowiska' : 'Nowe lądowisko'}
          </Typography>
          {isEdit && site && (
            <Typography sx={{ ...SECTION_LABEL_SX, fontSize: '0.5625rem', mt: 0.25 }}>
              {site.name}
            </Typography>
          )}
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
          gap: 2,
          overflowY: 'auto',
        }}
      >
        {/* Nazwa */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Nazwa lądowiska</Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="np. WARSAW-SOUTH-H2"
            error={!!errors.name}
            helperText={errors.name?.message}
            sx={INPUT_SX}
            {...register('name')}
          />
        </Box>

        {/* Współrzędne */}
        <Box>
          <Typography
            sx={{
              ...FIELD_LABEL_SX,
              mb: 1.25,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            Współrzędne geograficzne
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {/* Latitude */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: aeroColors.outline,
                  mb: 0.5,
                }}
              >
                Szerokość (Lat)
              </Typography>
              <TextField
                size="small"
                fullWidth
                type="number"
                placeholder="52.0000"
                inputProps={{ step: 0.0001, min: -90, max: 90 }}
                error={!!errors.latitude}
                helperText={errors.latitude?.message}
                sx={INPUT_SX}
                {...register('latitude')}
              />
            </Box>

            {/* Longitude */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: aeroColors.outline,
                  mb: 0.5,
                }}
              >
                Długość (Lng)
              </Typography>
              <TextField
                size="small"
                fullWidth
                type="number"
                placeholder="19.0000"
                inputProps={{ step: 0.0001, min: -180, max: 180 }}
                error={!!errors.longitude}
                helperText={errors.longitude?.message}
                sx={INPUT_SX}
                {...register('longitude')}
              />
            </Box>
          </Box>
        </Box>

        {/* Coordinate preview */}
        {hasCoords && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 1.75,
              py: 1.25,
              borderRadius: 1.5,
              bgcolor: `${aeroColors.tertiary}08`,
              border: `1px solid ${aeroColors.tertiary}20`,
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: `${aeroColors.tertiary}14`,
                border: `1px solid ${aeroColors.tertiary}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: aeroColors.tertiary,
                flexShrink: 0,
              }}
            >
              <AddLocationAltOutlinedIcon sx={{ fontSize: 15 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: aeroColors.outline,
                  textTransform: 'uppercase',
                  mb: 0.2,
                }}
              >
                Podgląd lokalizacji
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter", monospace',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: aeroColors.tertiary,
                  letterSpacing: '0.04em',
                }}
              >
                {Number(watchLat).toFixed(4)}, {Number(watchLng).toFixed(4)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Info note */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: `${aeroColors.outlineVariant}12`,
            border: `1px solid ${aeroColors.outlineVariant}20`,
          }}
        >
          <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, lineHeight: 1.6 }}>
            Współrzędne w formacie dziesiętnym (WGS-84). Dla terenu Polski:
            szerokość 49.0–54.9°N, długość 14.1–24.2°E.
          </Typography>
        </Box>

        {/* Action buttons */}
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
            {isEdit ? 'Zapisz zmiany' : 'Dodaj lądowisko'}
          </Button>
        </Box>

        <Box sx={{ pb: 0.5 }} />
      </Box>
    </Dialog>
  );
}
