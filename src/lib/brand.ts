/**
 * Central brand configuration. Nothing in the app should hardcode a brand
 * name/URL/color directly — read it from here instead, so the whole
 * storefront can be re-skinned (or run under a placeholder identity in
 * development) without touching component code.
 */
export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Bloxcart",
  shortName: process.env.NEXT_PUBLIC_BRAND_SHORT_NAME ?? "Bloxcart",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
  storeUrl: process.env.NEXT_PUBLIC_STORE_URL ?? "https://example.com",
  supportUrl: process.env.NEXT_PUBLIC_SUPPORT_URL ?? "https://example.com/contact",
  primaryColor: "#8b5cf6",
} as const;
