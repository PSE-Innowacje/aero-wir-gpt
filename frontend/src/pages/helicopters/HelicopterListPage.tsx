import { useState } from 'react';
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
} from '@mui/material';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
const HELICOPTERS = [
  {
    id: 1,
    registration: 'SP-AER1',
    type: 'Airbus H145',
    status: 'Aktywny',
    inspectionExpiry: '24.12.2024',
    rangeKm: 650,
  },
  {
    id: 2,
    registration: 'SP-AER2',
    type: 'Bell 429',
    status: 'Aktywny',
    inspectionExpiry: '15.11.2024',
    rangeKm: 710,
  },
  {
    id: 3,
    registration: 'SP-MAINT',
    type: 'Eurocopter EC135',
    status: 'Nieaktywny',
    inspectionExpiry: '02.10.2023',
    rangeKm: 635,
  },
  {
    id: 4,
    registration: 'SP-AER3',
    type: 'Robinson R44',
    status: 'Aktywny',
    inspectionExpiry: '10.05.2025',
    rangeKm: 560,
  },
  {
    id: 5,
    registration: 'SP-AER4',
    type: 'Leonardo AW139',
    status: 'Aktywny',
    inspectionExpiry: '30.01.2025',
    rangeKm: 1060,
  },
];

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function HelicopterListPage() {
  const [search, setSearch] = useState('');

  const filtered = HELICOPTERS.filter(
    (h) =>
      h.registration.toLowerCase().includes(search.toLowerCase()) ||
      h.type.toLowerCase().includes(search.toLowerCase()) ||
      h.status.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = HELICOPTERS.length;
  const activeCount = HELICOPTERS.filter((h) => h.status === 'Aktywny').length;
  const maintenanceCount = HELICOPTERS.filter(
    (h) => h.status === 'Nieaktywny' || h.status === 'W naprawie',
  ).length;
  const availabilityPct = Math.round((activeCount / totalCount) * 100);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

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
              {filtered.length} z {HELICOPTERS.length} jednostek
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
                      {heli.inspectionExpiry}
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
            Łącznie: {HELICOPTERS.length} helikopterów w rejestrze
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
