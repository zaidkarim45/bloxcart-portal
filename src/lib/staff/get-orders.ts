import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Order, OrderStatus } from "@/lib/types/order";

export interface StaffOrderSummary {
  id: string;
  publicOrderNumber: string;
  status: OrderStatus;
  total: number;
  currency: string;
  customerEmail: string | null;
  robloxUsername: string | null;
  updatedAt: string;
}

interface StaffOrderSummaryRow {
  id: string;
  public_order_number: string;
  status: OrderStatus;
  total: number;
  currency: string;
  updated_at: string;
  customers: { email: string } | null;
  roblox_accounts: { username: string } | null;
}

export async function getStaffOrders(): Promise<StaffOrderSummary[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, public_order_number, status, total, currency, updated_at,
       customers ( email ), roblox_accounts ( username )`
    )
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("getStaffOrders failed:", error.message);
    return [];
  }

  return (data as unknown as StaffOrderSummaryRow[]).map((row) => ({
    id: row.id,
    publicOrderNumber: row.public_order_number,
    status: row.status,
    total: Number(row.total),
    currency: row.currency,
    customerEmail: row.customers?.email ?? null,
    robloxUsername: row.roblox_accounts?.username ?? null,
    updatedAt: row.updated_at,
  }));
}

export type StaffOrderDetail = Order & { customerEmail: string | null };

interface StaffOrderDetailRow {
  id: string;
  public_order_number: string;
  status: OrderStatus;
  total: number;
  currency: string;
  customer_ready_at: string | null;
  delivered_at: string | null;
  created_at: string;
  customers: { email: string } | null;
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

export async function getStaffOrder(id: string): Promise<StaffOrderDetail | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, public_order_number, status, total, currency,
      customer_ready_at, delivered_at, created_at,
      customers ( email ),
      roblox_accounts ( roblox_user_id, username, display_name, avatar_url ),
      order_items ( id, name, image_url, quantity, price, fulfilled )
    `
    )
    .eq("id", id)
    .maybeSingle<StaffOrderDetailRow>();

  if (error) {
    console.error("getStaffOrder failed:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    publicOrderNumber: data.public_order_number,
    createdAt: data.created_at,
    currency: data.currency,
    total: Number(data.total),
    status: data.status,
    customerEmail: data.customers?.email ?? null,
    robloxAccount: data.roblox_accounts
      ? {
          id: data.roblox_accounts.roblox_user_id,
          username: data.roblox_accounts.username,
          displayName: data.roblox_accounts.display_name,
          avatarUrl: data.roblox_accounts.avatar_url,
          verified: true,
        }
      : null,
    items: data.order_items.map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_url,
      quantity: item.quantity,
      price: Number(item.price),
      fulfilled: item.fulfilled,
    })),
    customerReadyAt: data.customer_ready_at,
    deliveredAt: data.delivered_at,
    assignedAgentName: null,
  };
}
