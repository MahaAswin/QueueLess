import type { Role } from '../types/auth.types';

/**
 * Returns the default dashboard home route for a given user role.
 */
export const getRoleHomeRoute = (role?: Role | null): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'SHOP_OWNER':
      return '/shop-owner';
    case 'CUSTOMER':
      return '/customer';
    default:
      return '/login';
  }
};

/**
 * Checks whether a given path is authorized for the specified user role.
 */
export const isRouteAllowedForRole = (pathname: string, role?: Role | null): boolean => {
  if (!role || !pathname) return false;

  // Prevent redirect loops to auth or error pages
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forbidden')
  ) {
    return false;
  }

  if (role === 'ADMIN') {
    return pathname.startsWith('/admin');
  }

  if (role === 'SHOP_OWNER') {
    return pathname.startsWith('/shop-owner') || pathname.startsWith('/shop');
  }

  if (role === 'CUSTOMER') {
    return pathname.startsWith('/customer');
  }

  return false;
};

/**
 * Validates if the user's role satisfies the required roles.
 */
export const checkUserRole = (
  userRole?: Role | null,
  requiredRoles?: Role | Role[]
): boolean => {
  if (!userRole || !requiredRoles) return false;
  const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return allowed.includes(userRole);
};
