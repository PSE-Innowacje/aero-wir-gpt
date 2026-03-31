import { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  AppBar,
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { aeroColors } from '../../theme';

const DRAWER_WIDTH = 240;

const TACTICAL_GRID = [
  'linear-gradient(0deg, transparent 24%, rgba(142,145,150,.05) 25%, rgba(142,145,150,.05) 26%, transparent 27%, transparent 74%, rgba(142,145,150,.05) 75%, rgba(142,145,150,.05) 76%, transparent 77%, transparent)',
  'linear-gradient(90deg, transparent 24%, rgba(142,145,150,.05) 25%, rgba(142,145,150,.05) 26%, transparent 27%, transparent 74%, rgba(142,145,150,.05) 75%, rgba(142,145,150,.05) 76%, transparent 77%, transparent)',
].join(', ');

const PULSE_KEYFRAMES = {
  '@keyframes aero-pulse': {
    '0%, 100%': { opacity: 1, boxShadow: '0 0 6px rgba(76,175,80,0.8)' },
    '50%': { opacity: 0.6, boxShadow: '0 0 2px rgba(76,175,80,0.3)' },
  },
};

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Helikoptery', path: '/helicopters', icon: <AirplanemodeActiveIcon /> },
  { label: 'Załoga', path: '/crew', icon: <PeopleOutlinedIcon /> },
  { label: 'Lądowiska', path: '/landing-sites', icon: <LocationOnOutlinedIcon /> },
  { label: 'Operacje lotnicze', path: '/operations', icon: <AltRouteOutlinedIcon /> },
  { label: 'Zlecenia lotnicze', path: '/orders', icon: <AssignmentOutlinedIcon /> },
  { label: 'Użytkownicy', path: '/users', icon: <ManageAccountsOutlinedIcon /> },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/helicopters': 'Helikoptery',
  '/crew': 'Członkowie załogi',
  '/landing-sites': 'Lądowiska planowe',
  '/operations': 'Operacje lotnicze',
  '/orders': 'Zlecenia lotnicze',
  '/users': 'Użytkownicy',
};

interface LayoutProps {
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

export default function Layout({
  userName = 'Jan Kowalski',
  userRole = 'Administrator',
  userInitials = 'JK',
}: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [_notifOpen, setNotifOpen] = useState(false);

  const currentTitle = PAGE_TITLES[location.pathname] ?? 'AERO';

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: aeroColors.background }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: aeroColors.surfaceContainerLow,
            borderRight: 'none',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Logo — no hard border, spacing creates the break */}
        <Box
          sx={{
            height: 72,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: 2.5,
            gap: 0.25,
            pb: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                background: `linear-gradient(135deg, ${aeroColors.primary} 0%, ${aeroColors.primaryDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FlightIcon sx={{ fontSize: 16, color: aeroColors.onPrimaryFixed }} />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: aeroColors.primary,
                fontSize: '1.0625rem',
                lineHeight: 1,
              }}
            >
              AERO
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.5rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: aeroColors.tertiary,
              fontWeight: 600,
              pl: '46px',
              lineHeight: 1,
            }}
          >
            Tactical Aviation
          </Typography>
        </Box>

        {/* Ghost separator — outlineVariant at ~10% */}
        <Box sx={{ height: 1, mx: 2.5, bgcolor: `${aeroColors.outlineVariant}1a` }} />

        {/* Nav label */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
          <Typography
            sx={{
              fontSize: '0.5625rem',
              letterSpacing: '0.2em',
              color: aeroColors.outline,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Nawigacja
          </Typography>
        </Box>

        {/* Nav items */}
        <List disablePadding sx={{ flex: 1, overflow: 'auto', px: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  position: 'relative',
                  px: 1.5,
                  py: 1.125,
                  borderRadius: 1,
                  mb: 0.25,
                  color: isActive ? aeroColors.primary : aeroColors.onSurfaceVariant,
                  bgcolor: isActive ? `${aeroColors.primary}0d` : 'transparent',
                  '&:hover': {
                    bgcolor: `${aeroColors.primary}0a`,
                    color: aeroColors.onSurface,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '18%',
                    height: '64%',
                    width: 2,
                    borderRadius: '0 2px 2px 0',
                    bgcolor: aeroColors.tertiary,
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: 'inherit',
                    '& .MuiSvgIcon-root': { fontSize: 17 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.01em',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* Ghost separator */}
        <Box sx={{ height: 1, mx: 2.5, bgcolor: `${aeroColors.outlineVariant}1a` }} />

        {/* User section — bg shift instead of border */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.75,
            bgcolor: `${aeroColors.surfaceContainerLowest}60`,
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: aeroColors.primaryContainer,
              color: aeroColors.primary,
              fontSize: '0.6875rem',
              fontWeight: 700,
              border: `1px solid ${aeroColors.primary}30`,
            }}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: aeroColors.onSurface,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {userName}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.625rem',
                letterSpacing: '0.06em',
                color: aeroColors.outline,
                lineHeight: 1.2,
                mt: 0.2,
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              {userRole}
            </Typography>
          </Box>
          <Tooltip title="Wyloguj">
            <IconButton
              size="small"
              onClick={() => navigate('/login')}
              sx={{
                color: aeroColors.outline,
                '&:hover': { color: aeroColors.error, bgcolor: `${aeroColors.error}10` },
                p: 0.625,
              }}
            >
              <LogoutOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main content column */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top AppBar — same surface level as sidebar, ghost bottom rule */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: aeroColors.surfaceContainerLow,
            borderBottom: `1px solid ${aeroColors.outlineVariant}1a`,
            height: 64,
            justifyContent: 'center',
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important', px: 3, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: aeroColors.onSurface,
                  letterSpacing: '0.02em',
                }}
              >
                {currentTitle}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Pulsing status indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 0.5 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#4caf50',
                    ...PULSE_KEYFRAMES,
                    animation: 'aero-pulse 2s ease-in-out infinite',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                    color: aeroColors.outline,
                    textTransform: 'uppercase',
                  }}
                >
                  Operacyjny
                </Typography>
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: `${aeroColors.outlineVariant}40`, mx: 0.5 }}
              />

              <Tooltip title="Powiadomienia">
                <IconButton
                  size="small"
                  onClick={() => setNotifOpen(true)}
                  sx={{
                    color: aeroColors.outline,
                    '&:hover': {
                      color: aeroColors.onSurface,
                      bgcolor: `${aeroColors.primary}0d`,
                    },
                  }}
                >
                  <NotificationsOutlinedIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Tooltip>

              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: aeroColors.primaryContainer,
                  color: aeroColors.primary,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  border: `1px solid ${aeroColors.primary}30`,
                  ml: 0.5,
                  cursor: 'pointer',
                }}
              >
                {userInitials}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page content — tactical grid atmosphere matches login page */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: aeroColors.background,
            backgroundImage: TACTICAL_GRID,
            backgroundSize: '50px 50px',
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
