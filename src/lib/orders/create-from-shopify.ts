import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateOrderToken } from "@/lib/security/tokens";
import type { ShopifyOrderPayload } from "@/lib/shopify/order-payload";

interface CreateResult {
  created: boolean;
  token: string;
}

/**
 * Idempotent by design: `orders.shopify_order_id` is UNIQUE (see
 * supabase/schema.sql), so if Shopify redelivers the same webhook (it
 * does this routinely, not just on failure), the insert below hits that
 * constraint and this returns the *existing* order's token instead of
 * creating a duplicate. Never trust this payload as proof of payment on
 * its own -- the caller must have already verified the webhook's HMAC
 * signature (see lib/shopify/webhooks.ts) before calling this.
 */
export async function createOrderFromShopifyPayload(
  payload: ShopifyOrderPayload
): Promise<CreateResult> {
  const supabase = getSupabaseServerClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("public_access_token")
    .eq("shopify_order_id", String(payload.id))
    .maybeSingle();

  if (existing) {
    return { created: false, token: existing.public_access_token };
  }

  let customerId: string | null = null;
  if (payload.email) {
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", payload.email)
      .maybeSingle();

    customerId =
      existingCustomer?.id ??
      (
        await supabase
          .from("customers")
          .insert({ email: payload.email })
          .select("id")
          .single()
      ).data?.id ??
      null;
  }

  const token = generateOrderToken();
  const publicOrderNumber = payload.name.replace(/^#/, "");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      public_order_number: publicOrderNumber,
      public_access_token: token,
      shopify_order_id: String(payload.id),
      shopify_order_name: payload.name,
      customer_id: customerId,
      status: "awaiting_account",
      subtotal: Number(payload.subtotal_price),
      discount_total: Number(payload.total_discounts),
      total: Number(payload.total_price),
      currency: payload.currency,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    // Unique-violation race (two webhook deliveries landing at the same
    // instant) looks like this -- treat it the same as the up-front
    // existing-order check above rather than surfacing an error.
    const { data: raceWinner } = await supabase
      .from("orders")
      .select("public_access_token")
      .eq("shopify_order_id", String(payload.id))
      .maybeSingle();
    if (raceWinner) return { created: false, token: raceWinner.public_access_token };
    throw new Error(orderError?.message ?? "Failed to create order.");
  }

  if (payload.line_items.length > 0) {
    await supabase.from("order_items").insert(
      payload.line_items.map((item) => ({
        order_id: order.id,
        name: item.title,
        quantity: item.quantity,
        price: Number(item.price),
        fulfilled: false,
      }))
    );
  }

  await supabase.from("order_events").insert({
    order_id: order.id,
    event_type: "PAYMENT_CONFIRMED",
    to_status: "awaiting_account",
    actor_type: "system",
    metadata: { shopify_order_id: payload.id },
  });

  return { created: true, token };
}
