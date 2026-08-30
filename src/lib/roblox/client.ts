"use server";

import type { RobloxLookupResult } from "@/lib/roblox/types";

/**
 * Real Roblox public-profile lookup -- both endpoints below are Roblox's
 * own public, unauthenticated APIs (no login, cookie, or API key), and
 * this only ever runs server-side (the "use server" directive makes it a
 * Server Action, callable directly from client components without a
 * separate API route). Never collects Roblox credentials -- see
 * docs/ARCHITECTURE.md.
 */

const USER_AGENT = process.env.ROBLOX_API_USER_AGENT || "bloxcart-portal/1.0";

interface RobloxUsernameLookupResponse {
  data: { id: number; name: string; displayName: string }[];
}

interface RobloxAvatarResponse {
  data: { targetId: number; state: string; imageUrl: string }[];
}

export async function findUserByUsername(rawUsername: string): Promise<RobloxLookupResult> {
  const username = rawUsername.trim();
  if (!username) {
    return { ok: false, error: "not_found" };
  }

  let userLookup: RobloxUsernameLookupResponse;
  try {
    const res = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Roblox username lookup failed:", res.status);
      return { ok: false, error: "unavailable" };
    }
    userLookup = await res.json();
  } catch (err) {
    console.error("Roblox username lookup errored:", err instanceof Error ? err.message : err);
    return { ok: false, error: "unavailable" };
  }

  const match = userLookup.data?.[0];
  if (!match) {
    return { ok: false, error: "not_found" };
  }

  // A failed/slow avatar fetch shouldn't fail the whole lookup -- the
  // account card just falls back to initials (see components/ui/avatar.tsx).
  let avatarUrl: string | null = null;
  try {
    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${match.id}&size=150x150&format=Png&isCircular=true`,
      { headers: { "User-Agent": USER_AGENT }, cache: "no-store" }
    );
    if (avatarRes.ok) {
      const avatarJson: RobloxAvatarResponse = await avatarRes.json();
      const avatarData = avatarJson.data?.[0];
      if (avatarData?.state === "Completed") {
        avatarUrl = avatarData.imageUrl;
      }
    }
  } catch (err) {
    console.error("Roblox avatar lookup errored:", err instanceof Error ? err.message : err);
  }

  return {
    ok: true,
    profile: {
      id: String(match.id),
      username: match.name,
      displayName: match.displayName || match.name,
      avatarUrl,
    },
  };
}
