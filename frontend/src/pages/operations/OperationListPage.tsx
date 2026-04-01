import { useState, useEffect, useCallback } from 'react';
import OperationModal, { type OperationData, type OperationStatus } from '../../components/modals/OperationModal';
import { getOperations } from '../../api/operations.api';
import type { OperationListResponse } from '../../api/types';
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
  LinearProgress,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ElectricalServicesOutlinedIcon from '@mui/icons-material/ElectricalServicesOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import AirplanemodeActiveOutlinedIcon from '@mui/icons-material/AirplanemodeActiveOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import { aeroColors } from '../../theme';
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

/* ── Status config ──────────────────────────────────────────────────────── */
type StatusKey =
  | 'Wprowadzone'
  | 'Odrzucone'
  | 'Potwierdzone'
  | 'Zaplanowane'
  | 'Częściowo zrealizowane'
  | 'Zrealizowane'
  | 'Rezygnacja';

const STATUS_CONFIG: Record<StatusKey, { color: string; bg: string }> = {
  Wprowadzone:             { color: aeroColors.primary,         bg: `${aeroColors.primary}18` },
  Odrzucone:               { color: aeroColors.error,           bg: `${aeroColors.errorContainer}40` },
  Potwierdzone:            { color: aeroColors.tertiary,        bg: `${aeroColors.tertiary}18` },
  Zaplanowane:             { color: '#4caf50',                  bg: 'rgba(76,175,80,0.12)' },
  'Częściowo zrealizowane':{ color: aeroColors.secondary,       bg: `${aeroColors.secondary}18` },
  Zrealizowane:            { color: '#4caf50',                  bg: 'rgba(76,175,80,0.18)' },
  Rezygnacja:              { color: aeroColors.onSurfaceVariant,bg: `${aeroColors.outlineVariant}40` },
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
        whiteSpace: 'nowrap',
      }}
    >
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
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

/* ── Status tab button ─────────────────────────────────────────────────── */
interface TabBtnProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent?: string;
}

function TabBtn({ label, count, active, onClick, accent = aeroColors.tertiary }: TabBtnProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: active ? `${accent}14` : 'transparent',
        border: `1px solid ${active ? accent + '35' : 'transparent'}`,
        transition: 'all 0.15s ease',
        '&:hover': { bgcolor: `${accent}0e` },
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: active ? 700 : 500,
          fontSize: '0.8125rem',
          color: active ? accent : aeroColors.onSurfaceVariant,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          minWidth: 20,
          height: 18,
          px: 0.75,
          borderRadius: 1,
          bgcolor: active ? `${accent}25` : `${aeroColors.outlineVariant}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: active ? accent : aeroColors.outline,
            lineHeight: 1,
          }}
        >
          {count}
        </Typography>
      </Box>
    </Box>
  );
}

/* ── Operation quick-card ───────────────────────────────────────────────── */
interface OpCardProps {
  icon: React.ReactNode;
  name: string;
  opId: string;
  status: StatusKey;
  actionLabel?: string;
  accent: string;
}

function OperationCard({ icon, name, opId, status, actionLabel, accent }: OpCardProps) {
  return (
    <Box
      sx={{
        ...GLASS_CARD,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'background 0.15s ease',
        '&:hover': { background: 'rgba(40, 42, 45, 0.8)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: `${accent}18`,
            border: `1px solid ${accent}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <StatusBadge status={status} />
      </Box>

      <Box>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: aeroColors.onSurface,
            lineHeight: 1.3,
          }}
        >
          {name}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter", monospace',
            fontSize: '0.625rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: aeroColors.outline,
            mt: 0.25,
          }}
        >
          {opId}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
        {actionLabel ? (
          <Button
            size="small"
            sx={{
              bgcolor: `${accent}18`,
              color: accent,
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: '0.5625rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              border: `1px solid ${accent}25`,
              '&:hover': { bgcolor: `${accent}28` },
            }}
          >
            {actionLabel}
          </Button>
        ) : (
          <Box />
        )}
        <Tooltip title="Szczegóły" placement="top">
          <IconButton
            size="small"
            sx={{
              color: aeroColors.outline,
              borderRadius: 1,
              '&:hover': { color: aeroColors.primary, bgcolor: `${aeroColors.primary}12` },
            }}
          >
            <KeyboardArrowRightOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

/* ── Mock data ─────────────────────────────────────────────────────────── */
type ActivityType = 'Transport Medyczny' | 'Inspekcja Sieci' | 'Akcja SAR' | 'Dostawa Cargo' | 'Patrol Granicy' | 'Kalibracja Nawigacyjna';

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  'Transport Medyczny':      <LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />,
  'Inspekcja Sieci':         <ElectricalServicesOutlinedIcon sx={{ fontSize: 18 }} />,
  'Akcja SAR':               <TravelExploreOutlinedIcon sx={{ fontSize: 18 }} />,
  'Dostawa Cargo':           <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />,
  'Patrol Granicy':          <RouteOutlinedIcon sx={{ fontSize: 18 }} />,
  'Kalibracja Nawigacyjna':  <AirplanemodeActiveOutlinedIcon sx={{ fontSize: 18 }} />,
};

const ACTIVITY_ACCENTS: Record<ActivityType, string> = {
  'Transport Medyczny':      aeroColors.error,
  'Inspekcja Sieci':         aeroColors.secondary,
  'Akcja SAR':               aeroColors.tertiary,
  'Dostawa Cargo':           aeroColors.primary,
  'Patrol Granicy':          '#4caf50',
  'Kalibracja Nawigacyjna':  '#c084fc',
};

interface Operation {
  id: number;
  opNumber: string;
  orderNumber: string;
  activity: ActivityType;
  dateFrom: string;
  dateTo: string | null;
  plannedDateFrom: string | null;
  plannedDateTo: string | null;
  status: StatusKey;
  helicopter: string;
  priority: 'Wysoki' | 'Średni' | 'Niski';
  routeFrom: string;
  routeTo: string;
  distanceNm: number;
  flightTime: string;
  weather: string;
}

// TODO: UI CHANGES 2026-04-01 — Mock data replaced with API calls
// const OPERATIONS: Operation[] = [ ... 7 mock operations removed ... ];

/** Format ISO date (YYYY-MM-DD) to DD.MM.YYYY for display */
function fmtDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

/** Adapter: map API OperationListResponse to the UI Operation shape */
function toOperation(op: OperationListResponse, idx: number): Operation {
  return {
    id: idx + 1,
    opNumber: op.id.substring(0, 12),
    orderNumber: op.orderNumber,
    activity: op.activityTypes.map(t => t.replace(/_/g, ' ')).join(', ') || '—',
    dateFrom: fmtDate(op.proposedDateEarliest) ?? '—',
    dateTo: fmtDate(op.proposedDateLatest) ?? null,
    plannedDateFrom: fmtDate(op.plannedDateEarliest) ?? null,
    plannedDateTo: fmtDate(op.plannedDateLatest) ?? null,
    status: (op.statusLabel ?? 'Wprowadzone') as StatusKey,
    helicopter: '—',
    priority: '—',
    routeFrom: '—',
    routeTo: '—',
    distanceNm: 0,
    flightTime: '—',
    weather: '—',
  };
}

type TabKey = 'all' | 'Wprowadzone' | 'Potwierdzone' | 'Zaplanowane' | 'Zrealizowane';

// TODO: UI CHANGES 2026-04-01 — FEATURED_OPS now derived from live data (see component)
// const FEATURED_OPS = [
//   { op: OPERATIONS[0], actionLabel: undefined },
//   { op: OPERATIONS[1], actionLabel: 'Planuj' },
//   { op: OPERATIONS[2], actionLabel: 'Potwierdź' },
//   { op: OPERATIONS[3], actionLabel: 'Potwierdź' },
// ];

/* ── Edit helpers ──────────────────────────────────────────────────────── */
const STATUS_MAP: Record<StatusKey, OperationStatus> = {
  'Wprowadzone':            'SUBMITTED',
  'Odrzucone':              'REJECTED',
  'Potwierdzone':           'CONFIRMED',
  'Zaplanowane':            'SCHEDULED',
  'Częściowo zrealizowane': 'PARTIALLY_COMPLETED',
  'Zrealizowane':           'COMPLETED',
  'Rezygnacja':             'CANCELLED',
};

/** Convert DD.MM.YYYY → YYYY-MM-DD for date inputs */
function toDashDate(d: string): string {
  const [day, month, year] = d.split('.');
  return `${year}-${month}-${day}`;
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function OperationListPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'PLANNER' || user?.role === 'SUPERVISOR' || user?.role === 'SUPERUSER';
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [apiOps, setApiOps] = useState<OperationListResponse[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<OperationData | null>(null);

  const fetchOperations = useCallback(async () => {
    try {
      const data = await getOperations();
      setApiOps(data);
    } catch (err) {
      console.error('Failed to fetch operations:', err);
    }
  }, []);

  useEffect(() => { fetchOperations(); }, [fetchOperations]);

  const OPERATIONS = apiOps.map(toOperation);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const currentSelected = selectedOp ?? OPERATIONS[0] ?? null;

  const FEATURED_OPS = OPERATIONS.slice(0, 4).map((op, i) => ({
    op,
    actionLabel: i === 0 ? undefined : i <= 2 ? 'Potwierdź' : 'Planuj',
  }));

  const filtered = OPERATIONS.filter((op) => {
    const matchesTab =
      activeTab === 'all' ||
      op.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      op.opNumber.toLowerCase().includes(q) ||
      op.orderNumber.toLowerCase().includes(q) ||
      op.activity.toLowerCase().includes(q) ||
      op.status.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const tabCounts: Record<TabKey, number> = {
    all:            OPERATIONS.length,
    Wprowadzone:    OPERATIONS.filter((o) => o.status === 'Wprowadzone').length,
    Potwierdzone:   OPERATIONS.filter((o) => o.status === 'Potwierdzone').length,
    Zaplanowane:    OPERATIONS.filter((o) => o.status === 'Zaplanowane').length,
    Zrealizowane:   OPERATIONS.filter((o) => o.status === 'Zrealizowane').length,
  };

  const completedCount = OPERATIONS.filter((o) => o.status === 'Zrealizowane').length;
  const inProgressCount = OPERATIONS.filter((o) =>
    ['Potwierdzone', 'Zaplanowane', 'Częściowo zrealizowane'].includes(o.status)
  ).length;
  const planPct = Math.round((completedCount / OPERATIONS.length) * 100);

  const priorityColor = (p: string) =>
    p === 'Wysoki' ? aeroColors.error :
    p === 'Średni' ? aeroColors.secondary :
    aeroColors.outline;

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
          <Typography sx={{ ...SECTION_LABEL_SX, mb: 0.5 }}>
            Zarządzanie Operacjami
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
            Lista Operacji Lotniczych
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => { setEditingOperation(null); setModalOpen(true); }}
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
            Nowa operacja
          </Button>
        )}
      </Box>

      {/* ── Status tabs ── */}
      <Box
        sx={{
          ...GLASS_CARD,
          p: 1,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          {(
            [
              { key: 'all' as TabKey,          label: 'Wszystkie',   accent: aeroColors.primary },
              { key: 'Wprowadzone' as TabKey,   label: 'Wprowadzone', accent: aeroColors.primary },
              { key: 'Potwierdzone' as TabKey,  label: 'Potwierdzone',accent: aeroColors.tertiary },
              { key: 'Zaplanowane' as TabKey,   label: 'Zaplanowane', accent: '#4caf50' },
              { key: 'Zrealizowane' as TabKey,  label: 'Zrealizowane',accent: '#4caf50' },
            ] as const
          ).map(({ key, label, accent }) => (
            <TabBtn
              key={key}
              label={label}
              count={tabCounts[key]}
              active={activeTab === key}
              onClick={() => setActiveTab(key)}
              accent={accent}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pr: 1 }}>
          <FilterListOutlinedIcon sx={{ fontSize: 14, color: aeroColors.outline }} />
          <Typography sx={{ ...SECTION_LABEL_SX, letterSpacing: '0.12em', cursor: 'default' }}>
            Sortuj: Data
          </Typography>
        </Box>
      </Box>

      {/* ── Featured operation cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {FEATURED_OPS.map(({ op, actionLabel }) => (
          <Grid key={op.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <OperationCard
              icon={ACTIVITY_ICONS[op.activity]}
              name={op.activity}
              opId={op.opNumber}
              status={op.status}
              actionLabel={actionLabel}
              accent={ACTIVITY_ACCENTS[op.activity]}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Main content: table + side panel ── */}
      <Grid container spacing={2}>

        {/* Table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ ...GLASS_CARD }}>

            {/* Table header */}
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
                  Rejestr operacji
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, mt: 0.25 }}>
                  {filtered.length} z {OPERATIONS.length} operacji
                </Typography>
              </Box>
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
                  minWidth: 210,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 15, color: aeroColors.outline, flexShrink: 0 }} />
                <InputBase
                  placeholder="Szukaj operacji..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    fontSize: '0.8125rem',
                    color: aeroColors.onSurface,
                    flex: 1,
                    '& input::placeholder': { color: `${aeroColors.outline}80`, opacity: 1 },
                  }}
                />
              </Box>
            </Box>

            {/* Table */}
            <TableContainer>
              <Table size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...TH_SX, width: '13%' }}>Nr operacji</TableCell>
                    <TableCell sx={{ ...TH_SX, width: '13%' }}>Nr zlecenia</TableCell>
                    <TableCell sx={{ ...TH_SX, width: '18%' }}>Rodzaj czynności</TableCell>
                    <TableCell sx={{ ...TH_SX, width: '17%' }}>Proponowane daty</TableCell>
                    <TableCell sx={{ ...TH_SX, width: '17%' }}>Planowane daty</TableCell>
                    <TableCell sx={{ ...TH_SX, width: '14%' }}>Status</TableCell>
                    <TableCell sx={{ ...TH_SX, width: '8%', textAlign: 'right' }}>Akcje</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((op, idx) => (
                    <TableRow
                      key={op.id}
                      onClick={() => setSelectedOp(op)}
                      sx={{
                        bgcolor:
                          currentSelected?.id === op.id
                            ? `${aeroColors.primary}0d`
                            : idx % 2 === 0
                            ? aeroColors.surfaceContainerLowest
                            : aeroColors.surfaceContainerLow,
                        transition: 'background-color 0.15s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: `${aeroColors.primary}0a`,
                        },
                        ...(currentSelected?.id === op.id && {
                          borderLeft: `2px solid ${aeroColors.tertiary}`,
                        }),
                      }}
                    >
                      <TableCell sx={TD_SX}>
                        <Typography
                          sx={{
                            fontFamily: '"Space Grotesk", monospace',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            letterSpacing: '0.06em',
                            color: aeroColors.primary,
                          }}
                        >
                          {op.opNumber}
                        </Typography>
                      </TableCell>
                      <TableCell sx={TD_SX}>
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            fontFamily: '"Inter", monospace',
                            color: aeroColors.onSurfaceVariant,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {op.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell sx={TD_SX}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: ACTIVITY_ACCENTS[op.activity], display: 'flex', flexShrink: 0 }}>
                            {ACTIVITY_ICONS[op.activity]}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '0.8125rem',
                              color: aeroColors.onSurface,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {op.activity}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={TD_SX}>
                        <Typography sx={{ fontSize: '0.8125rem', color: aeroColors.onSurfaceVariant, fontFamily: '"Inter", monospace' }}>
                          {op.dateFrom}{op.dateTo ? ` – ${op.dateTo}` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={TD_SX}>
                        {op.plannedDateFrom ? (
                          <Typography sx={{ fontSize: '0.8125rem', color: aeroColors.onSurface, fontFamily: '"Inter", monospace' }}>
                            {op.plannedDateFrom}{op.plannedDateTo && op.plannedDateTo !== op.plannedDateFrom ? ` – ${op.plannedDateTo}` : ''}
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: '0.75rem', color: `${aeroColors.outline}60`, fontStyle: 'italic' }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={TD_SX}>
                        <StatusBadge status={op.status} />
                      </TableCell>
                      <TableCell sx={{ ...TD_SX, textAlign: 'right' }}>
                        {canEdit && (
                          <Tooltip title="Edytuj" placement="left">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingOperation({
                                  id:                 String(op.id),
                                  orderProjectNumber: op.orderNumber,
                                  shortDescription:   op.activity,
                                  activityTypes:      [op.activity],
                                  status:             STATUS_MAP[op.status],
                                  proposedDateFrom:   toDashDate(op.dateFrom),
                                  proposedDateTo:     op.dateTo ? toDashDate(op.dateTo) : undefined,
                                  routeLengthKm:      op.distanceNm,
                                });
                                setModalOpen(true);
                              }}
                              sx={{
                                color: aeroColors.outline,
                                borderRadius: 1,
                                '&:hover': { color: aeroColors.tertiary, bgcolor: `${aeroColors.tertiary}12` },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 15 }} />
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
                        sx={{ ...TD_SX, textAlign: 'center', py: 5, color: aeroColors.outline }}
                      >
                        Brak operacji spełniających kryteria.
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
                Łącznie: {OPERATIONS.length} operacji w rejestrze
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
                Ostatnia aktualizacja: dziś, 09:15
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Detail side panel */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Active route card */}
            <Box sx={{ ...GLASS_CARD, p: 2.5, position: 'relative', overflow: 'hidden' }}>
              {/* Ambient glow */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 160,
                  height: 160,
                  background: `radial-gradient(circle at center, ${aeroColors.tertiary}08 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              <Typography sx={{ ...SECTION_LABEL_SX, mb: 2 }}>
                Podgląd operacji: {currentSelected?.opNumber}
              </Typography>

              {/* Route display */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2.5,
                  bgcolor: aeroColors.surfaceContainerLowest,
                  borderRadius: 1.5,
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ ...SECTION_LABEL_SX, fontSize: '0.5625rem', mb: 0.25 }}>Od</Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: aeroColors.tertiary,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {currentSelected?.routeFrom}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ flex: 1, height: 1, bgcolor: `${aeroColors.outlineVariant}40` }} />
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: `${aeroColors.tertiary}14`,
                      border: `1px solid ${aeroColors.tertiary}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AirplanemodeActiveOutlinedIcon sx={{ fontSize: 14, color: aeroColors.tertiary }} />
                  </Box>
                  <Box sx={{ flex: 1, height: 1, bgcolor: `${aeroColors.outlineVariant}40` }} />
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ ...SECTION_LABEL_SX, fontSize: '0.5625rem', mb: 0.25 }}>Do</Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: aeroColors.primary,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {currentSelected?.routeTo}
                  </Typography>
                </Box>
              </Box>

              {/* Route metrics */}
              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                {[
                  { label: 'Dystans', value: `${currentSelected?.distanceNm} NM`, color: aeroColors.tertiary },
                  { label: 'Czas lotu', value: `${currentSelected?.flightTime} H`, color: aeroColors.primary },
                ].map((m) => (
                  <Grid key={m.label} size={6}>
                    <Box sx={{ bgcolor: aeroColors.surfaceContainerLowest, borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                      <Typography sx={{ ...SECTION_LABEL_SX, fontSize: '0.5625rem', mb: 0.5 }}>{m.label}</Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 700,
                          fontSize: '1.25rem',
                          color: m.color,
                          lineHeight: 1,
                        }}
                      >
                        {m.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Operation metadata */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  {
                    icon: <AirplanemodeActiveOutlinedIcon sx={{ fontSize: 14 }} />,
                    label: 'Wymagana maszyna',
                    value: currentSelected?.helicopter,
                    color: aeroColors.primary,
                  },
                  {
                    icon: <WbSunnyOutlinedIcon sx={{ fontSize: 14 }} />,
                    label: 'Prognozowana pogoda',
                    value: currentSelected?.weather,
                    color: aeroColors.tertiary,
                  },
                  {
                    icon: <PriorityHighOutlinedIcon sx={{ fontSize: 14 }} />,
                    label: 'Priorytet',
                    value: currentSelected?.priority,
                    color: priorityColor(currentSelected?.priority),
                  },
                ].map((row) => (
                  <Box
                    key={row.label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.75,
                      borderBottom: `1px solid ${aeroColors.outlineVariant}14`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: aeroColors.outline }}>
                      {row.icon}
                      <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline }}>
                        {row.label}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: row.color,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {row.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Weekly stats card */}
            <Box sx={{ ...GLASS_CARD, p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    bgcolor: `${aeroColors.tertiary}14`,
                    border: `1px solid ${aeroColors.tertiary}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: aeroColors.tertiary,
                  }}
                >
                  <AnalyticsOutlinedIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: aeroColors.onSurface,
                  }}
                >
                  Statystyki tygodnia
                </Typography>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[
                  { label: 'Ukończone', value: completedCount.toString().padStart(2, '0'), color: '#4caf50' },
                  { label: 'W realizacji', value: inProgressCount.toString().padStart(2, '0'), color: aeroColors.tertiary },
                ].map((s) => (
                  <Grid key={s.label} size={6}>
                    <Box sx={{ textAlign: 'center', bgcolor: aeroColors.surfaceContainerLowest, borderRadius: 1.5, p: 1.5 }}>
                      <Typography
                        sx={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 700,
                          fontSize: '1.75rem',
                          color: s.color,
                          lineHeight: 1,
                        }}
                      >
                        {s.value}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, mt: 0.5 }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurfaceVariant }}>
                    Realizacja planu
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#4caf50',
                    }}
                  >
                    {planPct}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={planPct}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: aeroColors.surfaceContainerHigh,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      background: `linear-gradient(90deg, ${'#4caf50'} 0%, ${aeroColors.tertiary} 100%)`,
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: `1px solid ${aeroColors.outlineVariant}14`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.75 },
                }}
              >
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: aeroColors.tertiary }} />
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: aeroColors.tertiary,
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                  }}
                >
                  Pokaż pełne statystyki →
                </Typography>
              </Box>
            </Box>

          </Box>
        </Grid>
      </Grid>

      <OperationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => {
          console.log('Zapisano operację:', data);
          setModalOpen(false);
        }}
        operation={editingOperation}
      />

    </Box>
  );
}
