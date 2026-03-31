import { useState, useEffect } from 'react';
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
  Dialog,
  TextField,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { aeroColors } from '../../theme';

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

/* ── Status config ────────────────────────────────────────────────────── */
type StatusKey = 'Aktywny' | 'Nieaktywny' | 'W naprawie';

const STATUS_CONFIG: Record<StatusKey, { color: string; bg: string }> = {
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

const STATUS_OPTIONS: StatusKey[] = ['Aktywny', 'Nieaktywny', 'W naprawie'];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as StatusKey] ?? {
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

/* ── Mock data ─────────────────────────────────────────────────────────── */
interface Helicopter {
  id: number;
  registration: string;
  type: string;
  status: string;
  inspectionExpiry: string;
  rangeKm: number;
  maxCrewWeightKg: number;
}

const HELICOPTERS_INIT: Helicopter[] = [
  { id: 1, registration: 'SP-AER1', type: 'Airbus H145', status: 'Aktywny', inspectionExpiry: '2024-12-24', rangeKm: 650, maxCrewWeightKg: 480 },
  { id: 2, registration: 'SP-AER2', type: 'Bell 429', status: 'Aktywny', inspectionExpiry: '2024-11-15', rangeKm: 710, maxCrewWeightKg: 520 },
  { id: 3, registration: 'SP-MAINT', type: 'Eurocopter EC135', status: 'Nieaktywny', inspectionExpiry: '2023-10-02', rangeKm: 635, maxCrewWeightKg: 450 },
  { id: 4, registration: 'SP-AER3', type: 'Robinson R44', status: 'Aktywny', inspectionExpiry: '2025-05-10', rangeKm: 560, maxCrewWeightKg: 340 },
  { id: 5, registration: 'SP-AER4', type: 'Leonardo AW139', status: 'Aktywny', inspectionExpiry: '2025-01-30', rangeKm: 1060, maxCrewWeightKg: 600 },
];

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZxqWR9uO8aCwvOvyQgic2ZcxAAGBPWOvW6UP75Za8lzn5yfNXWmOBu9viOQvZiglIaHBs_blFZSavL5938cXtZXf_PFkyWCkSfzKMBEeu9PHy3ZmUYUvhrXaKd_hB5ADjhL3NQbpiB7LytJdZW8j_bP6wUmtRwwL3Y4QlTDzqJSE8wHMt3kzNa75DvXsD2v907DAoATmVsaLRWel2IIeVKX406nwiSjKqV73ectOOFB8_leSElVYw45zzSjWnd9RwPlyQZXEv77Ns';

/* ── Helicopter Form Modal ────────────────────────────────────────────── */
interface HelicopterModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (heli: Helicopter) => void;
  helicopter: Helicopter | null;
}

function HelicopterModal({ open, onClose, onSave, helicopter }: HelicopterModalProps) {
  const isEdit = Boolean(helicopter);

  const [registration, setRegistration] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState<string>('Aktywny');
  const [inspectionExpiry, setInspectionExpiry] = useState('');
  const [rangeKm, setRangeKm] = useState('');
  const [maxCrewWeightKg, setMaxCrewWeightKg] = useState('');
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    if (!open) { setMusicOn(false); return; }
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
    if (helicopter) {
      setRegistration(helicopter.registration);
      setType(helicopter.type);
      setStatus(helicopter.status);
      setInspectionExpiry(helicopter.inspectionExpiry);
      setRangeKm(String(helicopter.rangeKm));
      setMaxCrewWeightKg(String(helicopter.maxCrewWeightKg));
    } else {
      setRegistration('');
      setType('');
      setStatus('Aktywny');
      setInspectionExpiry('');
      setRangeKm('');
      setMaxCrewWeightKg('');
    }
  }, [helicopter, open]);

  const handleSave = () => {
    onSave({
      id: helicopter?.id ?? Date.now(),
      registration,
      type,
      status,
      inspectionExpiry,
      rangeKm: Number(rangeKm) || 0,
      maxCrewWeightKg: Number(maxCrewWeightKg) || 0,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionProps={{
        onExited: () => {
          // iframe gets unmounted automatically when open=false
        },
      }}
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
      {/* ── Background music (Ctrl/Cmd+H to toggle) ── */}
      {musicOn && (
        <iframe
          src="https://www.youtube.com/embed/a0DbzUe-r4Q?autoplay=1&loop=1&playlist=a0DbzUe-r4Q&controls=0"
          allow="autoplay"
          style={{ position: 'absolute', width: 0, height: 0, border: 'none', opacity: 0 }}
          title="background-music"
        />
      )}

      {/* ── Hero image ── */}
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
        {/* Close button */}
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

        {/* Title overlay */}
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
        {/* Numer rejestracyjny */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Numer rejestracyjny</Typography>
          <TextField
            size="small"
            fullWidth
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder="np. SP-AER1"
            sx={INPUT_SX}
          />
        </Box>

        {/* Typ helikoptera */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Typ helikoptera</Typography>
          <TextField
            size="small"
            fullWidth
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="np. Airbus H145"
            sx={INPUT_SX}
          />
        </Box>

        {/* Status */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Status</Typography>
          <TextField
            size="small"
            fullWidth
            select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
        </Box>

        {/* Zasięg */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Zasięg</Typography>
          <TextField
            size="small"
            fullWidth
            type="number"
            value={rangeKm}
            onChange={(e) => setRangeKm(e.target.value)}
            placeholder="np. 650"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, fontWeight: 600 }}>
                    KM
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={INPUT_SX}
          />
        </Box>

        {/* Data ważności przeglądu */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Data ważności przeglądu</Typography>
          <TextField
            size="small"
            fullWidth
            type="date"
            value={inspectionExpiry}
            onChange={(e) => setInspectionExpiry(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={INPUT_SX}
          />
        </Box>

        {/* Maksymalny limit wagi */}
        <Box>
          <Typography sx={FIELD_LABEL_SX}>Maksymalny limit wagi</Typography>
          <TextField
            size="small"
            fullWidth
            type="number"
            value={maxCrewWeightKg}
            onChange={(e) => setMaxCrewWeightKg(e.target.value)}
            placeholder="np. 480"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, fontWeight: 600 }}>
                    KG
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={INPUT_SX}
          />
        </Box>

        {/* ── Info note ── */}
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
            {isEdit ? 'Zapisz zmiany' : 'Dodaj helikopter'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function HelicopterListPage() {
  const [search, setSearch] = useState('');
  const [helicopters, setHelicopters] = useState<Helicopter[]>(HELICOPTERS_INIT);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHeli, setEditingHeli] = useState<Helicopter | null>(null);

  const openAdd = () => {
    setEditingHeli(null);
    setModalOpen(true);
  };

  const openEdit = (heli: Helicopter) => {
    setEditingHeli(heli);
    setModalOpen(true);
  };

  const handleSave = (heli: Helicopter) => {
    setHelicopters((prev) => {
      const exists = prev.find((h) => h.id === heli.id);
      if (exists) {
        return prev.map((h) => (h.id === heli.id ? heli : h));
      }
      return [...prev, heli];
    });
  };

  const filtered = helicopters.filter(
    (h) =>
      h.registration.toLowerCase().includes(search.toLowerCase()) ||
      h.type.toLowerCase().includes(search.toLowerCase()) ||
      h.status.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = helicopters.length;
  const activeCount = helicopters.filter((h) => h.status === 'Aktywny').length;
  const maintenanceCount = helicopters.filter(
    (h) => h.status === 'Nieaktywny' || h.status === 'W naprawie',
  ).length;
  const availabilityPct = Math.round((activeCount / totalCount) * 100);

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* ── Modal ── */}
      <HelicopterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        helicopter={editingHeli}
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
          <Typography
            sx={{
              ...SECTION_LABEL_SX,
              mb: 0.5,
            }}
          >
            Zarządzanie flotą
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
            Helikoptery
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
          Dodaj helikopter
        </Button>
      </Box>

      {/* ── Stat cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Całkowita flota"
            value={String(totalCount).padStart(2, '0')}
            icon={<AirplanemodeActiveIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.primary}
            sublabel="Zarejestrowanych jednostek"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="W powietrzu"
            value="02"
            icon={<FlightTakeoffIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.tertiary}
            sublabel="Aktywnych lotów"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Przegląd (pilne)"
            value={String(maintenanceCount).padStart(2, '0')}
            icon={<BuildOutlinedIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.secondary}
            sublabel="Wymaga uwagi"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Dostępność"
            value={`${availabilityPct}%`}
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
            accent="#4caf50"
            sublabel="Flota operacyjna"
          />
        </Grid>
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
              Rejestr floty
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, mt: 0.25 }}>
              {filtered.length} z {helicopters.length} jednostek
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
              placeholder="Szukaj helikoptera..."
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
                <TableCell sx={{ ...TH_SX, width: '18%' }}>Numer rejestracyjny</TableCell>
                <TableCell sx={{ ...TH_SX, width: '24%' }}>Typ helikoptera</TableCell>
                <TableCell sx={{ ...TH_SX, width: '14%' }}>Status</TableCell>
                <TableCell sx={{ ...TH_SX, width: '18%' }}>Ważność przeglądu</TableCell>
                <TableCell sx={{ ...TH_SX, width: '14%' }}>Zasięg (km)</TableCell>
                <TableCell sx={{ ...TH_SX, width: '12%', textAlign: 'right' }}>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((heli, idx) => (
                <TableRow
                  key={heli.id}
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
                    <Typography
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        letterSpacing: '0.06em',
                        color: aeroColors.primary,
                      }}
                    >
                      {heli.registration}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography sx={{ fontSize: '0.8125rem', color: aeroColors.onSurface }}>
                      {heli.type}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <StatusBadge status={heli.status} />
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color:
                          heli.status === 'Nieaktywny'
                            ? aeroColors.secondary
                            : aeroColors.onSurfaceVariant,
                        fontFamily: '"Inter", monospace',
                      }}
                    >
                      {formatDate(heli.inspectionExpiry)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color: aeroColors.onSurface,
                        fontFamily: '"Inter", monospace',
                      }}
                    >
                      {heli.rangeKm.toLocaleString('pl-PL')} km
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, textAlign: 'right' }}>
                    <Tooltip title="Edytuj" placement="left">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(heli)}
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
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
            Łącznie: {helicopters.length} helikopterów w rejestrze
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
