"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { RobloxProfile } from "@/lib/roblox/types";

/**
 * These two actions are the seed of the real order state machine (the
 * rest of Phase E) -- each one loads the order, checks its current
 * status, writes the change, and appends an order_events row in the same
 * pass. They're deliberately direct rather than routed through a generic
 * `transitionOrderStatus()` yet; generalize that once a third and fourth
 * transition (agent assignment, delivery completion -- Phase H) need the
 * same shape, rather than guessing the right abstraction from two cases.
 */

interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function linkRobloxAccountAction(
  token: string,
  profile: RobloxProfile
): Promise<ActionResult> {
  const supabase = getSupabaseServerClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("public_access_token", token)
    .maybeSingle();

  if (orderError) return { ok: false, error: orderError.message };
  if (!order) return { ok: false, error: "Order not found." };

  const { data: account, error: accountError } = await supabase
    .from("roblox_accounts")
    .upsert(
      {
        roblox_user_id: profile.id,
        username: profile.username,
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
      },
      { onConflict: "roblox_user_id" }
    )
    .select("id")
    .single();

  if (accountError) return { ok: false, error: accountError.message };

  // Lands directly on "awaiting_customer" (the resting state OrderHero
  // shows the "I'm Ready" button for) rather than pausing on
  // "account_linked" -- the demo hook's brief stop there exists only to
  // sequence the assistant's chat messages, which this real action
  // doesn't do yet.
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      roblox_account_id: account.id,
      status: "awaiting_customer",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) return { ok: false, error: updateError.message };

  await supabase.from("order_events").insert({
    order_id: order.id,
    event_type: "ROBLOX_ACCOUNT_LINKED",
    from_status: order.status,
    to_status: "awaiting_customer",
    actor_type: "customer",
    metadata: { roblox_username: profile.username },
  });

  revalidatePath(`/order/${token}`);
  return { ok: true };
}

export async function markCustomerReadyAction(token: string): Promise<ActionResult> {
  const supabase = getSupabaseServerClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("public_access_token", token)
    .maybeSingle();

  if (orderError) return { ok: false, error: orderError.message };
  if (!order) return { ok: false, error: "Order not found." };

  const nowIso = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "queued", customer_ready_at: nowIso, updated_at: nowIso })
    .eq("id", order.id);

  if (updateError) return { ok: false, error: updateError.message };

  await supabase.from("order_events").insert({
    order_id: order.id,
    event_type: "CUSTOMER_READY",
    from_status: order.status,
    to_status: "queued",
    actor_type: "customer",
  });

  revalidatePath(`/order/${token}`);
  return { ok: true };
}
