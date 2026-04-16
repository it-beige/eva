import { UserRole } from '@eva/shared';
import type { AuthenticatedUser } from '@eva/shared';

export const SESSION_STORAGE_KEYS = {
  token: 'token',
  currentUser: 'currentUser',
} as const;

export function getAccessToken(): string | null {
  return localStorage.getItem(SESSION_STORAGE_KEYS.token);
}

export function getCurrentUser(): AuthenticatedUser | null {
  const rawUser = localStorage.getItem(SESSION_STORAGE_KEYS.currentUser);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthenticatedUser;
  } catch {
    clearSession();
    return null;
  }
}

export function persistSession(
  accessToken: string,
  user: AuthenticatedUser,
): void {
  localStorage.setItem(SESSION_STORAGE_KEYS.token, accessToken);
  localStorage.setItem(SESSION_STORAGE_KEYS.currentUser, JSON.stringify(user));
}

export function persistCurrentUser(user: AuthenticatedUser): void {
  localStorage.setItem(SESSION_STORAGE_KEYS.currentUser, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEYS.token);
  localStorage.removeItem(SESSION_STORAGE_KEYS.currentUser);
}

export function hasRole(
  user: AuthenticatedUser | null,
  requiredRole: UserRole,
): boolean {
  if (!user) {
    return false;
  }

  if (requiredRole === UserRole.USER) {
    return true;
  }

  return user.role === requiredRole;
}
