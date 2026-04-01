import { useState, useEffect, useCallback } from 'react';
import FlightOrderModal, {
  type FlightOrderData,
  ORDER_STATUS_OPTIONS,
  MOCK_HELICOPTERS,
  MOCK_PILOTS,
} from '../../components/modals/FlightOrderModal';
import { getOrders, getOrderById, createOrder, updateOrder, changeOrderStatus } from '../../api/orders.api';
import { getHelicopters } from '../../api/helicopters.api';
import { getCrewMembers } from '../../api/crew.api';
import type { OrderListResponse, OrderResponse, HelicopterResponse, CrewMemberResponse, OrderRequest } from '../../api/types';
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
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined';
import AirplanemodeActiveOutlinedIcon from '@mui/icons-material/AirplanemodeActiveOutlined';
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SatelliteAltOutlinedIcon from '@mui/icons-material/SatelliteAltOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
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

/* ── Order status config ────────────────────────────────────────────────── */
type OrderStatusKey =
  | 'Wprowadzone'
  | 'Przekazane do akceptacji'
  | 'Odrzucone'
  | 'Zaakceptowane'
  | 'Zrealizowane w części'
  | 'Zrealizowane w całości'
  | 'Nie zrealizowane';

const STATUS_CONFIG: Record<OrderStatusKey, { color: string; bg: string }> = {
  Wprowadzone:                 { color: aeroColors.primary,         bg: `${aeroColors.primary}18` },
  'Przekazane do akceptacji':  { color: aeroColors.secondary,       bg: `${aeroColors.secondary}18` },
  Odrzucone:                   { color: aeroColors.error,           bg: `${aeroColors.errorContainer}40` },
  Zaakceptowane:               { color: aeroColors.tertiary,        bg: `${aeroColors.tertiary}18` },
  'Zrealizowane w części':     { color: aeroColors.secondary,       bg: `${aeroColors.secondary}14` },
  'Zrealizowane w całości':    { color: '#4caf50',                  bg: 'rgba(76,175,80,0.14)' },
  'Nie zrealizowane':          { color: aeroColors.onSurfaceVariant,bg: `${aeroColors.outlineVariant}40` },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as OrderStatusKey] ?? {
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
        border: `1px solid ${cfg.color}28`,
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

/* ── Stat card ──────────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  accent?: string;
  delta?: string;
}

function StatCard({ label, value, sublabel, icon, accent = aeroColors.primary, delta }: StatCardProps) {
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
          top: 0, left: 0, right: 0,
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
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
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
            {delta && (
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#4caf50', letterSpacing: '0.04em' }}>
                {delta}
              </Typography>
            )}
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: accent, mt: 0.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {sublabel}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 40, height: 40,
            borderRadius: 1.5,
            bgcolor: `${accent}18`,
            border: `1px solid ${accent}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Box>
  );
}

/* ── Filter chip ────────────────────────────────────────────────────────── */
interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent?: string;
}

function FilterChip({ label, count, active, onClick, accent = aeroColors.primary }: FilterChipProps) {
  return (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <span>{label}</span>
          <Box
            sx={{
              minWidth: 18,
              height: 16,
              px: 0.5,
              borderRadius: 0.75,
              bgcolor: active ? `${accent}30` : `${aeroColors.outlineVariant}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: active ? accent : aeroColors.outline, lineHeight: 1 }}>
              {count}
            </Typography>
          </Box>
        </Box>
      }
      size="small"
      onClick={onClick}
      sx={{
        height: 28,
        fontSize: '0.6875rem',
        fontWeight: active ? 700 : 500,
        letterSpacing: '0.04em',
        bgcolor: active ? `${accent}14` : 'transparent',
        color: active ? accent : aeroColors.onSurfaceVariant,
        border: `1px solid ${active ? accent + '35' : aeroColors.outlineVariant + '30'}`,
        cursor: 'pointer',
        '& .MuiChip-label': { px: 1.5 },
        '&:hover': { bgcolor: `${accent}0e`, color: accent },
      }}
    />
  );
}

/* ── Row action button ──────────────────────────────────────────────────── */
interface RowActionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}

function RowAction({ icon, label, color, onClick }: RowActionProps) {
  return (
    <Tooltip title={label} placement="top">
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          color: aeroColors.outline,
          borderRadius: 1,
          '&:hover': { color, bgcolor: `${color}12` },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}

/* ── Mock data (replaced by API) ──────────────────────────────────────── */
interface FlightOrder {
  id: number;
  apiId: string;
  orderNumber: string;
  departureDate: string;
  departureTime: string;
  helicopter: string;
  helicopterReg: string;
  pilotFirst: string;
  pilotLast: string;
  estimatedKm: number;
  crewCount: number;
  status: OrderStatusKey;
}

// TODO: UI CHANGES 2026-04-01 — Mock data replaced with API calls
// const ORDERS: FlightOrder[] = [ ... 8 mock orders removed ... ];

/** Adapter: map API OrderListResponse to the UI FlightOrder shape */
function toFlightOrder(
  o: OrderListResponse,
  idx: number,
  helicopterMap: Map<string, HelicopterResponse>,
  crewMap: Map<string, CrewMemberResponse>,
): FlightOrder {
  const heli = helicopterMap.get(o.helicopterId);
  const pilot = crewMap.get(o.pilotId);
  const departure = o.plannedDeparture ? new Date(o.plannedDeparture) : null;
  return {
    id: idx + 1,
    apiId: o.id,
    orderNumber: `#${o.id.substring(0, 10)}`,
    departureDate: departure ? departure.toISOString().split('T')[0] : '—',
    departureTime: departure ? departure.toTimeString().substring(0, 5) : '—',
    helicopter: heli?.type ?? '—',
    helicopterReg: heli?.registrationNumber ?? '—',
    pilotFirst: pilot?.firstName ?? '—',
    pilotLast: pilot?.lastName ?? '',
    estimatedKm: 0,
    crewCount: 0,
    status: (o.statusLabel ?? 'Wprowadzone') as OrderStatusKey,
  };
}

type FilterKey =
  | 'all'
  | 'Wprowadzone'
  | 'Przekazane do akceptacji'
  | 'Zaakceptowane'
  | 'Zrealizowane w całości';

const FILTER_TABS: Array<{ key: FilterKey; label: string; accent: string }> = [
  { key: 'all',                        label: 'Wszystkie',             accent: aeroColors.primary },
  { key: 'Wprowadzone',                label: 'Wprowadzone',           accent: aeroColors.primary },
  { key: 'Przekazane do akceptacji',   label: 'Przekazane',            accent: aeroColors.secondary },
  { key: 'Zaakceptowane',              label: 'Zaakceptowane',         accent: aeroColors.tertiary },
  { key: 'Zrealizowane w całości',     label: 'Zrealizowane',          accent: '#4caf50' },
];

const ROW_INITIALS = (o: FlightOrder) =>
  `${o.pilotFirst[0]}${o.pilotLast[0]}`;

const HELI_ACCENT: Record<string, string> = {
  'SP-AER': aeroColors.tertiary,
  'SP-HLP': aeroColors.primary,
  'SP-LPR': aeroColors.secondary,
  'SP-TAC': '#c084fc',
  'SP-NXB': '#4caf50',
  'SP-HBL': aeroColors.error,
  'SP-HCK': aeroColors.tertiary,
};

const PAGE_SIZE = 6;

/* ── Status label → enum value map ─────────────────────────────────────── */
const STATUS_PL_TO_EN = Object.fromEntries(
  ORDER_STATUS_OPTIONS.map((o) => [o.label, o.value]),
) as Record<string, FlightOrderData['status']>;

/* ── Convert a full API OrderResponse to FlightOrderData for the modal ── */
function apiOrderToFlightOrderData(o: OrderResponse): FlightOrderData {
  return {
    id:                     o.id,
    plannedDeparture:       o.plannedDeparture ?? '',
    plannedArrival:         o.plannedArrival ?? '',
    pilotId:                o.pilotId ?? '',
    status:                 (o.status as FlightOrderData['status']) ?? 'SUBMITTED',
    helicopterId:           o.helicopterId ?? '',
    crewMemberIds:          o.crewMemberIds ?? [],
    departureLandingSiteId: o.departureSiteId ?? '',
    arrivalLandingSiteId:   o.arrivalSiteId ?? '',
    operationIds:           o.operationIds ?? [],
    estimatedRouteLengthKm: o.estimatedRouteLengthKm ?? 0,
    actualDeparture:        o.actualDeparture ?? undefined,
    actualArrival:          o.actualArrival ?? undefined,
  };
}

/* ── Airspace status panel ─────────────────────────────────────────────── */
function AirspacePanel() {
  return (
    <Box sx={{ ...GLASS_CARD, p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 30, height: 30,
            borderRadius: 1,
            bgcolor: `${aeroColors.tertiary}14`,
            border: `1px solid ${aeroColors.tertiary}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: aeroColors.tertiary,
          }}
        >
          <RadarOutlinedIcon sx={{ fontSize: 16 }} />
        </Box>
        <Box>
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
            Status Przestrzeni Powietrznej
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: aeroColors.surfaceContainerLowest,
          borderRadius: 1.5,
          p: 1.75,
          mb: 2,
          border: `1px solid ${aeroColors.tertiary}14`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            sx={{
              width: 8, height: 8,
              borderRadius: '50%',
              bgcolor: '#4caf50',
              boxShadow: '0 0 8px rgba(76,175,80,0.7)',
              mt: 0.5,
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurfaceVariant, lineHeight: 1.6 }}>
            Warunki atmosferyczne:{' '}
            <Box component="span" sx={{ color: '#4caf50', fontWeight: 600 }}>VFR Optymalne</Box>.
            Brak ograniczeń w strefie EPWA. Wszystkie systemy łączności satelitarnej aktywne.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {[
          { icon: <SatelliteAltOutlinedIcon sx={{ fontSize: 14 }} />, label: 'SATCOM', value: 'ONLINE',  color: '#4caf50' },
          { icon: <AirplanemodeActiveOutlinedIcon sx={{ fontSize: 14 }} />, label: 'ADS-B',  value: 'ACTIVE', color: aeroColors.tertiary },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: `${item.color}0e`,
              border: `1px solid ${item.color}20`,
              borderRadius: 1.5,
              px: 1.5,
              py: 1,
            }}
          >
            <Box sx={{ color: item.color }}>{item.icon}</Box>
            <Box>
              <Typography sx={{ fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: aeroColors.outline }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', color: item.color }}>
                {item.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ── Technical notifications panel ─────────────────────────────────────── */
function NotificationsPanel() {
  const notifications = [
    {
      type: 'warn' as const,
      icon: <BuildOutlinedIcon sx={{ fontSize: 14 }} />,
      title: 'SP-AER: Przegląd za 4.5h lotu',
      sub: 'Wymagana weryfikacja logów technicznych',
      color: aeroColors.secondary,
    },
    {
      type: 'info' as const,
      icon: <InfoOutlinedIcon sx={{ fontSize: 14 }} />,
      title: 'Nowe wytyczne NOTAM dla sektora C',
      sub: 'Opublikowano: 10:45 AM',
      color: aeroColors.primary,
    },
  ];

  return (
    <Box sx={{ ...GLASS_CARD, p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 30, height: 30,
            borderRadius: 1,
            bgcolor: `${aeroColors.secondary}14`,
            border: `1px solid ${aeroColors.secondary}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: aeroColors.secondary,
          }}
        >
          <WarningAmberOutlinedIcon sx={{ fontSize: 16 }} />
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
          Powiadomienia Techniczne
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {notifications.map((n, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
              bgcolor: `${n.color}0a`,
              border: `1px solid ${n.color}18`,
              borderRadius: 1.5,
              p: 1.5,
            }}
          >
            <Box
              sx={{
                width: 28, height: 28,
                borderRadius: 1,
                bgcolor: `${n.color}18`,
                border: `1px solid ${n.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: n.color,
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              {n.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: aeroColors.onSurface, lineHeight: 1.3 }}>
                {n.title}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, mt: 0.3 }}>
                {n.sub}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function OrderListPage() {
  const { user } = useAuth();
  const isSuperuser = user?.role === 'SUPERUSER';
  const isPilot = user?.role === 'PILOT' || isSuperuser;
  const isSupervisor = user?.role === 'SUPERVISOR' || isSuperuser;
  const canCreate = isPilot;
  const canEdit = isPilot || isSupervisor;
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<FlightOrderData | null>(null);

  const [apiOrders, setApiOrders] = useState<OrderListResponse[]>([]);
  const [helicopterMap, setHelicopterMap] = useState<Map<string, HelicopterResponse>>(new Map());
  const [crewMap, setCrewMap] = useState<Map<string, CrewMemberResponse>>(new Map());
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const fetchOrders = useCallback(async () => {
    try {
      const [ordersData, helicoptersData, crewData] = await Promise.all([
        getOrders(),
        getHelicopters(),
        getCrewMembers(),
      ]);
      setApiOrders(ordersData);
      setHelicopterMap(new Map(helicoptersData.map(h => [h.id, h])));
      setCrewMap(new Map(crewData.map(c => [c.id, c])));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSave = async (data: FlightOrderData) => {
    const payload: OrderRequest = {
      plannedDeparture:  data.plannedDeparture,
      plannedArrival:    data.plannedArrival,
      helicopterId:      data.helicopterId,
      crewMemberIds:     data.crewMemberIds,
      departureSiteId:   data.departureLandingSiteId,
      arrivalSiteId:     data.arrivalLandingSiteId,
      operationIds:      data.operationIds,
      actualDeparture:   data.actualDeparture || undefined,
      actualArrival:     data.actualArrival   || undefined,
    };
    setSaving(true);
    try {
      if (data.id) {
        await updateOrder(data.id, payload);
      } else {
        await createOrder(payload);
      }
      setModalOpen(false);
      setEditingOrder(null);
      await fetchOrders();
      setSnackbar({ open: true, message: data.id ? 'Zlecenie zostało zaktualizowane.' : 'Zlecenie zostało utworzone.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Nie udało się zapisać zlecenia. Spróbuj ponownie.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId: string, action: string, successMsg: string) => {
    try {
      await changeOrderStatus(orderId, { action });
      await fetchOrders();
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Nie udało się zmienić statusu zlecenia.', severity: 'error' });
    }
  };

  const ORDERS = apiOrders.map((o, i) => toFlightOrder(o, i, helicopterMap, crewMap));

  const filtered = ORDERS.filter((o) => {
    const matchesFilter = activeFilter === 'all' || o.status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      `${o.pilotFirst} ${o.pilotLast}`.toLowerCase().includes(q) ||
      o.helicopter.toLowerCase().includes(q) ||
      o.helicopterReg.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const countFor = (k: FilterKey) =>
    k === 'all' ? ORDERS.length : ORDERS.filter((o) => o.status === k).length;

  const activeCount   = ORDERS.filter((o) => ['Zaakceptowane', 'Przekazane do akceptacji'].includes(o.status)).length;
  const pendingCount  = ORDERS.filter((o) => o.status === 'Wprowadzone').length;
  const sentCount     = ORDERS.filter((o) => o.status === 'Przekazane do akceptacji').length;

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
            Zlecenia na lot
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
            Lista zleceń na lot
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: aeroColors.onSurfaceVariant, mt: 0.5 }}>
            Zarządzanie bieżącymi operacjami i zatwierdzanie planów lotów.
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddTaskOutlinedIcon />}
            onClick={() => { setEditingOrder(null); setModalOpen(true); }}
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
            Nowe zlecenie na lot
          </Button>
        )}
      </Box>

      {/* ── Stat cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Aktywne misje"
            value={String(activeCount).padStart(2, '0')}
            sublabel="Optymalnie"
            delta="+2 dzisiaj"
            icon={<FlightTakeoffIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.tertiary}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Oczekujące"
            value={String(pendingCount).padStart(2, '0')}
            sublabel="Wymaga akcji"
            icon={<PendingActionsOutlinedIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.secondary}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Przekazane"
            value={String(sentCount).padStart(2, '0')}
            sublabel="W weryfikacji"
            icon={<ForwardToInboxOutlinedIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.primary}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Dostępność floty"
            value="94%"
            sublabel="Optymalnie"
            icon={<AirplanemodeActiveOutlinedIcon sx={{ fontSize: 20 }} />}
            accent="#4caf50"
          />
        </Grid>
      </Grid>

      {/* ── Table panel ── */}
      <Box sx={{ ...GLASS_CARD, mb: 2 }}>

        {/* Panel header — filters + search */}
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
          {/* Filter chips */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {FILTER_TABS.map(({ key, label, accent }) => (
              <FilterChip
                key={key}
                label={label}
                count={countFor(key)}
                active={activeFilter === key}
                onClick={() => { setActiveFilter(key); setPage(0); }}
                accent={accent}
              />
            ))}
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
            <SearchOutlinedIcon sx={{ fontSize: 15, color: aeroColors.outline, flexShrink: 0 }} />
            <InputBase
              placeholder="Szukaj zlecenia..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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
                <TableCell sx={{ ...TH_SX, width: '14%' }}>Nr zlecenia</TableCell>
                <TableCell sx={{ ...TH_SX, width: '15%' }}>Data startu</TableCell>
                <TableCell sx={{ ...TH_SX, width: '22%' }}>Helikopter</TableCell>
                <TableCell sx={{ ...TH_SX, width: '16%' }}>Pilot</TableCell>
                <TableCell sx={{ ...TH_SX, width: '8%', textAlign: 'center' }}>Km</TableCell>
                <TableCell sx={{ ...TH_SX, width: '17%' }}>Status</TableCell>
                <TableCell sx={{ ...TH_SX, width: '8%', textAlign: 'right' }}>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageItems.map((order, idx) => {
                const accentColor = HELI_ACCENT[order.helicopterReg] ?? aeroColors.primary;
                return (
                  <TableRow
                    key={order.id}
                    sx={{
                      bgcolor:
                        idx % 2 === 0
                          ? aeroColors.surfaceContainerLowest
                          : aeroColors.surfaceContainerLow,
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: `${aeroColors.primary}0a` },
                    }}
                  >
                    {/* Nr zlecenia */}
                    <TableCell sx={TD_SX}>
                      <Typography
                        sx={{
                          fontFamily: '"Space Grotesk", monospace',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em',
                          color: aeroColors.primary,
                        }}
                      >
                        {order.orderNumber}
                      </Typography>
                    </TableCell>

                    {/* Data startu */}
                    <TableCell sx={TD_SX}>
                      <Typography sx={{ fontSize: '0.8125rem', color: aeroColors.onSurface, fontFamily: '"Inter", monospace' }}>
                        {order.departureDate}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, mt: 0.25, fontFamily: '"Inter", monospace', letterSpacing: '0.06em' }}>
                        {order.departureTime} UTC
                      </Typography>
                    </TableCell>

                    {/* Helikopter */}
                    <TableCell sx={TD_SX}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 28, height: 28,
                            borderRadius: 1,
                            bgcolor: `${accentColor}18`,
                            border: `1px solid ${accentColor}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: accentColor,
                            flexShrink: 0,
                          }}
                        >
                          <AirplanemodeActiveOutlinedIcon sx={{ fontSize: 14 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: '0.8125rem',
                              color: aeroColors.onSurface,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {order.helicopter}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              letterSpacing: '0.1em',
                              color: accentColor,
                              fontFamily: '"Space Grotesk", monospace',
                            }}
                          >
                            {order.helicopterReg}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Pilot */}
                    <TableCell sx={TD_SX}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 26, height: 26,
                            bgcolor: `${aeroColors.tertiary}18`,
                            color: aeroColors.tertiary,
                            border: `1px solid ${aeroColors.tertiary}28`,
                            fontSize: '0.5625rem',
                            fontWeight: 700,
                            fontFamily: '"Space Grotesk", sans-serif',
                            flexShrink: 0,
                          }}
                        >
                          {ROW_INITIALS(order)}
                        </Avatar>
                        <Typography
                          sx={{
                            fontFamily: '"Space Grotesk", sans-serif',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            color: aeroColors.onSurface,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {order.pilotFirst} {order.pilotLast}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Km */}
                    <TableCell sx={{ ...TD_SX, textAlign: 'center' }}>
                      <Typography sx={{ fontFamily: '"Space Grotesk", monospace', fontWeight: 700, fontSize: '0.8125rem', color: aeroColors.onSurfaceVariant }}>
                        {order.estimatedKm}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={TD_SX}>
                      <StatusBadge status={order.status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ ...TD_SX, textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
                        {/* Wprowadzone: Edytuj (pilot) + Wyślij do akceptacji (pilot) */}
                        {isPilot && order.status === 'Wprowadzone' && (
                          <>
                            <RowAction
                              icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                              label="Edytuj"
                              color={aeroColors.tertiary}
                              onClick={async () => { try { const full = await getOrderById(order.apiId); setEditingOrder(apiOrderToFlightOrderData(full)); setModalOpen(true); } catch { setSnackbar({ open: true, message: 'Nie udało się pobrać zlecenia.', severity: 'error' }); } }}
                            />
                            <RowAction
                              icon={<SendOutlinedIcon sx={{ fontSize: 14 }} />}
                              label="Wyślij do akceptacji"
                              color={aeroColors.secondary}
                              onClick={() => handleStatusChange(order.apiId, 'submitForApproval', 'Zlecenie przekazane do akceptacji.')}
                            />
                          </>
                        )}
                        {/* Przekazane do akceptacji: Zaakceptuj + Odrzuć (supervisor only) */}
                        {isSupervisor && order.status === 'Przekazane do akceptacji' && (
                          <>
                            <RowAction
                              icon={<CheckOutlinedIcon sx={{ fontSize: 14 }} />}
                              label="Zaakceptuj"
                              color="#4caf50"
                              onClick={() => handleStatusChange(order.apiId, 'approve', 'Zlecenie zaakceptowane.')}
                            />
                            <RowAction
                              icon={<CloseOutlinedIcon sx={{ fontSize: 14 }} />}
                              label="Odrzuć"
                              color={aeroColors.error}
                              onClick={() => handleStatusChange(order.apiId, 'reject', 'Zlecenie odrzucone.')}
                            />
                          </>
                        )}
                        {/* Zaakceptowane: Edytuj (pilot/supervisor) + rozliczanie (pilot only, PRD 6.6.f) */}
                        {canEdit && order.status === 'Zaakceptowane' && (
                          <RowAction
                            icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                            label="Edytuj"
                            color={aeroColors.tertiary}
                            onClick={async () => { try { const full = await getOrderById(order.apiId); setEditingOrder(apiOrderToFlightOrderData(full)); setModalOpen(true); } catch { setSnackbar({ open: true, message: 'Nie udało się pobrać zlecenia.', severity: 'error' }); } }}
                          />
                        )}
                        {isPilot && order.status === 'Zaakceptowane' && (
                          <>
                            <RowAction
                              icon={<CheckOutlinedIcon sx={{ fontSize: 14 }} />}
                              label="Zrealizowane w całości"
                              color="#4caf50"
                              onClick={() => handleStatusChange(order.apiId, 'complete', 'Zlecenie zrealizowane w całości.')}
                            />
                            <RowAction
                              icon={<PlayArrowOutlinedIcon sx={{ fontSize: 14 }} />}
                              label="Zrealizowane w części"
                              color={aeroColors.secondary}
                              onClick={() => handleStatusChange(order.apiId, 'partialComplete', 'Zlecenie zrealizowane w części.')}
                            />
                            <RowAction
                              icon={<CloseOutlinedIcon sx={{ fontSize: 14 }} />}
                              label="Nie zrealizowane"
                              color={aeroColors.error}
                              onClick={() => handleStatusChange(order.apiId, 'notCompleted', 'Zlecenie oznaczone jako niezrealizowane.')}
                            />
                          </>
                        )}
                        {!['Wprowadzone', 'Przekazane do akceptacji', 'Zaakceptowane'].includes(order.status) && (
                          <RowAction
                            icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                            label="Podgląd"
                            color={aeroColors.outline}
                            onClick={async () => { try { const full = await getOrderById(order.apiId); setEditingOrder(apiOrderToFlightOrderData(full)); setModalOpen(true); } catch { setSnackbar({ open: true, message: 'Nie udało się pobrać zlecenia.', severity: 'error' }); } }}
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    sx={{ ...TD_SX, textAlign: 'center', py: 5, color: aeroColors.outline }}
                  >
                    Brak zleceń spełniających kryteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination footer */}
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
          <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, letterSpacing: '0.06em' }}>
            Wyświetlanie {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} z {filtered.length} zleceń
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              sx={{
                color: page === 0 ? `${aeroColors.outline}40` : aeroColors.outline,
                borderRadius: 1,
                border: `1px solid ${aeroColors.outlineVariant}30`,
                '&:hover:not(:disabled)': { color: aeroColors.tertiary, borderColor: `${aeroColors.tertiary}30` },
              }}
            >
              <ChevronLeftOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>

            {Array.from({ length: totalPages }, (_, i) => (
              <Box
                key={i}
                onClick={() => setPage(i)}
                sx={{
                  width: 28, height: 28,
                  borderRadius: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: page === i ? `${aeroColors.tertiary}18` : 'transparent',
                  border: `1px solid ${page === i ? aeroColors.tertiary + '35' : aeroColors.outlineVariant + '25'}`,
                  transition: 'all 0.12s ease',
                  '&:hover': { bgcolor: `${aeroColors.tertiary}0e` },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: page === i ? 700 : 500,
                    color: page === i ? aeroColors.tertiary : aeroColors.outline,
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  {i + 1}
                </Typography>
              </Box>
            ))}

            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              sx={{
                color: page >= totalPages - 1 ? `${aeroColors.outline}40` : aeroColors.outline,
                borderRadius: 1,
                border: `1px solid ${aeroColors.outlineVariant}30`,
                '&:hover:not(:disabled)': { color: aeroColors.tertiary, borderColor: `${aeroColors.tertiary}30` },
              }}
            >
              <ChevronRightOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* ── Bottom panels ── */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AirspacePanel />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <NotificationsPanel />
        </Grid>
      </Grid>

      <FlightOrderModal
        open={modalOpen}
        onClose={() => { if (!saving) { setModalOpen(false); setEditingOrder(null); } }}
        onSave={handleSave}
        order={editingOrder}
        saving={saving}
        currentUserCrewMemberId={user?.crewMemberId}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.8125rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
