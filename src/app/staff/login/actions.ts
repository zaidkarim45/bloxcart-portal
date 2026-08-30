"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { STAFF_COOKIE_NAME, getStaffSessionSecret } from "@/lib/staff/session";

export async function staffLoginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0 || password !== process.env.STAFF_PASSWORD) {
    return { error: "Wrong password." };
  }

  let secret: string;
  try {
    secret = getStaffSessionSecret();
  } catch {
    return { error: "Staff login isn't configured yet (missing STAFF_SESSION_SECRET)." };
  }

  const cookieStore = await cookies();
  cookieStore.set(STAFF_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/staff");
}

export async function staffLogoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE_NAME);
  redirect("/staff/login");
}
