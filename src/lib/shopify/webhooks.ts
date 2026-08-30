import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies a Shopify webhook's `X-Shopify-Hmac-Sha256` header against the
 * *raw* request body (must be the untouched bytes -- re-serializing
 * parsed JSON produces a different byte sequence and the signature won't
 * match). The secret comes from Shopify Admin -> Settings ->
 * Notifications -> Webhooks -> "Signing secret", not the Admin API access
 * token.
 */
export function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");

  const expectedBuffer = Buffer.from(expected, "base64");
  const receivedBuffer = Buffer.from(hmacHeader, "base64");
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
