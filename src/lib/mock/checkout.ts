import type { CheckoutLineItem } from "@/lib/types/checkout";

/**
 * Development-only seed data so the checkout page can be built and reviewed
 * before Shopify/cart data is wired in. Mirrors the demo order used on the
 * order portal (`/order/demo`) so the two pages tell one consistent story.
 */
export const MOCK_CHECKOUT_ITEMS: CheckoutLineItem[] = [
  {
    id: "run-faster",
    name: "Run Faster",
    imageUrl: null,
    quantity: 1,
    unitPrice: 5.49,
  },
];

export const MOCK_VALID_DISCOUNT_CODES: Record<string, number> = {
  BLOXY: 0.54,
};
