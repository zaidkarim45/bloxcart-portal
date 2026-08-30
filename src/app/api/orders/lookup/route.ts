import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Backs the post-purchase auto-redirect (see /redirecting). Deliberately
 * requires BOTH the Shopify order id AND the order's email to match --
 * shopify_order_id alone is sequential/guessable, so a lookup keyed on it
 * alone would let anyone enumerate other customers' real order tokens.
 * Requiring the email too (which Shopify's own order-status page already
 * gates behind its own secret URL) makes that impractical without
 * actually exposing anything new. Never returns *why* a lookup failed --
 * "not found" covers both "no such order yet" (webhook hasn't landed)
 * and "wrong email" so as not to help an attacker distinguish the two.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopifyOrderId = searchParams.get("shopify_order_id");
  const email = searchParams.get("email");

  if (!shopifyOrderId || !email) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select("public_access_token, customers ( email )")
    .eq("shopify_order_id", shopifyOrderId)
    .maybeSingle<{
      public_access_token: string;
      customers: { email: string } | null;
    }>();

  const matches = data?.customers?.email?.toLowerCase() === email.toLowerCase();
  if (!data || !matches) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, token: data.public_access_token });
}
