"use server";

import { revalidatePath } from "next/cache";

import { notifyDiscord } from "@/lib/discord/notify";
import { cancelShopifyOrder, refundShopifyOrder } from "@/lib/shopify/cancel";
import { fulfillShopifyOrder } from "@/lib/shopify/fulfillment";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types/order";

interface ActionResult {
  ok: boolean;
  error?: string;
}

const ALL_STATUSES: OrderStatus[] = [
  "payment_pending",
  "payment_confirmed",
  "awaiting_account",
  "account_linked",
  "awaiting_customer",
  "customer_ready",
  "queued",
  "agent_assigned",
  "delivery_preparing",
  "customer_joining",
  "delivery_in_progress",
  "delivered",
  "delivery_failed",
  "manual_review",
  "cancelled",
  "refunded",
];

export async function sendStaffMessageAction(orderId: string, text: string): Promise<ActionResult> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("messages")
    .insert({ order_id: orderId, sender: "agent", agent_name: "Staff", content: text });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/staff/${orderId}`);
  return { ok: true };
}

async function setOrderStatus(orderId: string, status: OrderStatus, eventType: string): Promise<ActionResult> {
  const supabase = getSupabaseServerClient();
  const { data: existing } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();

  const nowIso = new Date().toISOString();
  const updates: Record<string, unknown> = { status, updated_at: nowIso };
  if (status === "delivered") updates.delivered_at = nowIso;

  const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("order_events").insert({
    order_id: orderId,
    event_type: eventType,
    from_status: existing?.status ?? null,
    to_status: status,
    actor_type: "staff",
  });

  revalidatePath(`/staff/${orderId}`);
  revalidatePath("/staff");
  return { ok: true };
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus): Promise<ActionResult> {
  if (!ALL_STATUSES.includes(status)) return { ok: false, error: "Invalid status." };
  return setOrderStatus(orderId, status, "STAFF_STATUS_CHANGE");
}

interface TerminalActionParams {
  orderId: string;
  shopifyOrderId: string | null;
  publicOrderNumber: string;
}

/**
 * These three are the real, money-moving actions -- each one calls
 * Shopify first and only touches our own `orders` row if Shopify confirms
 * it worked. Never flip the internal status first: a Shopify failure
 * after that would leave our database saying "delivered"/"refunded" while
 * the actual store disagrees, which is worse than just failing the click
 * and letting staff retry.
 */

export async function fulfillOrderAction(params: TerminalActionParams): Promise<ActionResult> {
  const { orderId, shopifyOrderId, publicOrderNumber } = params;
  if (!shopifyOrderId) return { ok: false, error: "This order has no linked Shopify order id." };

  try {
    const result = await fulfillShopifyOrder(shopifyOrderId);
    if (!result.ok) return { ok: false, error: result.error };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Shopify request failed." };
  }

  const dbResult = await setOrderStatus(orderId, "delivered", "STAFF_FULFILLED");
  if (dbResult.ok) {
    await notifyDiscord(`✅ **Order #${publicOrderNumber} marked Fulfilled** and delivered on Shopify.`);
  }
  return dbResult;
}

export async function cancelOrderAction(params: TerminalActionParams): Promise<ActionResult> {
  const { orderId, shopifyOrderId, publicOrderNumber } = params;
  if (!shopifyOrderId) return { ok: false, error: "This order has no linked Shopify order id." };

  try {
    const result = await cancelShopifyOrder(shopifyOrderId);
    if (!result.ok) return { ok: false, error: result.error };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Shopify request failed." };
  }

  const dbResult = await setOrderStatus(orderId, "cancelled", "STAFF_CANCELLED");
  if (dbResult.ok) {
    await notifyDiscord(`🚫 **Order #${publicOrderNumber} cancelled** on Shopify (no refund issued).`);
  }
  return dbResult;
}

export async function refundOrderAction(params: TerminalActionParams): Promise<ActionResult> {
  const { orderId, shopifyOrderId, publicOrderNumber } = params;
  if (!shopifyOrderId) return { ok: false, error: "This order has no linked Shopify order id." };

  try {
    const result = await refundShopifyOrder(shopifyOrderId);
    if (!result.ok) return { ok: false, error: result.error };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Shopify request failed." };
  }

  const dbResult = await setOrderStatus(orderId, "refunded", "STAFF_REFUNDED");
  if (dbResult.ok) {
    await notifyDiscord(`↩️ **Order #${publicOrderNumber} refunded** in full on Shopify.`);
  }
  return dbResult;
}
