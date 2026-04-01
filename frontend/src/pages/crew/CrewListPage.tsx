import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputBase,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import FlightIcon from '@mui/icons-material/Flight';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { z } from 'zod';
import { aeroColors } from '../../theme';
import { getCrewMembers, createCrewMember, updateCrewMember } from '../../api/crew.api';
import type { CrewMemberResponse, CrewRole } from '../../api/types';
import { useAuth } from '../../contexts/AuthContext';

/* ── Design tokens ─────────────────────────────────────────────────────── */
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

const TH_SX = {
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: aeroColors.onSurfaceVariant,
  bgcolor: aeroColors.surfaceBright,
  border: 'none',
  py: 1.75,
  px: 2,
  whiteSpace: 'nowrap' as const,
};

const TD_SX = {
  border: 'none',
  py: 1.5,
  px: 2,
  fontSize: '0.8125rem',
  color: aeroColors.onSurface,
};

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    bgcolor: aeroColors.surfaceContainerLowest,
    '& fieldset': { borderColor: `${aeroColors.outlineVariant}30` },
    '&:hover fieldset': { borderColor: `${aeroColors.outline}50` },
    '&.Mui-focused fieldset': { borderColor: `${aeroColors.tertiary}50`, borderWidth: 1 },
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
};

const FIELD_LABEL_SX = {
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: aeroColors.onSurfaceVariant,
  mb: 0.75,
};

/* ── Stat card ─────────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: string;
  sublabel?: string;
}

function StatCard({ label, value, icon, accent = aeroColors.primary, sublabel }: StatCardProps) {
  return (
    <Box
      sx={{
        ...GLASS_CARD,
        p: 2.5,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          bgcolor: accent,
          opacity: 0.7,
          borderRadius: '2px 2px 0 0',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ ...SECTION_LABEL_SX, mb: 1 }}>{label}</Typography>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              color: aeroColors.onSurface,
              lineHeight: 1,
              fontSize: '2.25rem',
            }}
          >
            {value}
          </Typography>
          {sublabel && (
            <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurfaceVariant, mt: 0.5 }}>
              {sublabel}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: `${accent}18`,
            border: `1px solid ${accent}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Box>
  );
}

/* ── Status badge ──────────────────────────────────────────────────────── */
type CrewStatusKey = 'Aktywny' | 'Nieaktywny' | 'Wygasła licencja' | 'Szkolenie wkrótce';

const STATUS_CONFIG: Record<CrewStatusKey, { color: string; bg: string }> = {
  Aktywny: {
    color: aeroColors.tertiary,
    bg: `${aeroColors.tertiary}18`,
  },
  'Szkolenie wkrótce': {
    color: aeroColors.secondary,
    bg: `${aeroColors.secondary}18`,
  },
  'Wygasła licencja': {
    color: aeroColors.error,
    bg: `${aeroColors.errorContainer}40`,
  },
  Nieaktywny: {
    color: aeroColors.onSurfaceVariant,
    bg: `${aeroColors.outlineVariant}40`,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as CrewStatusKey] ?? {
    color: aeroColors.onSurfaceVariant,
    bg: `${aeroColors.outlineVariant}40`,
  };
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.25,
        py: 0.4,
        borderRadius: 99,
        bgcolor: cfg.bg,
        border: `1px solid ${cfg.color}25`,
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          bgcolor: cfg.color,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: cfg.color,
          lineHeight: 1,
        }}
      >
        {status}
      </Typography>
    </Box>
  );
}

/* ── Role mapping ─────────────────────────────────────────────────────── */
const ROLE_LABEL: Record<CrewRole, string> = { PILOT: 'Pilot', OBSERVER: 'Obserwator' };
const ROLE_FROM_LABEL: Record<string, CrewRole> = { Pilot: 'PILOT', Obserwator: 'OBSERVER' };

function getInitials(first: string, last: string) {
  return `${(first[0] || '').toUpperCase()}${(last[0] || '').toUpperCase()}`;
}

function computeStatus(member: CrewMemberResponse): string {
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);

  if (member.role === 'PILOT' && member.licenseExpiryDate) {
    if (new Date(member.licenseExpiryDate) < now) return 'Wygasła licencja';
  }
  if (member.trainingExpiryDate) {
    const td = new Date(member.trainingExpiryDate);
    if (td < now) return 'Nieaktywny';
    if (td < soon) return 'Szkolenie wkrótce';
  }
  return 'Aktywny';
}

/* ── Crew member mini card ─────────────────────────────────────────────── */
interface CrewCardProps {
  initials: string;
  name: string;
  role: string;
  status: string;
  accent: string;
}

function CrewMemberCard({ initials, name, role, status, accent }: CrewCardProps) {
  return (
    <Box
      sx={{
        ...GLASS_CARD,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.25,
        textAlign: 'center',
        transition: 'background 0.15s ease',
        '&:hover': {
          background: `rgba(40, 42, 45, 0.8)`,
        },
      }}
    >
      <Avatar
        sx={{
          width: 48,
          height: 48,
          bgcolor: `${accent}20`,
          color: accent,
          border: `1.5px solid ${accent}35`,
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          fontSize: '1rem',
          letterSpacing: '0.04em',
        }}
      >
        {initials}
      </Avatar>
      <Box>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: aeroColors.onSurface,
            lineHeight: 1.3,
          }}
        >
          {name}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: aeroColors.outline,
            mt: 0.25,
          }}
        >
          {role}
        </Typography>
      </Box>
      <StatusBadge status={status} />
    </Box>
  );
}

/* ── Hero image for crew modal ────────────────────────────────────────── */
const CREW_HERO_IMG =
  'https://kursyszkolenia.online/wp-content/uploads/2025/03/Personel-pokladowy-stewardessa-zarobki.jpg';

const ROLE_OPTIONS = ['Pilot', 'Obserwator'] as const;

/* ── Zod validation schema ────────────────────────────────────────────── */
const EMAIL_REGEX = /^[a-zA-Z0-9.@-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const crewMemberSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Imię jest wymagane')
      .max(100, 'Imię może mieć max. 100 znaków'),
    lastName: z
      .string()
      .min(1, 'Nazwisko jest wymagane')
      .max(100, 'Nazwisko może mieć max. 100 znaków'),
    email: z
      .string()
      .min(1, 'Email jest wymagany')
      .max(100, 'Email może mieć max. 100 znaków')
      .regex(EMAIL_REGEX, 'Nieprawidłowy format adresu email'),
    role: z.enum(['Pilot', 'Obserwator']),
    weightKg: z
      .string()
      .min(1, 'Waga jest wymagana')
      .refine((v) => !isNaN(Number(v)), 'Waga musi być liczbą')
      .refine((v) => Number(v) >= 30, 'Minimalna waga to 30 kg')
      .refine((v) => Number(v) <= 200, 'Maksymalna waga to 200 kg'),
    pilotLicenseNumber: z.string(),
    licenseExpiry: z.string(),
    trainingExpiry: z
      .string()
      .min(1, 'Data ważności szkolenia jest wymagana'),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'Pilot') {
      if (!data.pilotLicenseNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nr licencji jest wymagany dla pilota',
          path: ['pilotLicenseNumber'],
        });
      } else if (data.pilotLicenseNumber.length > 30) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nr licencji może mieć max. 30 znaków',
          path: ['pilotLicenseNumber'],
        });
      }
      if (!data.licenseExpiry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Data ważności licencji jest wymagana dla pilota',
          path: ['licenseExpiry'],
        });
      }
    }
  });

type FieldErrors = Partial<Record<string, string>>;

const ERROR_SX = {
  fontSize: '0.6875rem',
  color: aeroColors.error,
  mt: 0.5,
  lineHeight: 1.3,
};

const inputErrorSx = (hasError: boolean) =>
  hasError
    ? {
        ...INPUT_SX,
        '& .MuiOutlinedInput-root': {
          ...INPUT_SX['& .MuiOutlinedInput-root'],
          '& fieldset': { borderColor: `${aeroColors.error}60` },
          '&:hover fieldset': { borderColor: `${aeroColors.error}80` },
          '&.Mui-focused fieldset': { borderColor: aeroColors.error, borderWidth: 1 },
        },
      }
    : INPUT_SX;

/* ── Crew Member Modal ────────────────────────────────────────────────── */
interface CrewMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (member: CrewMemberResponse) => void;
  member: CrewMemberResponse | null;
}

function CrewMemberModal({ open, onClose, onSave, member }: CrewMemberModalProps) {
  const isEdit = Boolean(member);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('Pilot');
  const [weightKg, setWeightKg] = useState('');
  const [pilotLicenseNumber, setPilotLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [trainingExpiry, setTrainingExpiry] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setFirstName(member.firstName);
      setLastName(member.lastName);
      setEmail(member.email);
      setRole(ROLE_LABEL[member.role]);
      setWeightKg(String(member.weightKg));
      setPilotLicenseNumber(member.pilotLicenseNumber ?? '');
      setLicenseExpiry(member.licenseExpiryDate ?? '');
      setTrainingExpiry(member.trainingExpiryDate);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('Pilot');
      setWeightKg('');
      setPilotLicenseNumber('');
      setLicenseExpiry('');
      setTrainingExpiry('');
    }
    setErrors({});
  }, [member, open]);

  const isPilot = role === 'Pilot';

  // Alerts computation
  const alerts: { type: 'warning' | 'ok'; text: string }[] = [];
  if (licenseExpiry && isPilot) {
    const ld = new Date(licenseExpiry);
    if (ld < new Date()) {
      alerts.push({ type: 'warning', text: 'Licencja pilota wygasła' });
    } else {
      alerts.push({ type: 'ok', text: 'Licencja pilota ważna' });
    }
  }
  if (trainingExpiry) {
    const td = new Date(trainingExpiry);
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    if (td < now) {
      alerts.push({ type: 'warning', text: 'Szkolenie wygasło' });
    } else if (td < soon) {
      alerts.push({ type: 'warning', text: 'Szkolenie wygasa w ciągu 30 dni' });
    } else {
      alerts.push({ type: 'ok', text: 'Szkolenie ważne' });
    }
  }
  if (weightKg) {
    const w = Number(weightKg);
    if (w < 30 || w > 200) {
      alerts.push({ type: 'warning', text: 'Waga poza zakresem (30–200 kg)' });
    }
  }

  const handleSave = async () => {
    const result = crewMemberSchema.safeParse({
      firstName,
      lastName,
      email,
      role,
      weightKg,
      pilotLicenseNumber,
      licenseExpiry,
      trainingExpiry,
    });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const apiRole = ROLE_FROM_LABEL[role] ?? 'PILOT';
      const payload = {
        firstName,
        lastName,
        email,
        role: apiRole,
        weightKg: Number(weightKg) || 0,
        pilotLicenseNumber: isPilot ? pilotLicenseNumber : undefined,
        licenseExpiryDate: isPilot ? licenseExpiry : undefined,
        trainingExpiryDate: trainingExpiry,
      };
      const saved = isEdit && member
        ? await updateCrewMember(member.id, payload)
        : await createCrewMember(payload);
      onSave(saved);
      onClose();
    } catch (err) {
      console.error('Failed to save crew member:', err);
    } finally {
      setSaving(false);
    }
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
      {/* ── Hero image ── */}
      <Box
        sx={{
          height: 160,
          backgroundImage: `url(${CREW_HERO_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
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
            {isEdit ? 'Edycja członka załogi' : 'Nowy członek załogi'}
          </Typography>
          <Typography
            sx={{
              ...SECTION_LABEL_SX,
              fontSize: '0.5625rem',
              mt: 0.25,
            }}
          >
            {isEdit && member
              ? `Edycja: ${member.firstName} ${member.lastName}`
              : 'Rejestruj personel w systemie AERO'}
          </Typography>
        </Box>
      </Box>

      {/* ── Form fields ── */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          overflowY: 'auto',
        }}
      >
        {/* Imię i Nazwisko — row */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Imię</Typography>
            <TextField
              size="small"
              fullWidth
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: undefined })); }}
              placeholder="np. Andrzej"
              inputProps={{ maxLength: 100 }}
              sx={inputErrorSx(!!errors.firstName)}
            />
            {errors.firstName && <Typography sx={ERROR_SX}>{errors.firstName}</Typography>}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={FIELD_LABEL_SX}>Nazwisko</Typography>
            <TextField
              size="small"
              fullWidth
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: undefined })); }}
              placeholder="np. Kwiatkowski"
              inputProps={{ maxLength: 100 }}
              sx={inputErrorSx(!!errors.lastName)}
            />
            {errors.lastName && <Typography sx={ERROR_SX}>{errors.lastName}</Typography>}
          </Box>
        </Box>

        {/* Email */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Email</Typography>
          <TextField
            size="small"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="np. a.kwiatkowski@aero.pl"
            inputProps={{ maxLength: 100 }}
            sx={inputErrorSx(!!errors.email)}
          />
          {errors.email && <Typography sx={ERROR_SX}>{errors.email}</Typography>}
        </Box>

        {/* Rola */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Rola</Typography>
          <TextField
            size="small"
            fullWidth
            select
            value={role}
            onChange={(e) => setRole(e.target.value)}
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
                const isPilotVal = val === 'Pilot';
                const col = isPilotVal ? aeroColors.tertiary : aeroColors.secondary;
                return (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: col,
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
                        color: col,
                      }}
                    >
                      {val as string}
                    </Typography>
                  </Box>
                );
              },
            }}
          >
            {ROLE_OPTIONS.map((opt) => {
              const col = opt === 'Pilot' ? aeroColors.tertiary : aeroColors.secondary;
              return (
                <MenuItem key={opt} value={opt}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: col,
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: col }}>
                      {opt}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}
          </TextField>
        </Box>

        {/* Waga */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Waga</Typography>
          <TextField
            size="small"
            fullWidth
            type="number"
            value={weightKg}
            onChange={(e) => { setWeightKg(e.target.value); setErrors((p) => ({ ...p, weightKg: undefined })); }}
            placeholder="np. 80"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, fontWeight: 600 }}>
                    KG
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={inputErrorSx(!!errors.weightKg)}
          />
          {errors.weightKg && <Typography sx={ERROR_SX}>{errors.weightKg}</Typography>}
        </Box>

        {/* Conditional pilot fields */}
        {isPilot && (
          <>
            <Box>
              <Typography sx={FIELD_LABEL_SX}>Nr licencji pilota</Typography>
              <TextField
                size="small"
                fullWidth
                value={pilotLicenseNumber}
                onChange={(e) => { setPilotLicenseNumber(e.target.value); setErrors((p) => ({ ...p, pilotLicenseNumber: undefined })); }}
                placeholder="np. PL-12345"
                inputProps={{ maxLength: 30 }}
                sx={inputErrorSx(!!errors.pilotLicenseNumber)}
              />
              {errors.pilotLicenseNumber && <Typography sx={ERROR_SX}>{errors.pilotLicenseNumber}</Typography>}
            </Box>

            <Box>
              <Typography sx={FIELD_LABEL_SX}>Data ważności licencji</Typography>
              <TextField
                size="small"
                fullWidth
                type="date"
                value={licenseExpiry}
                onChange={(e) => { setLicenseExpiry(e.target.value); setErrors((p) => ({ ...p, licenseExpiry: undefined })); }}
                InputLabelProps={{ shrink: true }}
                sx={inputErrorSx(!!errors.licenseExpiry)}
              />
              {errors.licenseExpiry && <Typography sx={ERROR_SX}>{errors.licenseExpiry}</Typography>}
            </Box>
          </>
        )}

        {/* Data ważności szkolenia */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Data ważności szkolenia</Typography>
          <TextField
            size="small"
            fullWidth
            type="date"
            value={trainingExpiry}
            onChange={(e) => { setTrainingExpiry(e.target.value); setErrors((p) => ({ ...p, trainingExpiry: undefined })); }}
            InputLabelProps={{ shrink: true }}
            sx={inputErrorSx(!!errors.trainingExpiry)}
          />
          {errors.trainingExpiry && <Typography sx={ERROR_SX}>{errors.trainingExpiry}</Typography>}
        </Box>

        {/* ── Alerty i sprawdzenie ── */}
        {alerts.length > 0 && (
          <Box>
            <Typography
              sx={{
                ...FIELD_LABEL_SX,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                mb: 1.25,
              }}
            >
              Alerty i sprawdzenie
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {alerts.map((alert, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor:
                      alert.type === 'warning'
                        ? `${aeroColors.secondary}10`
                        : `${aeroColors.tertiary}10`,
                    border: `1px solid ${
                      alert.type === 'warning'
                        ? `${aeroColors.secondary}25`
                        : `${aeroColors.tertiary}25`
                    }`,
                  }}
                >
                  {alert.type === 'warning' ? (
                    <WarningAmberOutlinedIcon
                      sx={{ fontSize: 16, color: aeroColors.secondary, flexShrink: 0 }}
                    />
                  ) : (
                    <CheckCircleOutlineIcon
                      sx={{ fontSize: 16, color: aeroColors.tertiary, flexShrink: 0 }}
                    />
                  )}
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color:
                        alert.type === 'warning' ? aeroColors.secondary : aeroColors.tertiary,
                    }}
                  >
                    {alert.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ── Action buttons ── */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
          <Button
            fullWidth
            variant="outlined"
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
            onClick={handleSave}
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
            {isEdit ? 'Zapisz zmiany' : 'Dodaj członka do bazy'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

const CARD_ACCENT_PALETTE = [aeroColors.primary, aeroColors.tertiary, aeroColors.error, aeroColors.secondary];

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function CrewListPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN';
  const [search, setSearch] = useState('');
  const [crewMembers, setCrewMembers] = useState<CrewMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMemberResponse | null>(null);

  const fetchCrewMembers = useCallback(async () => {
    try {
      setError(null);
      const data = await getCrewMembers();
      setCrewMembers(data);
    } catch (err) {
      console.error('Failed to fetch crew members:', err);
      setError('Nie udało się pobrać listy członków załogi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrewMembers();
  }, [fetchCrewMembers]);

  const openAdd = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const openEdit = (member: CrewMemberResponse) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  const handleSave = (member: CrewMemberResponse) => {
    setCrewMembers((prev) => {
      const exists = prev.find((m) => m.id === member.id);
      if (exists) {
        return prev.map((m) => (m.id === member.id ? member : m));
      }
      return [...prev, member];
    });
  };

  const filtered = crewMembers.filter((m) => {
    const q = search.toLowerCase();
    const roleLabel = ROLE_LABEL[m.role];
    const status = computeStatus(m);
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      roleLabel.toLowerCase().includes(q) ||
      status.toLowerCase().includes(q)
    );
  });

  const totalCount = crewMembers.length;
  const pilotsCount = crewMembers.filter((m) => m.role === 'PILOT').length;
  const observersCount = crewMembers.filter((m) => m.role === 'OBSERVER').length;
  const activeCount = crewMembers.filter((m) => computeStatus(m) === 'Aktywny').length;

  const formatDate = (iso: string) => {
    if (!iso || iso === '—') return '—';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: aeroColors.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 400, justifyContent: 'center' }}>
        <Typography sx={{ color: aeroColors.secondary }}>{error}</Typography>
        <Button variant="outlined" onClick={fetchCrewMembers} sx={{ color: aeroColors.primary, borderColor: aeroColors.primary }}>
          Spróbuj ponownie
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* ── Modal ── */}
      <CrewMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        member={editingMember}
      />

      {/* ── Page header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ ...SECTION_LABEL_SX, mb: 0.5 }}>
            Lista Personelu Operacyjnego
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: '1.5rem',
              color: aeroColors.onSurface,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Członkowie Załogi
          </Typography>
        </Box>
        {canEdit && (
        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={openAdd}
          sx={{
            background: `linear-gradient(135deg, ${aeroColors.primary} 0%, ${aeroColors.onPrimaryContainer} 100%)`,
            color: aeroColors.onPrimaryFixed,
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            px: 2.5,
            py: 1,
            borderRadius: 1,
            boxShadow: `0 4px 20px ${aeroColors.primaryContainer}60`,
            '&:hover': {
              background: `linear-gradient(135deg, ${aeroColors.primary} 0%, ${aeroColors.onPrimaryContainer} 100%)`,
              opacity: 0.9,
            },
          }}
        >
          Dodaj członka załogi
        </Button>
        )}
      </Box>

      {/* ── Stat cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Cała załoga"
            value={String(totalCount).padStart(2, '0')}
            icon={<PeopleOutlinedIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.primary}
            sublabel="Zarejestrowanych członków"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Piloci"
            value={String(pilotsCount).padStart(2, '0')}
            icon={<FlightIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.tertiary}
            sublabel="Licencjonowani piloci"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Obserwatorzy"
            value={String(observersCount).padStart(2, '0')}
            icon={<VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.secondary}
            sublabel="Przeszkoleni obserwatorzy"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Aktywni"
            value={String(activeCount).padStart(2, '0')}
            icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 20 }} />}
            accent="#4caf50"
            sublabel="Gotowych do lotów"
          />
        </Grid>
      </Grid>

      {/* ── Crew member cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {crewMembers.slice(0, 4).map((member, idx) => (
          <Grid key={member.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <CrewMemberCard
              initials={getInitials(member.firstName, member.lastName)}
              name={`${member.firstName} ${member.lastName}`}
              role={ROLE_LABEL[member.role]}
              status={computeStatus(member)}
              accent={CARD_ACCENT_PALETTE[idx % CARD_ACCENT_PALETTE.length]}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Table panel ── */}
      <Box sx={{ ...GLASS_CARD }}>

        {/* Panel header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: `1px solid ${aeroColors.outlineVariant}1a`,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: aeroColors.onSurface,
                letterSpacing: '0.02em',
              }}
            >
              Rejestr załogi
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, mt: 0.25 }}>
              {filtered.length} z {crewMembers.length} członków
            </Typography>
          </Box>

          {/* Search */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: aeroColors.surfaceContainerLowest,
              border: `1px solid ${aeroColors.outlineVariant}30`,
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              minWidth: 220,
            }}
          >
            <SearchOutlinedIcon sx={{ fontSize: 16, color: aeroColors.outline, flexShrink: 0 }} />
            <InputBase
              placeholder="Szukaj członka załogi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                fontSize: '0.8125rem',
                color: aeroColors.onSurface,
                flex: 1,
                '& input::placeholder': {
                  color: `${aeroColors.outline}80`,
                  opacity: 1,
                },
              }}
            />
          </Box>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...TH_SX, width: '22%' }}>Imię i Nazwisko</TableCell>
                <TableCell sx={{ ...TH_SX, width: '24%' }}>Email</TableCell>
                <TableCell sx={{ ...TH_SX, width: '12%' }}>Rola</TableCell>
                <TableCell sx={{ ...TH_SX, width: '16%' }}>Ważność licencji</TableCell>
                <TableCell sx={{ ...TH_SX, width: '14%' }}>Szkolenie do</TableCell>
                <TableCell sx={{ ...TH_SX, width: '10%' }}>Status</TableCell>
                <TableCell sx={{ ...TH_SX, width: '8%', textAlign: 'right' }}>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((member, idx) => (
                <TableRow
                  key={member.id}
                  sx={{
                    bgcolor:
                      idx % 2 === 0
                        ? aeroColors.surfaceContainerLowest
                        : aeroColors.surfaceContainerLow,
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      bgcolor: `${aeroColors.primary}0a`,
                    },
                  }}
                >
                  <TableCell sx={TD_SX}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: `${CARD_ACCENT_PALETTE[idx % CARD_ACCENT_PALETTE.length]}20`,
                          color: CARD_ACCENT_PALETTE[idx % CARD_ACCENT_PALETTE.length],
                          border: `1px solid ${CARD_ACCENT_PALETTE[idx % CARD_ACCENT_PALETTE.length]}30`,
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          fontFamily: '"Space Grotesk", sans-serif',
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(member.firstName, member.lastName)}
                      </Avatar>
                      <Typography
                        sx={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          color: aeroColors.primary,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {member.firstName} {member.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color: aeroColors.onSurfaceVariant,
                        fontFamily: '"Inter", monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {member.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: member.role === 'PILOT' ? aeroColors.tertiary : aeroColors.secondary,
                      }}
                    >
                      {ROLE_LABEL[member.role]}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color:
                          !member.licenseExpiryDate
                            ? aeroColors.outline
                            : computeStatus(member) === 'Wygasła licencja'
                            ? aeroColors.error
                            : aeroColors.onSurfaceVariant,
                        fontFamily: '"Inter", monospace',
                      }}
                    >
                      {member.licenseExpiryDate ? formatDate(member.licenseExpiryDate) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color:
                          computeStatus(member) === 'Szkolenie wkrótce'
                            ? aeroColors.secondary
                            : aeroColors.onSurfaceVariant,
                        fontFamily: '"Inter", monospace',
                      }}
                    >
                      {formatDate(member.trainingExpiryDate)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <StatusBadge status={computeStatus(member)} />
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, textAlign: 'right' }}>
                    {canEdit && (
                    <Tooltip title="Edytuj" placement="left">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(member)}
                        sx={{
                          color: aeroColors.outline,
                          borderRadius: 1,
                          '&:hover': {
                            color: aeroColors.tertiary,
                            bgcolor: `${aeroColors.tertiary}12`,
                          },
                        }}
                      >
                        <EditOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    sx={{
                      ...TD_SX,
                      textAlign: 'center',
                      py: 5,
                      color: aeroColors.outline,
                      fontSize: '0.8125rem',
                    }}
                  >
                    Brak wyników dla podanej frazy.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${aeroColors.outlineVariant}1a`,
          }}
        >
          <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, letterSpacing: '0.08em' }}>
            Łącznie: {crewMembers.length} członków załogi w rejestrze
          </Typography>
          <Typography
            sx={{
              fontSize: '0.625rem',
              color: `${aeroColors.outline}60`,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Ostatnia aktualizacja: dziś, 14:32
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
