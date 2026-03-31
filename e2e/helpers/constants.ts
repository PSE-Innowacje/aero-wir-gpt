/** Seed users created by DataInitializer */
export const USERS = {
  admin: { email: 'admin@aero.pl', password: 'admin', role: 'ADMIN' as const },
  planner: { email: 'planista@aero.pl', password: 'planista', role: 'PLANNER' as const },
  supervisor: { email: 'nadzor@aero.pl', password: 'nadzor', role: 'SUPERVISOR' as const },
  pilot: { email: 'pilot@aero.pl', password: 'pilot', role: 'PILOT' as const },
} as const;

export const API_BASE = 'http://localhost:8080/api';

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  helicopters: '/helicopters',
  crew: '/crew',
  landingSites: '/landing-sites',
  users: '/users',
  operations: '/operations',
  orders: '/orders',
} as const;

/** Navigation items visible in the sidebar */
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Helikoptery', path: '/helicopters' },
  { label: 'Załoga', path: '/crew' },
  { label: 'Lądowiska', path: '/landing-sites' },
  { label: 'Operacje lotnicze', path: '/operations' },
  { label: 'Zlecenia lotnicze', path: '/orders' },
  { label: 'Użytkownicy', path: '/users' },
] as const;
