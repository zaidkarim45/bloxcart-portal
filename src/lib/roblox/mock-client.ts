import type { RobloxLookupResult, RobloxProfile } from "@/lib/roblox/types";

/**
 * Development stand-in for a real Roblox public-profile lookup
 * (`findUserByUsername`). A real implementation would call Roblox's public
 * users/avatar endpoints server-side and return this exact shape -- no
 * caller of this function should need to change when that swap happens.
 * We only ever resolve public identity (id/username/display name/avatar),
 * never anything requiring authentication.
 */
const KNOWN_PROFILES: Record<string, RobloxProfile> = {
  chillysghost: {
    id: "184312765",
    username: "ChillysGhost",
    displayName: "ChillysGhost",
    avatarUrl: null,
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function findUserByUsername(rawUsername: string): Promise<RobloxLookupResult> {
  const username = rawUsername.trim();
  await delay(900);

  if (!username) {
    return { ok: false, error: "not_found" };
  }

  // Dev-only trigger for exercising the "Roblox API unavailable" state --
  // see the demo controls panel.
  if (username.toLowerCase() === "unavailableuser") {
    return { ok: false, error: "unavailable" };
  }

  const known = KNOWN_PROFILES[username.toLowerCase()];
  if (known) {
    return { ok: true, profile: known };
  }

  if (username.length < 3) {
    return { ok: false, error: "not_found" };
  }

  // Any other plausible username resolves to a synthesized mock profile so
  // the linking flow is fully demoable without a fixed allowlist.
  return {
    ok: true,
    profile: {
      id: String(Math.abs(hashCode(username.toLowerCase()))),
      username,
      displayName: username,
      avatarUrl: null,
    },
  };
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
