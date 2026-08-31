import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getOrderMessages } from "@/lib/orders/get-messages";
import { STAFF_COOKIE_NAME, isValidStaffSession } from "@/lib/staff/session";

/**
 * Polling endpoint backing the staff chat's "live" updates -- see the
 * matching /api/order/[token]/messages route for the customer side and
 * why this is polling rather than a Supabase Realtime subscription.
 *
 * `/staff/:path*` is normally gated by src/proxy.ts, but that matcher
 * doesn't cover /api routes, so this checks the same staff_session
 * cookie directly.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  if (!isValidStaffSession(token)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const after = searchParams.get("after") ?? undefined;

  const messages = await getOrderMessages(id, after);
  return NextResponse.json({ messages });
}
