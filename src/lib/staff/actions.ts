"use server";

import { revalidatePath } from "next/cache";

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

export async function updateOrderStatusAction(orderId: string, status: OrderStatus): Promise<ActionResult> {
  if (!ALL_STATUSES.includes(status)) return { ok: false, error: "Invalid status." };

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
    event_type: "STAFF_STATUS_CHANGE",
    from_status: existing?.status ?? null,
    to_status: status,
    actor_type: "staff",
  });

  revalidatePath(`/staff/${orderId}`);
  revalidatePath("/staff");
  return { ok: true };
}
