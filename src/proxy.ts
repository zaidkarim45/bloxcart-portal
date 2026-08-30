import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { STAFF_COOKIE_NAME, isValidStaffSession } from "@/lib/staff/session";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/staff/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(STAFF_COOKIE_NAME)?.value;
  if (!isValidStaffSession(token)) {
    return NextResponse.redirect(new URL("/staff/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"],
};
