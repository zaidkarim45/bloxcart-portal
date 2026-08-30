/**
 * Demo/mock mode is an explicit flag, not inferred from missing env vars --
 * inferring it would make "forgot to set a credential in production" look
 * identical to "intentionally running the demo," which is exactly the kind
 * of silent fake-integration this project's spec rules out.
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
