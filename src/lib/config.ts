/**
 * Demo/mock mode is an explicit flag, not inferred from missing env vars --
 * inferring it would make "forgot to set a credential in production" look
 * identical to "intentionally running the demo," which is exactly the kind
 * of silent fake-integration this project's spec rules out.
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

/**
 * The portal's own public URL -- used for links *about* the portal (e.g.
 * a Discord notification linking to a staff page), never for routing
 * within the app itself. Reading it from an env var means a domain
 * change (like moving off the default *.vercel.app address to a custom
 * domain) is a Vercel env var edit, not a grep-and-redeploy across every
 * file that happened to hardcode the old one.
 */
export function getPortalUrl(): string {
  return process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://bloxcart-portal.vercel.app";
}
