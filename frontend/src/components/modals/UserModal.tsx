import { useEffect } from 'react';
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
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { aeroColors } from '../../theme';
import type { UserRole } from '../../api/types';

/* ── Shared types ───────────────────────────────────────────────────────── */
export type { UserRole };

export interface UserData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password?: string;
}

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
  SUPERUSER: {
    label: 'Superużytkownik',
    color: '#ef5350',
    bg: 'rgba(239,83,80,0.12)',
  },
  ADMIN: {
    label: 'Administrator',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.12)',
  },
  PLANNER: {
    label: 'Osoba planująca',
    color: aeroColors.primary,
    bg: `${aeroColors.primary}18`,
  },
  SUPERVISOR: {
    label: 'Osoba nadzorująca',
    color: aeroColors.secondary,
    bg: `${aeroColors.secondary}18`,
  },
  PILOT: {
    label: 'Pilot',
    color: aeroColors.tertiary,
    bg: `${aeroColors.tertiary}18`,
  },
};

export const ROLE_OPTIONS: UserRole[] = ['SUPERUSER', 'ADMIN', 'PLANNER', 'SUPERVISOR', 'PILOT'];

/* ── Zod schema ─────────────────────────────────────────────────────────── */
const userSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Pole wymagane')
    .max(100, 'Maks. 100 znaków'),
  lastName: z
    .string()
    .min(1, 'Pole wymagane')
    .max(100, 'Maks. 100 znaków'),
  email: z
    .string()
    .min(1, 'Pole wymagane')
    .max(100, 'Maks. 100 znaków')
    .email('Nieprawidłowy adres email'),
  password: z
    .string()
    .max(100, 'Maks. 100 znaków')
    .optional()
    .or(z.literal('')),
  role: z.enum(['SUPERUSER', 'ADMIN', 'PLANNER', 'SUPERVISOR', 'PILOT'] as const),
});

type UserFormValues = z.infer<typeof userSchema>;

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

/* ── Component ──────────────────────────────────────────────────────────── */
export interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: UserData) => void;
  user: UserData | null;
}

export default function UserModal({ open, onClose, onSave, user }: UserModalProps) {
  const isEdit = Boolean(user);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'PILOT',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
            }
          : {
              firstName: '',
              lastName: '',
              email: '',
              role: 'PILOT',
            },
      );
    }
  }, [user, open, reset]);

  const onSubmit = (values: UserFormValues) => {
    onSave({
      id: user?.id,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password || undefined,
      role: values.role,
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
          background: `linear-gradient(135deg, ${aeroColors.surfaceContainerHigh} 0%, ${aeroColors.surfaceContainerHighest} 55%, ${aeroColors.primaryContainer}50 100%)`,
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 90%, ${aeroColors.primary}1c 0%, transparent 65%)`,
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
            <PersonOutlinedIcon sx={{ fontSize: 24, color: aeroColors.primary }} />
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
            {isEdit ? 'Edycja użytkownika' : 'Nowy użytkownik'}
          </Typography>
          {isEdit && user && (
            <Typography
              sx={{
                ...SECTION_LABEL_SX,
                fontSize: '0.5625rem',
                mt: 0.25,
              }}
            >
              {user.email}
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
        {/* Imię + Nazwisko — side by side */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Imię</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="np. Jan"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              sx={INPUT_SX}
              {...register('firstName')}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Nazwisko</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="np. Kowalski"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              sx={INPUT_SX}
              {...register('lastName')}
            />
          </Box>
        </Box>

        {/* Email */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Email / login</Typography>
          <TextField
            size="small"
            fullWidth
            type="email"
            placeholder="np. j.kowalski@aero.pl"
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={INPUT_SX}
            {...register('email')}
          />
        </Box>

        {/* Hasło */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>
            {user ? 'Nowe hasło (opcjonalne)' : 'Hasło'}
          </Typography>
          <TextField
            size="small"
            fullWidth
            type="password"
            placeholder={user ? 'Pozostaw puste aby nie zmieniać' : 'Wymagane przy tworzeniu'}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={INPUT_SX}
            {...register('password')}
          />
        </Box>

        {/* Rola */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Rola</Typography>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                select
                error={!!errors.role}
                helperText={errors.role?.message}
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
                    const cfg = ROLE_CONFIG[val as UserRole];
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
                          {cfg?.label}
                        </Typography>
                      </Box>
                    );
                  },
                }}
              >
                {ROLE_OPTIONS.map((opt) => {
                  const cfg = ROLE_CONFIG[opt];
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
                          {cfg.label}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
            )}
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
            Użytkownik otrzyma dostęp do systemu zgodny z przypisaną rolą. Hasło
            zostanie ustawione przez administratora lub przesłane na podany adres email.
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
            {isEdit ? 'Zapisz zmiany' : 'Dodaj użytkownika'}
          </Button>
        </Box>

        <Box sx={{ pb: 0.5 }} />
      </Box>
    </Dialog>
  );
}
