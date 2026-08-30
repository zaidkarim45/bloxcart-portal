import { randomBytes } from "node:crypto";

/**
 * Cryptographically secure, URL-safe token for `/order/[token]` -- never
 * expose a database row id as the customer-facing order URL (see
 * docs/ARCHITECTURE.md's "order security" note). 24 random bytes = 32
 * base64url characters, effectively unguessable.
 */
export function generateOrderToken(): string {
  return randomBytes(24).toString("base64url");
}
