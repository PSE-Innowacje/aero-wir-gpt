import { useState, useEffect, useCallback } from 'react';
import UserModal, { type UserData } from '../../components/modals/UserModal';
import { getUsers, createUser, updateUser } from '../../api/users.api';
import type { UserResponse } from '../../api/types';
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
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
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

/* ── Role config ────────────────────────────────────────────────────────── */
type RoleKey = 'PILOT' | 'PLANNER' | 'SUPERVISOR' | 'ADMIN';

const ROLE_CONFIG: Record<RoleKey, { label: string; color: string; bg: string }> = {
  PILOT: {
    label: 'Pilot',
    color: aeroColors.tertiary,
    bg: `${aeroColors.tertiary}18`,
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
  ADMIN: {
    label: 'Administrator',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.12)',
  },
};

/* ── Status config ──────────────────────────────────────────────────────── */
type StatusKey = 'Aktywny' | 'Nieaktywny' | 'Zablokowany' | 'Oczekuje';

const STATUS_CONFIG: Record<StatusKey, { color: string; bg: string }> = {
  Aktywny: { color: '#4caf50', bg: 'rgba(76,175,80,0.12)' },
  Oczekuje: { color: aeroColors.secondary, bg: `${aeroColors.secondary}18` },
  Zablokowany: { color: aeroColors.error, bg: `${aeroColors.errorContainer}40` },
  Nieaktywny: { color: aeroColors.onSurfaceVariant, bg: `${aeroColors.outlineVariant}40` },
};

/* ── Sub-components ─────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, sublabel, icon, accent = aeroColors.primary }: StatCardProps) {
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
          <Typography sx={{ fontSize: '0.75rem', color: accent, mt: 0.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {sublabel}
          </Typography>
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

function RoleBadge({ role }: { role: RoleKey }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.4,
        borderRadius: 99,
        bgcolor: cfg.bg,
        border: `1px solid ${cfg.color}25`,
      }}
    >
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
        {cfg.label}
      </Typography>
    </Box>
  );
}

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

interface UserCardProps {
  initials: string;
  name: string;
  uid: string;
  email: string;
  loginId: string;
  role: RoleKey;
  status: StatusKey;
  onEdit?: () => void;
  onPermissions?: () => void;
}

function UserCard({ initials, name, uid, email, loginId, role, status, onEdit, onPermissions }: UserCardProps) {
  const roleCfg = ROLE_CONFIG[role];
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: `${roleCfg.color}20`,
            color: roleCfg.color,
            border: `1.5px solid ${roleCfg.color}35`,
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: '0.9375rem',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: aeroColors.onSurface,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.625rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: aeroColors.outline,
              mt: 0.25,
            }}
          >
            UID: {uid}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ height: 1, bgcolor: `${aeroColors.outlineVariant}1a` }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: aeroColors.onSurfaceVariant,
            fontFamily: '"Inter", monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email}
        </Typography>
        <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.outline, letterSpacing: '0.06em' }}>
          ID: {loginId}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <StatusBadge status={status} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edytuj" placement="top">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{
                width: 28,
                height: 28,
                color: aeroColors.outline,
                borderRadius: 1,
                '&:hover': { color: aeroColors.tertiary, bgcolor: `${aeroColors.tertiary}12` },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Uprawnienia" placement="top">
            <IconButton
              size="small"
              onClick={onPermissions}
              sx={{
                width: 28,
                height: 28,
                color: aeroColors.outline,
                borderRadius: 1,
                '&:hover': { color: roleCfg.color, bgcolor: `${roleCfg.color}12` },
              }}
            >
              <ManageAccountsOutlinedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

// TODO: UI CHANGES 2026-04-01 — Mock data replaced with API calls
// const INITIAL_USERS = [
//   { id: 1, initials: 'JS', firstName: 'Jan', lastName: 'Sokołowski', email: 'j.sokolowski@aero.pl', loginId: 'sokol_1', uid: '99420-A', role: 'PILOT' as RoleKey, status: 'Aktywny' as StatusKey },
//   { id: 2, initials: 'MK', firstName: 'Marek', lastName: 'Kowalski', email: 'm.kowalski@aero.pl', loginId: 'kowal_alpha', uid: '00100-S', role: 'SUPERVISOR' as RoleKey, status: 'Aktywny' as StatusKey },
//   { id: 3, initials: 'AM', firstName: 'Anna', lastName: 'Mazur', email: 'a.mazur@aero.pl', loginId: 'mazur_plan', uid: '44211-P', role: 'PLANNER' as RoleKey, status: 'Aktywny' as StatusKey },
//   { id: 4, initials: 'TL', firstName: 'Tomasz', lastName: 'Lis', email: 't.lis@aero.pl', loginId: 'lis_supervisor', uid: '33109-N', role: 'SUPERVISOR' as RoleKey, status: 'Oczekuje' as StatusKey },
//   { id: 5, initials: 'PW', firstName: 'Piotr', lastName: 'Wiśniewski', email: 'p.wisniewski@aero.pl', loginId: 'wisn_pilot', uid: '55302-A', role: 'PILOT' as RoleKey, status: 'Aktywny' as StatusKey },
//   { id: 6, initials: 'EK', firstName: 'Ewa', lastName: 'Kaczmarek', email: 'e.kaczmarek@aero.pl', loginId: 'kacz_plan', uid: '71088-P', role: 'PLANNER' as RoleKey, status: 'Aktywny' as StatusKey },
//   { id: 7, initials: 'RN', firstName: 'Robert', lastName: 'Nowicki', email: 'r.nowicki@aero.pl', loginId: 'nowi_adm', uid: '10001-X', role: 'ADMIN' as RoleKey, status: 'Aktywny' as StatusKey },
//   { id: 8, initials: 'KZ', firstName: 'Katarzyna', lastName: 'Zielińska', email: 'k.zielinska@aero.pl', loginId: 'ziel_pilot', uid: '62940-A', role: 'PILOT' as RoleKey, status: 'Zablokowany' as StatusKey },
// ];

/** Adapter: map API UserResponse to the shape the UI expects */
function toUserRow(u: UserResponse) {
  return {
    id: u.id,
    initials: `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase(),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    loginId: u.email.split('@')[0],
    uid: u.id.substring(0, 8),
    role: u.role as RoleKey,
    status: 'Aktywny' as StatusKey,
  };
}


const ROLE_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'Wszystkie role' },
  { key: 'PILOT', label: 'Piloci' },
  { key: 'PLANNER', label: 'Planiści' },
  { key: 'SUPERVISOR', label: 'Nadzór' },
  { key: 'ADMIN', label: 'Administratorzy' },
];

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'Wszyscy' },
  { key: 'Aktywny', label: 'Aktywni' },
  { key: 'Nieaktywny', label: 'Nieaktywni' },
  { key: 'Zablokowany', label: 'Zablokowani' },
];

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function UserListPage() {
  const [apiUsers, setApiUsers] = useState<UserResponse[]>([]);
  const users = apiUsers.map(toUserRow);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setApiUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const handleSave = (data: UserData) => {
    if (data.id) {
      setUsers((prev) =>
        prev.map((u) =>
          String(u.id) === data.id
            ? { ...u, firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role as RoleKey, initials: `${data.firstName[0]}${data.lastName[0]}`.toUpperCase() }
            : u,
        ),
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          id: Date.now(),
          initials: `${data.firstName[0]}${data.lastName[0]}`.toUpperCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          loginId: `${data.firstName[0].toLowerCase()}.${data.lastName.toLowerCase()}`,
          uid: `${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}-A`,
          role: data.role as RoleKey,
          status: 'Aktywny' as StatusKey,
        },
      ]);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.loginId.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const pilotsCount = users.filter((u) => u.role === 'PILOT').length;
  const plannersCount = users.filter((u) => u.role === 'PLANNER').length;
  const supervisorsCount = users.filter((u) => u.role === 'SUPERVISOR').length;
  const adminsCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={editingUser}
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
            Ewidencja Personelu
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
            Użytkownicy Systemu
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={() => { setEditingUser(null); setModalOpen(true); }}
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
          Dodaj użytkownika
        </Button>
      </Box>

      {/* ── Stat cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Aktywni Piloci"
            value={String(pilotsCount).padStart(2, '0')}
            sublabel="Ready"
            icon={<FlightTakeoffOutlinedIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.tertiary}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Planiści"
            value={String(plannersCount).padStart(2, '0')}
            sublabel="Standby"
            icon={<EditCalendarOutlinedIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.primary}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Nadzór"
            value={String(supervisorsCount).padStart(2, '0')}
            sublabel="Shift A"
            icon={<SupervisorAccountOutlinedIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.secondary}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Administratorzy"
            value={String(adminsCount).padStart(2, '0')}
            sublabel="Locked"
            icon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20 }} />}
            accent="#c084fc"
          />
        </Grid>
      </Grid>

      {/* ── Featured user cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {users.slice(0, 4).map((u) => {
          const openEdit = () => {
            setEditingUser({ id: String(u.id), firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role });
            setModalOpen(true);
          };
          return (
            <Grid key={u.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <UserCard
                initials={u.initials}
                name={`${u.firstName} ${u.lastName}`}
                uid={u.uid}
                email={u.email}
                loginId={u.loginId}
                role={u.role}
                status={u.status}
                onEdit={openEdit}
                onPermissions={openEdit}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* ── Table panel ── */}
      <Box sx={{ ...GLASS_CARD, mb: 2 }}>

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
              Rejestr użytkowników
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, mt: 0.25 }}>
              Wyświetlono {filtered.length} z {users.length} rekordów bazy personelu
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Role filter chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {ROLE_FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  size="small"
                  onClick={() => setRoleFilter(f.key)}
                  sx={{
                    height: 24,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    bgcolor: roleFilter === f.key
                      ? `${aeroColors.primary}20`
                      : 'transparent',
                    color: roleFilter === f.key
                      ? aeroColors.primary
                      : aeroColors.outline,
                    border: `1px solid ${roleFilter === f.key ? aeroColors.primary + '40' : aeroColors.outlineVariant + '40'}`,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: `${aeroColors.primary}14`,
                      color: aeroColors.primary,
                    },
                  }}
                />
              ))}
            </Box>

            {/* Divider */}
            <Box sx={{ width: 1, height: 24, bgcolor: `${aeroColors.outlineVariant}40` }} />

            {/* Status filter chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {STATUS_FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  size="small"
                  onClick={() => setStatusFilter(f.key)}
                  sx={{
                    height: 24,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    bgcolor: statusFilter === f.key
                      ? `${aeroColors.tertiary}18`
                      : 'transparent',
                    color: statusFilter === f.key
                      ? aeroColors.tertiary
                      : aeroColors.outline,
                    border: `1px solid ${statusFilter === f.key ? aeroColors.tertiary + '35' : aeroColors.outlineVariant + '40'}`,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: `${aeroColors.tertiary}10`,
                      color: aeroColors.tertiary,
                    },
                  }}
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
                minWidth: 200,
              }}
            >
              <SearchOutlinedIcon sx={{ fontSize: 15, color: aeroColors.outline, flexShrink: 0 }} />
              <InputBase
                placeholder="Szukaj użytkownika..."
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
        </Box>

        {/* Table */}
        <TableContainer>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...TH_SX, width: '22%' }}>Użytkownik</TableCell>
                <TableCell sx={{ ...TH_SX, width: '24%' }}>Dane logowania</TableCell>
                <TableCell sx={{ ...TH_SX, width: '14%' }}>UID</TableCell>
                <TableCell sx={{ ...TH_SX, width: '18%' }}>Rola systemowa</TableCell>
                <TableCell sx={{ ...TH_SX, width: '12%' }}>Status</TableCell>
                <TableCell sx={{ ...TH_SX, width: '10%', textAlign: 'right' }}>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user, idx) => {
                const roleCfg = ROLE_CONFIG[user.role];
                return (
                  <TableRow
                    key={user.id}
                    sx={{
                      bgcolor:
                        idx % 2 === 0
                          ? aeroColors.surfaceContainerLowest
                          : aeroColors.surfaceContainerLow,
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: `${aeroColors.primary}0a` },
                    }}
                  >
                    <TableCell sx={TD_SX}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: `${roleCfg.color}20`,
                            color: roleCfg.color,
                            border: `1px solid ${roleCfg.color}30`,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            fontFamily: '"Space Grotesk", sans-serif',
                            flexShrink: 0,
                          }}
                        >
                          {user.initials}
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
                          {user.firstName} {user.lastName}
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
                        {user.email}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.6875rem',
                          color: aeroColors.outline,
                          letterSpacing: '0.06em',
                          mt: 0.25,
                        }}
                      >
                        ID: {user.loginId}
                      </Typography>
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontFamily: '"Space Grotesk", monospace',
                          fontWeight: 600,
                          color: aeroColors.onSurfaceVariant,
                          letterSpacing: '0.08em',
                        }}
                      >
                        {user.uid}
                      </Typography>
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="Edytuj" placement="left">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingUser({ id: String(user.id), firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
                              setModalOpen(true);
                            }}
                            sx={{
                              color: aeroColors.outline,
                              borderRadius: 1,
                              '&:hover': {
                                color: aeroColors.tertiary,
                                bgcolor: `${aeroColors.tertiary}12`,
                              },
                            }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Uprawnienia" placement="left">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingUser({ id: String(user.id), firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
                              setModalOpen(true);
                            }}
                            sx={{
                              color: aeroColors.outline,
                              borderRadius: 1,
                              '&:hover': {
                                color: roleCfg.color,
                                bgcolor: `${roleCfg.color}12`,
                              },
                            }}
                          >
                            <ShieldOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

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

        {/* Table footer */}
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
            Łącznie: {users.length} użytkowników w rejestrze
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
            Strona 1 z 1
          </Typography>
        </Box>
      </Box>

      {/* ── System status bar ── */}
      <Grid container spacing={2}>
        {[
          {
            icon: <SecurityOutlinedIcon sx={{ fontSize: 16 }} />,
            label: 'Poziom Szyfrowania',
            value: 'System wykorzystuje standard AES-256 GCM dla wszystkich danych personelu latającego.',
            accent: '#4caf50',
          },
          {
            icon: <HistoryOutlinedIcon sx={{ fontSize: 16 }} />,
            label: 'Logi Audytowe',
            value: 'Ostatnia modyfikacja: 12.05.2024 14:22 przez operatora M.KOWALSKI.',
            accent: aeroColors.secondary,
          },
          {
            icon: <StorageOutlinedIcon sx={{ fontSize: 16 }} />,
            label: 'Status Bazy',
            value: 'Synchronizacja z serwerem głównym: AKTYWNA. Czas odpowiedzi: 14ms.',
            accent: aeroColors.tertiary,
          },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                ...GLASS_CARD,
                p: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: `${item.accent}14`,
                  border: `1px solid ${item.accent}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.accent,
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography sx={{ ...SECTION_LABEL_SX, color: item.accent, mb: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurfaceVariant, lineHeight: 1.5 }}>
                  {item.value}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
