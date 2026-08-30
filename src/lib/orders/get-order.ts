import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Order, OrderStatus } from "@/lib/types/order";

interface OrderRow {
  id: string;
  public_order_number: string;
  status: OrderStatus;
  total: number;
  currency: string;
  customer_ready_at: string | null;
  delivered_at: string | null;
  created_at: string;
  roblox_accounts: {
    roblox_user_id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  order_items: {
    id: string;
    name: string;
    image_url: string | null;
    quantity: number;
    price: number;
    fulfilled: boolean;
  }[];
}

function mapRowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    publicOrderNumber: row.public_order_number,
    createdAt: row.created_at,
    currency: row.currency,
    total: Number(row.total),
    status: row.status,
    robloxAccount: row.roblox_accounts
      ? {
          id: row.roblox_accounts.roblox_user_id,
          username: row.roblox_accounts.username,
          displayName: row.roblox_accounts.display_name,
          avatarUrl: row.roblox_accounts.avatar_url,
          verified: true,
        }
      : null,
    items: row.order_items.map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_url,
      quantity: item.quantity,
      price: Number(item.price),
      fulfilled: item.fulfilled,
    })),
    customerReadyAt: row.customer_ready_at,
    deliveredAt: row.delivered_at,
    assignedAgentName: null,
  };
}

export type GetOrderResult =
  | { ok: true; order: Order }
  | { ok: false; reason: "not_configured" | "query_failed" | "not_found"; detail: string };

/**
 * Returns a discriminated result instead of null-for-everything. This
 * project is still pre-launch (no real customers can hit this yet), so
 * while we're bringing the real database online it's more useful for
 * `/order/[token]` to show the *actual* reason on screen than to collapse
 * "misconfigured" and "genuinely no such order" into the same blank 404 --
 * that distinction is exactly what's been impossible to tell apart the
 * last few debugging rounds. Tighten this back to a uniform not-found
 * before real customers can reach this route.
 */
export async function getOrderByToken(token: string): Promise<GetOrderResult> {
  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("getOrderByToken: Supabase not configured:", detail);
    return { ok: false, reason: "not_configured", detail };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, public_order_number, status, total, currency,
      customer_ready_at, delivered_at, created_at,
      roblox_accounts ( roblox_user_id, username, display_name, avatar_url ),
      order_items ( id, name, image_url, quantity, price, fulfilled )
    `
    )
    .eq("public_access_token", token)
    .maybeSingle<OrderRow>();

  if (error) {
    console.error("getOrderByToken query failed:", error.message);
    return { ok: false, reason: "query_failed", detail: error.message };
  }
  if (!data) {
    return { ok: false, reason: "not_found", detail: `No order with token "${token}".` };
  }

  return { ok: true, order: mapRowToOrder(data) };
}
