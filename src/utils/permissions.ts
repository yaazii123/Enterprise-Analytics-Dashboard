import type { Role } from '@/types';

export type AppRouteKey =
  | 'overview'
  | 'revenue'
  | 'customers'
  | 'products'
  | 'orders'
  | 'reports'
  | 'settings';

/** Which roles may open each page. Single source of truth for nav + route guards. */
export const ROUTE_ACCESS: Record<AppRouteKey, Role[]> = {
  overview: ['admin', 'manager', 'analyst'],
  revenue: ['admin', 'manager', 'analyst'],
  customers: ['admin', 'manager'],
  products: ['admin', 'manager', 'analyst'],
  orders: ['admin', 'manager', 'analyst'],
  reports: ['admin', 'manager'],
  settings: ['admin', 'manager', 'analyst'],
};

export type Capability = 'export:csv' | 'reports:generate' | 'settings:dashboard' | 'settings:team';

export const CAPABILITIES: Record<Capability, Role[]> = {
  'export:csv': ['admin', 'manager', 'analyst'],
  'reports:generate': ['admin', 'manager'],
  'settings:dashboard': ['admin', 'manager'],
  'settings:team': ['admin'],
};

export const canAccess = (role: Role | undefined, route: AppRouteKey): boolean =>
  !!role && ROUTE_ACCESS[route].includes(role);

export const can = (role: Role | undefined, cap: Capability): boolean =>
  !!role && CAPABILITIES[cap].includes(role);

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  analyst: 'Analyst',
};
