import { useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { gsap } from 'gsap';
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
  Tooltip,
  Divider,
  AppBar,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FlightIcon from '@mui/icons-material/Flight';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { aeroColors } from '../../theme';
import { useCrashEasterEgg, CRASH_ANIMATION_SX } from '../../hooks/useCrashEasterEgg';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH           = 240;
const DRAWER_COLLAPSED_WIDTH = 64;

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

type Role = 'ADMIN' | 'PLANNER' | 'SUPERVISOR' | 'PILOT';
const ALL_ROLES: Role[] = ['ADMIN', 'PLANNER', 'SUPERVISOR', 'PILOT'];

const NAV_ITEMS: Array<{ label: string; path: string; icon: React.ReactNode; roles: Role[] }> = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon />, roles: ALL_ROLES },
  { label: 'Helikoptery', path: '/helicopters', icon: <AirplanemodeActiveIcon />, roles: ['ADMIN', 'SUPERVISOR', 'PILOT'] },
  { label: 'Załoga', path: '/crew', icon: <PeopleOutlinedIcon />, roles: ['ADMIN', 'SUPERVISOR', 'PILOT'] },
  { label: 'Lądowiska', path: '/landing-sites', icon: <LocationOnOutlinedIcon />, roles: ['ADMIN', 'SUPERVISOR', 'PILOT'] },
  { label: 'Operacje lotnicze', path: '/operations', icon: <AltRouteOutlinedIcon />, roles: ALL_ROLES },
  { label: 'Zlecenia lotnicze', path: '/orders', icon: <AssignmentOutlinedIcon />, roles: ['ADMIN', 'SUPERVISOR', 'PILOT'] },
  { label: 'Użytkownicy', path: '/users', icon: <ManageAccountsOutlinedIcon />, roles: ['ADMIN', 'SUPERVISOR', 'PILOT'] },
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

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  PLANNER: 'Planista',
  SUPERVISOR: 'Nadzorujący',
  PILOT: 'Pilot',
};

export default function Layout() {
  const theme      = useTheme();
  const isCollapsed = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { registerClick, isCrashing } = useCrashEasterEgg();

  const userName = user ? `${user.firstName} ${user.lastName}` : '';
  const userRole = user ? (ROLE_LABELS[user.role] ?? user.role) : '';
  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : '';

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const contentRef    = useRef<HTMLDivElement>(null);
  const exitTweenRef  = useRef<gsap.core.Tween | null>(null);

  /* Enter animation — runs after React paints the new page */
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    exitTweenRef.current?.kill();
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out', clearProps: 'transform' },
    );
    return () => { tween.kill(); };
  }, [location.key]);

  const handleNavClick = (path: string) => {
    registerClick(path);
    if (location.pathname === path) return;

    /* Exit animation — navigate inside onComplete so the new page
       only mounts after the old one has faded out */
    exitTweenRef.current?.kill();
    if (contentRef.current) {
      exitTweenRef.current = gsap.to(contentRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => navigate(path),
      });
    } else {
      navigate(path);
    }
  };

  const currentTitle = PAGE_TITLES[location.pathname] ?? 'AERO';

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: aeroColors.background }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: aeroColors.surfaceContainerLow,
            borderRight: 'none',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {/* Logo block */}
        <Box
          sx={{
            px: isCollapsed ? 0 : 3,
            pt: 3,
            pb: 3.5,
            display: 'flex',
            flexDirection: isCollapsed ? 'column' : 'column',
            alignItems: isCollapsed ? 'center' : 'flex-start',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : 1 }}>
            <FlightIcon
              sx={{
                color: aeroColors.tertiary,
                fontSize: isCollapsed ? 22 : 18,
                transform: 'rotate(-45deg)',
                opacity: 0.85,
              }}
            />
            {!isCollapsed && (
              <Typography
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: aeroColors.primary,
                  lineHeight: 1,
                }}
              >
                AERO
              </Typography>
            )}
          </Box>
          {!isCollapsed && (
            <Typography
              sx={{
                fontSize: '0.5625rem',
                letterSpacing: '0.18em',
                color: aeroColors.outline,
                textTransform: 'uppercase',
                fontWeight: 600,
                mt: 0.5,
                pl: 0.25,
              }}
            >
              Flight Operations
            </Typography>
          )}
        </Box>

        {/* Label separator */}
        {!isCollapsed && (
          <Box sx={{ px: 3, mb: 1 }}>
            <Typography
              sx={{
                fontSize: '0.5625rem',
                letterSpacing: '0.16em',
                color: `${aeroColors.outline}70`,
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Navigation
            </Typography>
          </Box>
        )}

        {/* Navigation items */}
        <List sx={{ px: 1, flex: 1, pt: 0 }} disablePadding>
          {NAV_ITEMS.filter((item) => !user?.role || item.roles.includes(user.role as Role)).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const crashing = isCrashing(item.path);
            return (
              <Tooltip
                key={item.path}
                title={isCollapsed ? item.label : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => handleNavClick(item.path)}
                  disableRipple={false}
                  sx={{
                    px: isCollapsed ? 0 : 2,
                    py: 1.125,
                    mb: 0.25,
                    borderRadius: 0,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderLeft: isActive
                      ? `2px solid ${aeroColors.tertiary}`
                      : '2px solid transparent',
                    bgcolor: isActive ? aeroColors.surfaceContainer : 'transparent',
                    color: isActive ? aeroColors.tertiary : aeroColors.outline,
                    gap: isCollapsed ? 0 : 1.5,
                    transition: 'all 0.15s ease',
                    overflow: 'visible',
                    '&:hover': {
                      bgcolor: isActive
                        ? aeroColors.surfaceContainer
                        : `${aeroColors.surfaceVariant}80`,
                      color: isActive ? aeroColors.tertiary : aeroColors.onSurface,
                      borderLeftColor: isActive ? aeroColors.tertiary : `${aeroColors.outline}50`,
                    },
                    '& .MuiTouchRipple-root .MuiTouchRipple-rippleVisible': {
                      color: `${aeroColors.primary}20`,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      color: 'inherit',
                      '& .MuiSvgIcon-root': {
                        fontSize: 17,
                        ...(crashing ? CRASH_ANIMATION_SX : {}),
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontFamily: '"Inter", sans-serif',
                          lineHeight: 1,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        {/* Bottom section */}
        <Box sx={{ px: isCollapsed ? 0 : 2, pb: 2.5 }}>
          <Divider sx={{ borderColor: `${aeroColors.outlineVariant}30`, mb: 2 }} />

          {/* User card */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? 0 : 1.5,
              px: isCollapsed ? 0 : 1,
              py: 0.75,
              mb: 1,
              borderRadius: 1,
            }}
          >
            <Tooltip title={isCollapsed ? `${userName} · ${userRole}` : ''} placement="right" arrow>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: aeroColors.primaryContainer,
                  color: aeroColors.primary,
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  border: `1px solid ${aeroColors.primary}25`,
                  flexShrink: 0,
                  cursor: isCollapsed ? 'default' : 'inherit',
                }}
              >
                {userInitials}
              </Avatar>
            </Tooltip>
            {!isCollapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: aeroColors.onSurface,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.5625rem',
                    color: aeroColors.outline,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    lineHeight: 1.2,
                  }}
                >
                  {userRole}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Logout */}
          <Tooltip title="Wyloguj się" placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                px: isCollapsed ? 0 : 2,
                py: 1,
                borderRadius: 0,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderLeft: '2px solid transparent',
                color: aeroColors.outline,
                gap: isCollapsed ? 0 : 1.5,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: `${aeroColors.error}12`,
                  color: aeroColors.error,
                  borderLeftColor: `${aeroColors.error}60`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  color: 'inherit',
                  '& .MuiSvgIcon-root': { fontSize: 17 },
                }}
              >
                <LogoutOutlinedIcon />
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary="Wyloguj"
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontFamily: '"Inter", sans-serif',
                      lineHeight: 1,
                    },
                  }}
                />
              )}
            </ListItemButton>
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
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page content — tactical grid atmosphere matches login page */}
        <Box
          ref={contentRef}
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
