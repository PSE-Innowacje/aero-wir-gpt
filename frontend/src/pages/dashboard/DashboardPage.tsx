import {
  Box,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import SpeedIcon from '@mui/icons-material/Speed';
import HeightIcon from '@mui/icons-material/Height';
import LocalGasStationOutlinedIcon from '@mui/icons-material/LocalGasStationOutlined';
import { aeroColors } from '../../theme';
import WeatherBanner from '../../components/WeatherBanner';

/* Shared design tokens -------------------------------------------------- */
const STATUS_GREEN = '#4caf50';

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

/* Sub-components --------------------------------------------------------- */
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

const MISSION_LOG = [
  {
    time: '14:24:02',
    callsign: 'FLIGHT-092',
    action: 'Start z bazy EPWA',
    status: 'W locie',
    statusColor: aeroColors.tertiary,
    statusBg: `${aeroColors.tertiary}18`,
  },
  {
    time: '14:18:45',
    callsign: 'RESCUE-11',
    action: 'Podejście do lądowania LZ-4',
    status: 'Uwaga',
    statusColor: aeroColors.secondary,
    statusBg: `${aeroColors.secondary}18`,
  },
  {
    time: '14:05:12',
    callsign: 'CARGO-441',
    action: 'Misja zakończona sukcesem',
    status: 'Uziemiony',
    statusColor: aeroColors.onSurfaceVariant,
    statusBg: `${aeroColors.outlineVariant}40`,
  },
  {
    time: '13:52:30',
    callsign: 'PATROL-07',
    action: 'Inspekcja linii energetycznych sektor A3',
    status: 'W locie',
    statusColor: aeroColors.tertiary,
    statusBg: `${aeroColors.tertiary}18`,
  },
  {
    time: '13:40:18',
    callsign: 'SURVEY-33',
    action: 'Powrót do bazy — misja zaliczona',
    status: 'Uziemiony',
    statusColor: aeroColors.onSurfaceVariant,
    statusBg: `${aeroColors.outlineVariant}40`,
  },
];

function StatusIcon({ status }: { status: string }) {
  if (status === 'W locie')
    return <InfoOutlinedIcon sx={{ fontSize: 14, color: aeroColors.tertiary }} />;
  if (status === 'Uwaga')
    return <WarningAmberOutlinedIcon sx={{ fontSize: 14, color: aeroColors.secondary }} />;
  return <CheckCircleOutlineIcon sx={{ fontSize: 14, color: aeroColors.outline }} />;
}

/* Page ------------------------------------------------------------------- */
export default function DashboardPage() {
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

      <WeatherBanner />

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Aktywne operacje"
            value="12"
            icon={<FlightTakeoffIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.tertiary}
            sublabel="W trakcie realizacji"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Oczekujące"
            value="04"
            icon={<PendingActionsIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.secondary}
            sublabel="Do zatwierdzenia"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Dostępność floty"
            value="84%"
            icon={<AirplanemodeActiveIcon sx={{ fontSize: 20 }} />}
            accent={aeroColors.primary}
            sublabel="3 w rezerwie · 1 w serwisie"
          />
        </Grid>
      </Grid>

      {/* Fleet + Active helicopter row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>

        {/* Fleet status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ ...GLASS_CARD, p: 2.5, height: '100%' }}>
            <Typography sx={{ ...SECTION_LABEL_SX, mb: 2.5 }}>Stan floty</Typography>

            {[
              { label: 'Dostępne', value: 8, pct: 80, color: aeroColors.tertiary },
              { label: 'W rezerwie', value: 3, pct: 30, color: aeroColors.primary },
              { label: 'W serwisie', value: 1, pct: 10, color: aeroColors.secondary },
            ].map((row) => (
              <Box key={row.label} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: aeroColors.onSurface }}>
                    {row.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: row.color }}>
                    {row.value}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={row.pct}
                  sx={{
                    height: 3,
                    borderRadius: 2,
                    bgcolor: aeroColors.surfaceContainerHigh,
                    '& .MuiLinearProgress-bar': { bgcolor: row.color, borderRadius: 2 },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Active helicopter telemetry */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              ...GLASS_CARD,
              p: 2.5,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient glow */}
            <Box
              sx={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                background: `radial-gradient(circle at center, ${aeroColors.tertiary}0a 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
              <Box>
                <Typography sx={{ ...SECTION_LABEL_SX, mb: 0.5 }}>Aktywna jednostka</Typography>
                <Typography
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: aeroColors.onSurface,
                    letterSpacing: '0.03em',
                  }}
                >
                  H-742 "RAPTOR"
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, mt: 0.25 }}>
                  W locie — sektor B-12
                </Typography>
              </Box>
              <Chip
                label="W LOCIE"
                size="small"
                sx={{
                  bgcolor: `${aeroColors.tertiary}15`,
                  color: aeroColors.tertiary,
                  fontWeight: 700,
                  fontSize: '0.625rem',
                  letterSpacing: '0.12em',
                  height: 22,
                  border: `1px solid ${aeroColors.tertiary}28`,
                }}
              />
            </Box>

            <Box sx={{ height: 1, bgcolor: `${aeroColors.outlineVariant}1a`, mb: 2.5 }} />

            <Grid container spacing={2}>
              {[
                {
                  label: 'Wysokość',
                  value: '2 450',
                  unit: 'FT',
                  icon: <HeightIcon sx={{ fontSize: 13, color: aeroColors.outline }} />,
                  color: aeroColors.primary,
                },
                {
                  label: 'Prędkość',
                  value: '140',
                  unit: 'KTS',
                  icon: <SpeedIcon sx={{ fontSize: 13, color: aeroColors.outline }} />,
                  color: aeroColors.primary,
                },
                {
                  label: 'Paliwo',
                  value: '68%',
                  unit: null,
                  icon: <LocalGasStationOutlinedIcon sx={{ fontSize: 13, color: aeroColors.outline }} />,
                  color: STATUS_GREEN,
                  bar: 68,
                },
              ].map((m) => (
                <Grid key={m.label} size={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.5 }}>
                    {m.icon}
                    <Typography sx={{ ...SECTION_LABEL_SX, letterSpacing: '0.1em' }}>
                      {m.label}
                    </Typography>
                  </Box>
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
                  {m.unit && (
                    <Typography sx={{ fontSize: '0.625rem', letterSpacing: '0.1em', color: aeroColors.outline, mt: 0.25 }}>
                      {m.unit}
                    </Typography>
                  )}
                  {m.bar !== undefined && (
                    <LinearProgress
                      variant="determinate"
                      value={m.bar}
                      sx={{
                        mt: 1,
                        height: 3,
                        borderRadius: 2,
                        bgcolor: aeroColors.surfaceContainerHigh,
                        '& .MuiLinearProgress-bar': { bgcolor: STATUS_GREEN, borderRadius: 2 },
                      }}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Mission log */}
      <Box sx={{ ...GLASS_CARD, overflow: 'hidden' }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: `${aeroColors.surfaceContainerHigh}60`,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: aeroColors.onSurface,
            }}
          >
            Logi misji
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: aeroColors.tertiary,
              cursor: 'pointer',
              fontWeight: 500,
              letterSpacing: '0.04em',
              '&:hover': { opacity: 0.75 },
            }}
          >
            Pokaż wszystkie →
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: `${aeroColors.surfaceContainerHigh}40`,
                  '& .MuiTableCell-root': {
                    ...SECTION_LABEL_SX,
                    borderBottom: 'none',
                    py: 1.25,
                  },
                }}
              >
                <TableCell sx={{ pl: 3 }}>Czas</TableCell>
                <TableCell>Kryptonim</TableCell>
                <TableCell>Akcja</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MISSION_LOG.map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    bgcolor: idx % 2 === 0
                      ? `${aeroColors.surfaceContainerLowest}50`
                      : 'transparent',
                    '& .MuiTableCell-root': {
                      borderBottom: 'none',
                      py: 1.5,
                      fontSize: '0.8125rem',
                    },
                    '&:hover': { bgcolor: `${aeroColors.primary}08` },
                    transition: 'background-color 0.12s ease',
                  }}
                >
                  <TableCell
                    sx={{
                      pl: 3,
                      fontFamily: '"Space Grotesk", monospace',
                      color: aeroColors.outline,
                      fontSize: '0.75rem !important',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {row.time}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: aeroColors.primary,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {row.callsign}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: aeroColors.onSurface }}>{row.action}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <StatusIcon status={row.status} />
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          bgcolor: row.statusBg,
                          color: row.statusColor,
                          fontWeight: 600,
                          fontSize: '0.625rem',
                          letterSpacing: '0.06em',
                          height: 20,
                          border: `1px solid ${row.statusColor}28`,
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
