import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Skeleton, Select, MenuItem } from '@mui/material';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import ThunderstormOutlinedIcon from '@mui/icons-material/ThunderstormOutlined';
import { aeroColors } from '../theme';

/* ── Types & data -------------------------------------------------------- */

interface City {
  name: string;
  lat: number;
  lng: number;
}

const CITIES: City[] = [
  { name: 'Warszawa',     lat: 52.23, lng: 21.01 },
  { name: 'Kraków',       lat: 50.06, lng: 19.94 },
  { name: 'Gdańsk',       lat: 54.35, lng: 18.65 },
  { name: 'Wrocław',      lat: 51.11, lng: 17.04 },
  { name: 'Poznań',       lat: 52.41, lng: 16.93 },
  { name: 'Łódź',         lat: 51.76, lng: 19.46 },
  { name: 'Szczecin',     lat: 53.43, lng: 14.53 },
  { name: 'Katowice',     lat: 50.26, lng: 19.03 },
  { name: 'Lublin',       lat: 51.25, lng: 22.57 },
  { name: 'Rzeszów',      lat: 50.04, lng: 22.00 },
  { name: 'Białystok',    lat: 53.13, lng: 23.16 },
  { name: 'Bydgoszcz',    lat: 53.12, lng: 18.01 },
  { name: 'Olsztyn',      lat: 53.78, lng: 20.49 },
  { name: 'Zielona Góra', lat: 51.94, lng: 15.51 },
  { name: 'Radom',        lat: 51.40, lng: 21.15 },
];

interface WeatherData {
  temperature: number;
  windSpeedKt: number;
  windDir: string;
  weatherCode: number;
}

/* ── Helpers -------------------------------------------------------------- */

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

function degToCompass(deg: number): string {
  return COMPASS[Math.round(deg / 45) % 8];
}

function weatherCondition(code: number) {
  if (code === 0)  return { label: 'Zielone światło',    sublabel: 'Bezchmurnie — warunki VFR optymalne',        color: '#4caf50' };
  if (code <= 3)   return { label: 'Zielone światło',    sublabel: 'Niewielkie zachmurzenie — warunki VFR',      color: '#4caf50' };
  if (code <= 48)  return { label: 'Zachmurzenie / mgła', sublabel: 'Ograniczona widoczność — sprawdź METAR',    color: '#ff9800' };
  if (code <= 67)  return { label: 'Opady deszczu',      sublabel: 'Warunki IFR — lot wymaga weryfikacji',       color: '#ef5350' };
  if (code <= 77)  return { label: 'Opady śniegu',       sublabel: 'Warunki zimowe — lot wymaga weryfikacji',    color: '#ef5350' };
  if (code <= 82)  return { label: 'Przelotne deszcze',  sublabel: 'Niestabilna aura — sprawdź METAR',           color: '#ff9800' };
  return                   { label: 'Burza / ryzyko',    sublabel: 'Warunki NOGO — lot wstrzymany',              color: '#ef5350' };
}

function WeatherIcon({ code, color }: { code: number; color: string }) {
  const sx = { fontSize: 16, color };
  if (code === 0 || code === 1) return <WbSunnyOutlinedIcon sx={sx} />;
  if (code >= 95)               return <ThunderstormOutlinedIcon sx={sx} />;
  return <CloudOutlinedIcon sx={sx} />;
}

/* ── Hook ----------------------------------------------------------------- */

function useWeather(city: City) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = useCallback(() => {
    setLoading(true);
    setError(false);

    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${city.lat}&longitude=${city.lng}` +
      '&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code' +
      '&wind_speed_unit=kn&timezone=Europe%2FWarsaw';

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((json) => {
        const c = json.current;
        setData({
          temperature: Math.round(c.temperature_2m),
          windSpeedKt: Math.round(c.wind_speed_10m),
          windDir: degToCompass(c.wind_direction_10m),
          weatherCode: c.weather_code,
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [city.lat, city.lng]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  return { data, loading, error };
}

/* ── Component ------------------------------------------------------------ */

const GLASS_CARD = {
  background: 'rgba(30, 32, 35, 0.65)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: 2,
} as const;

const STATUS_GREEN = '#4caf50';

const STORAGE_KEY = 'aero-weather-city';

function loadCity(): City {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const found = CITIES.find((c) => c.name === saved);
    if (found) return found;
  }
  return CITIES[0];
}

export default function WeatherBanner() {
  const [selectedCity, setSelectedCity] = useState<City>(loadCity);
  const weather = useWeather(selectedCity);

  const condition = weather.data
    ? weatherCondition(weather.data.weatherCode)
    : { label: 'Zielone światło', sublabel: 'Ładowanie danych pogodowych…', color: STATUS_GREEN };

  return (
    <Box
      sx={{
        ...GLASS_CARD,
        p: 2,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: `1px solid ${condition.color}25`,
        transition: 'border-color 0.4s ease',
      }}
    >
      {/* Status indicator dot */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: `${condition.color}14`,
          border: `1px solid ${condition.color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.4s ease',
        }}
      >
        <Box
          sx={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            bgcolor: condition.color,
            boxShadow: `0 0 10px ${condition.color}cc`,
            transition: 'all 0.4s ease',
          }}
        />
      </Box>

      {/* Condition text */}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: '0.8125rem',
            letterSpacing: '0.12em',
            color: condition.color,
            textTransform: 'uppercase',
            transition: 'color 0.4s ease',
          }}
        >
          {condition.label}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: aeroColors.outline, mt: 0.25 }}>
          {condition.sublabel}
        </Typography>
      </Box>

      {/* Right side: city selector + weather readout */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Select
          value={selectedCity.name}
          onChange={(e) => {
            const city = CITIES.find((c) => c.name === e.target.value);
            if (city) {
              setSelectedCity(city);
              localStorage.setItem(STORAGE_KEY, city.name);
            }
          }}
          size="small"
          variant="outlined"
          sx={{
            minWidth: 150,
            height: 30,
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              py: 0,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: aeroColors.onSurface,
              lineHeight: '30px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: `${aeroColors.outlineVariant}40`,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: `${aeroColors.outline}60`,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: aeroColors.tertiary,
              borderWidth: 1,
            },
            '& .MuiSelect-icon': {
              color: aeroColors.outline,
              fontSize: 18,
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: aeroColors.surfaceContainerHigh,
                border: `1px solid ${aeroColors.outlineVariant}30`,
                backdropFilter: 'blur(12px)',
                maxHeight: 280,
                '& .MuiMenuItem-root': {
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  py: 0.75,
                  '&:hover': { bgcolor: `${aeroColors.primary}12` },
                  '&.Mui-selected': {
                    bgcolor: `${aeroColors.tertiary}18`,
                    color: aeroColors.tertiary,
                    '&:hover': { bgcolor: `${aeroColors.tertiary}24` },
                  },
                },
              },
            },
          }}
        >
          {CITIES.map((c) => (
            <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
          ))}
        </Select>

        {weather.loading ? (
          <Skeleton variant="text" width={120} sx={{ bgcolor: `${aeroColors.outline}20` }} />
        ) : weather.error || !weather.data ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CloudOutlinedIcon sx={{ fontSize: 16, color: aeroColors.outline }} />
            <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurfaceVariant }}>
              Brak danych
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <WeatherIcon code={weather.data.weatherCode} color={aeroColors.outline} />
            <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurfaceVariant, whiteSpace: 'nowrap' }}>
              {weather.data.temperature}°C &nbsp;·&nbsp; Wiatr {weather.data.windDir} {weather.data.windSpeedKt}kt
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
