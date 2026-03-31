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
  Avatar,
} from '@mui/material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import FlightIcon from '@mui/icons-material/Flight';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
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

/* ── Mock data ─────────────────────────────────────────────────────────── */
const CREW_MEMBERS = [
  {
    id: 1,
    initials: 'AK',
    firstName: 'Andrzej',
    lastName: 'Kwiatkowski',
    email: 'a.kwiatkowski@aero.com',
    role: 'Pilot',
    licenseExpiry: '15.12.2025',
    trainingExpiry: '20.06.2024',
    status: 'Aktywny',
  },
  {
    id: 2,
    initials: 'MN',
    firstName: 'Marta',
    lastName: 'Nowak',
    email: 'm.nowak@aero.com',
    role: 'Obserwator',
    licenseExpiry: '—',
    trainingExpiry: '12.03.2024',
    status: 'Aktywny',
  },
  {
    id: 3,
    initials: 'JR',
    firstName: 'Jan',
    lastName: 'Rybak',
    email: 'j.rybak@aero.com',
    role: 'Pilot',
    licenseExpiry: '10.01.2024',
    trainingExpiry: '05.11.2023',
    status: 'Wygasła licencja',
  },
  {
    id: 4,
    initials: 'TP',
    firstName: 'Tomasz',
    lastName: 'Pilch',
    email: 't.pilch@aero.com',
    role: 'Obserwator',
    licenseExpiry: '—',
    trainingExpiry: '01.05.2024',
    status: 'Szkolenie wkrótce',
  },
];

const CARD_ACCENTS: Record<number, string> = {
  1: aeroColors.primary,
  2: aeroColors.tertiary,
  3: aeroColors.error,
  4: aeroColors.secondary,
};

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function CrewListPage() {
  const [search, setSearch] = useState('');

  const filtered = CREW_MEMBERS.filter((m) => {
    const q = search.toLowerCase();
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    );
  });

  const totalCount = CREW_MEMBERS.length;
  const pilotsCount = CREW_MEMBERS.filter((m) => m.role === 'Pilot').length;
  const observersCount = CREW_MEMBERS.filter((m) => m.role === 'Obserwator').length;
  const activeCount = CREW_MEMBERS.filter((m) => m.status === 'Aktywny').length;

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
        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
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
        {CREW_MEMBERS.map((member) => (
          <Grid key={member.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <CrewMemberCard
              initials={member.initials}
              name={`${member.firstName} ${member.lastName}`}
              role={member.role}
              status={member.status}
              accent={CARD_ACCENTS[member.id]}
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
              {filtered.length} z {CREW_MEMBERS.length} członków
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
                          bgcolor: `${CARD_ACCENTS[member.id]}20`,
                          color: CARD_ACCENTS[member.id],
                          border: `1px solid ${CARD_ACCENTS[member.id]}30`,
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          fontFamily: '"Space Grotesk", sans-serif',
                          flexShrink: 0,
                        }}
                      >
                        {member.initials}
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
                        color: member.role === 'Pilot' ? aeroColors.tertiary : aeroColors.secondary,
                      }}
                    >
                      {member.role}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color:
                          member.licenseExpiry === '—'
                            ? aeroColors.outline
                            : member.status === 'Wygasła licencja'
                            ? aeroColors.error
                            : aeroColors.onSurfaceVariant,
                        fontFamily: '"Inter", monospace',
                      }}
                    >
                      {member.licenseExpiry}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color:
                          member.status === 'Szkolenie wkrótce'
                            ? aeroColors.secondary
                            : aeroColors.onSurfaceVariant,
                        fontFamily: '"Inter", monospace',
                      }}
                    >
                      {member.trainingExpiry}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <StatusBadge status={member.status} />
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
            Łącznie: {CREW_MEMBERS.length} członków załogi w rejestrze
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
