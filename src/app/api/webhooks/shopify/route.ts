import { NextResponse } from "next/server";

import { createOrderFromShopifyPayload } from "@/lib/orders/create-from-shopify";
import { isShopifyOrderPayload } from "@/lib/shopify/order-payload";
import { verifyShopifyWebhook } from "@/lib/shopify/webhooks";

/**
 * Receives Shopify's `orders/paid` webhook. Configure this URL in Shopify
 * Admin -> Settings -> Notifications -> Webhooks, topic "Order payment",
 * format JSON. Payment authority comes entirely from this verified
 * webhook -- nothing client-side can mark an order paid (see spec:
 * "Never trust arbitrary browser requests saying payment completed").
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
    console.error("Shopify webhook: invalid or missing HMAC signature.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isShopifyOrderPayload(payload)) {
    console.error("Shopify webhook: payload missing expected order fields.");
    return NextResponse.json({ error: "Unexpected payload shape" }, { status: 400 });
  }

  try {
    const result = await createOrderFromShopifyPayload(payload);
    return NextResponse.json({ ok: true, created: result.created });
  } catch (err) {
    console.error("Shopify webhook: failed to create order:", err instanceof Error ? err.message : err);
    // 500 so Shopify retries -- this is a real processing failure on our
    // end, not a payload problem, so a retry has a real chance of
    // succeeding once transient.
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
