import { NextResponse } from "next/server";

import { getOrderMessages } from "@/lib/orders/get-messages";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Polling endpoint backing the customer chat's "live" updates -- see the
 * matching /api/staff/orders/[id]/messages route for the staff side.
 *
 * No Supabase Realtime here: RLS on `messages` intentionally has no
 * policies (see supabase/schema.sql), so the anon key the browser would
 * need for a realtime subscription can't read this table at all, and
 * loosening that just to get push updates would be a real security
 * regression for a payment-adjacent app. A few-second poll gets the same
 * "feels live" result for a support chat without touching that.
 *
 * `token` is the order's public_access_token -- same trust model
 * sendCustomerMessageAction already uses for writes, applied here to
 * reads: possession of the (long, random) token is the credential.
 */
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { searchParams } = new URL(request.url);
  const after = searchParams.get("after") ?? undefined;

  const supabase = getSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("public_access_token", token)
    .maybeSingle<{ id: string }>();

  if (!order) {
    return NextResponse.json({ messages: [] }, { status: 404 });
  }

  const messages = await getOrderMessages(order.id, after);
  return NextResponse.json({ messages });
}
