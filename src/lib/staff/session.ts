import "server-only";

/**
 * Single-shared-password staff auth -- there's one operator right now, so
 * a per-user account system (staff_users table exists in the schema for
 * later) would be pure overhead. STAFF_SESSION_SECRET is a separate random
 * value from STAFF_PASSWORD: it's what actually gets stored in the
 * cookie, so the password itself is never persisted client-side.
 */
export const STAFF_COOKIE_NAME = "staff_session";

export function getStaffSessionSecret(): string {
  const secret = process.env.STAFF_SESSION_SECRET;
  if (!secret) throw new Error("STAFF_SESSION_SECRET is not configured.");
  return secret;
}

export function isValidStaffSession(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    return token === getStaffSessionSecret();
  } catch {
    return false;
  }
}
