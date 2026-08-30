export interface RobloxProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export type RobloxLookupError = "not_found" | "unavailable" | "timeout";

export type RobloxLookupResult =
  | { ok: true; profile: RobloxProfile }
  | { ok: false; error: RobloxLookupError };
