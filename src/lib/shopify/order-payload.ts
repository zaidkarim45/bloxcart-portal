/**
 * Minimal shape we actually read off a Shopify order webhook payload
 * (orders/paid). Shopify's real payload has dozens more fields; only
 * declaring what's used keeps this honest about what this integration
 * actually depends on.
 */
export interface ShopifyOrderPayload {
  id: number;
  name: string;
  email: string | null;
  currency: string;
  total_price: string;
  subtotal_price: string;
  total_discounts: string;
  line_items: {
    title: string;
    quantity: number;
    price: string;
  }[];
}

export function isShopifyOrderPayload(value: unknown): value is ShopifyOrderPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.name === "string" &&
    typeof v.currency === "string" &&
    typeof v.total_price === "string" &&
    Array.isArray(v.line_items)
  );
}
