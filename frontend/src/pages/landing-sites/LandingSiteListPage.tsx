import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import LandingSiteModal, { type LandingSiteData } from '../../components/modals/LandingSiteModal';
import {
  Box,
  Typography,
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
  TextField,
  InputAdornment,
} from '@mui/material';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import MyLocationOutlinedIcon from '@mui/icons-material/MyLocationOutlined';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
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

/* ── Status badge ──────────────────────────────────────────────────────── */
type SiteStatusKey = 'Gotowe' | 'Uwaga' | 'Wyłączone';

const STATUS_CONFIG: Record<SiteStatusKey, { color: string; bg: string; dot?: string }> = {
  Gotowe: {
    color: '#4caf50',
    bg: 'rgba(76,175,80,0.12)',
  },
  Uwaga: {
    color: aeroColors.secondary,
    bg: `${aeroColors.secondary}18`,
  },
  Wyłączone: {
    color: aeroColors.onSurfaceVariant,
    bg: `${aeroColors.outlineVariant}40`,
  },
};

const MAP_DOT_COLOR: Record<SiteStatusKey, string> = {
  Gotowe: '#4caf50',
  Uwaga: aeroColors.secondary,
  Wyłączone: aeroColors.outline,
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as SiteStatusKey] ?? {
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

/* ── Mock data ─────────────────────────────────────────────────────────── */
const LANDING_SITES = [
  {
    id: 1,
    name: 'WARSAW-NORTH-H1',
    lat: 52.2845,
    lng: 20.9412,
    status: 'Gotowe' as SiteStatusKey,
    lastReport: '14:20 UTC',
    note: 'Active / Clear Skies',
  },
  {
    id: 2,
    name: 'KRAKOW-BALICE-Z2',
    lat: 50.0777,
    lng: 19.7848,
    status: 'Uwaga' as SiteStatusKey,
    lastReport: '12:05 UTC',
    note: 'Winds: 15kts SE',
  },
  {
    id: 3,
    name: 'GDANSK-PORT-X',
    lat: 54.3942,
    lng: 18.6654,
    status: 'Gotowe' as SiteStatusKey,
    lastReport: '09:15 UTC',
    note: 'Active / Clear Skies',
  },
  {
    id: 4,
    name: 'WROCLAW-FIELD-4',
    lat: 51.1079,
    lng: 17.0385,
    status: 'Wyłączone' as SiteStatusKey,
    lastReport: 'Wczoraj',
    note: 'Site offline',
  },
];

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function LandingSiteListPage() {
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<LandingSiteData | null>(null);

  const filtered = LANDING_SITES.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q) ||
      String(s.lat).includes(q) ||
      String(s.lng).includes(q)
    );
  });

  const mapCenter: [number, number] = [52.0, 19.5];

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
            Ewidencja Punktów Lądowania
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
            Lądowiska planowe
          </Typography>
          {/* Status indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#4caf50',
                boxShadow: '0 0 6px rgba(76,175,80,0.8)',
              }}
            />
            <Typography
              sx={{
                fontSize: '0.625rem',
                letterSpacing: '0.12em',
                fontWeight: 600,
                color: '#4caf50',
                textTransform: 'uppercase',
              }}
            >
              Aktywne operacje w regionie
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddLocationAltOutlinedIcon />}
          onClick={() => { setEditingSite(null); setModalOpen(true); }}
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
          Dodaj lądowisko
        </Button>
      </Box>

      {/* ── Quick-add form ── */}
      <Box sx={{ ...GLASS_CARD, p: 2.5, mb: 3 }}>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: aeroColors.onSurface,
            letterSpacing: '0.02em',
            mb: 2,
          }}
        >
          Nowa lokalizacja taktyczna
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr auto' },
            gap: 1.5,
            alignItems: 'flex-end',
          }}
        >
          <TextField
            label="Nazwa lądowiska"
            size="small"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="np. WARSAW-SOUTH-H2"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AddLocationAltOutlinedIcon sx={{ fontSize: 15, color: aeroColors.outline }} />
                </InputAdornment>
              ),
            }}
            sx={INPUT_SX}
          />
          <TextField
            label="Szerokość (Lat)"
            size="small"
            value={newLat}
            onChange={(e) => setNewLat(e.target.value)}
            placeholder="52.0000"
            sx={INPUT_SX}
          />
          <TextField
            label="Długość (Lng)"
            size="small"
            value={newLng}
            onChange={(e) => setNewLng(e.target.value)}
            placeholder="19.0000"
            sx={INPUT_SX}
          />
          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon sx={{ fontSize: 15 }} />}
            sx={{
              background: `linear-gradient(135deg, ${aeroColors.primary} 0%, ${aeroColors.onPrimaryContainer} 100%)`,
              color: aeroColors.onPrimaryFixed,
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              px: 2,
              py: 1,
              borderRadius: 1,
              whiteSpace: 'nowrap',
              '&:hover': {
                background: `linear-gradient(135deg, ${aeroColors.primary} 0%, ${aeroColors.onPrimaryContainer} 100%)`,
                opacity: 0.9,
              },
            }}
          >
            Zapisz
          </Button>
        </Box>
      </Box>

      {/* ── Table panel ── */}
      <Box sx={{ ...GLASS_CARD, mb: 3 }}>

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
              Lista aktywnych lądowisk
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, mt: 0.25 }}>
              {filtered.length} z {LANDING_SITES.length} lokalizacji
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
              placeholder="Szukaj lądowiska..."
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
                <TableCell sx={{ ...TH_SX, width: '12%' }}>Status</TableCell>
                <TableCell sx={{ ...TH_SX, width: '28%' }}>Nazwa lądowiska</TableCell>
                <TableCell sx={{ ...TH_SX, width: '28%' }}>Współrzędne (Lat / Lng)</TableCell>
                <TableCell sx={{ ...TH_SX, width: '20%' }}>Ostatni meldunek</TableCell>
                <TableCell sx={{ ...TH_SX, width: '12%', textAlign: 'right' }}>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((site, idx) => (
                <TableRow
                  key={site.id}
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
                    <StatusBadge status={site.status} />
                  </TableCell>
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
                      {site.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color: aeroColors.onSurfaceVariant,
                        fontFamily: '"Inter", monospace',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {site.lat.toFixed(4)}, {site.lng.toFixed(4)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color:
                          site.status === 'Wyłączone'
                            ? aeroColors.onSurfaceVariant
                            : aeroColors.onSurface,
                        fontFamily: '"Inter", monospace',
                      }}
                    >
                      {site.lastReport}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25 }}>
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
                      <Tooltip title="Usuń" placement="left">
                        <IconButton
                          size="small"
                          sx={{
                            color: aeroColors.outline,
                            borderRadius: 1,
                            '&:hover': {
                              color: aeroColors.error,
                              bgcolor: `${aeroColors.errorContainer}20`,
                            },
                          }}
                        >
                          <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
            Łącznie: {LANDING_SITES.length} lądowisk w ewidencji
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

      {/* ── Operational Map ── */}
      <Box sx={{ ...GLASS_CARD, overflow: 'hidden' }}>
        {/* Map header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${aeroColors.outlineVariant}1a`,
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
              Mapa Operacyjna
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, mt: 0.25 }}>
              Rozkład geograficzny lądowisk
            </Typography>
          </Box>
          <Tooltip title="Wyśrodkuj mapę">
            <IconButton
              size="small"
              sx={{
                color: aeroColors.outline,
                borderRadius: 1,
                border: `1px solid ${aeroColors.outlineVariant}30`,
                '&:hover': { color: aeroColors.tertiary, bgcolor: `${aeroColors.tertiary}12` },
              }}
            >
              <MyLocationOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Leaflet map */}
        <Box
          sx={{
            height: 420,
            '& .leaflet-container': {
              height: '100%',
              width: '100%',
              background: aeroColors.surfaceContainerLowest,
            },
            '& .leaflet-popup-content-wrapper': {
              background: aeroColors.surfaceContainerHighest,
              color: aeroColors.onSurface,
              border: `1px solid ${aeroColors.outlineVariant}40`,
              borderRadius: 4,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
            },
            '& .leaflet-popup-tip': {
              background: aeroColors.surfaceContainerHighest,
            },
            '& .leaflet-popup-close-button': {
              color: `${aeroColors.outline} !important`,
            },
            '& .leaflet-control-attribution': {
              background: `${aeroColors.surfaceContainerLowest}cc`,
              color: aeroColors.outline,
              fontSize: '0.5625rem',
            },
            '& .leaflet-control-zoom a': {
              background: aeroColors.surfaceContainerHigh,
              color: aeroColors.onSurface,
              border: `1px solid ${aeroColors.outlineVariant}30`,
              '&:hover': { background: aeroColors.surfaceContainerHighest },
            },
          }}
        >
          <MapContainer
            center={mapCenter}
            zoom={6}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />
            {LANDING_SITES.map((site) => (
              <CircleMarker
                key={site.id}
                center={[site.lat, site.lng]}
                radius={10}
                pathOptions={{
                  fillColor: MAP_DOT_COLOR[site.status],
                  fillOpacity: 0.85,
                  color: MAP_DOT_COLOR[site.status],
                  weight: 2,
                  opacity: 0.4,
                }}
              >
                <Popup>
                  <Box sx={{ minWidth: 160, py: 0.5 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        letterSpacing: '0.06em',
                        color: aeroColors.primary,
                        mb: 0.5,
                      }}
                    >
                      {site.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          bgcolor: MAP_DOT_COLOR[site.status],
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ fontSize: '0.6875rem', color: MAP_DOT_COLOR[site.status], fontWeight: 600 }}>
                        {site.status}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.6875rem', color: aeroColors.onSurfaceVariant }}>
                      {site.note}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.625rem',
                        color: aeroColors.outline,
                        fontFamily: '"Inter", monospace',
                        mt: 0.5,
                      }}
                    >
                      {site.lat.toFixed(4)}, {site.lng.toFixed(4)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.5625rem',
                        color: `${aeroColors.outline}80`,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        mt: 0.25,
                      }}
                    >
                      Meldunek: {site.lastReport}
                    </Typography>
                  </Box>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </Box>
      </Box>

      <LandingSiteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => {
          console.log('Zapisano lądowisko:', data);
          setModalOpen(false);
        }}
        site={editingSite}
      />

    </Box>
  );
}
