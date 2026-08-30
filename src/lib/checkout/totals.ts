import type { AppliedDiscount, CheckoutLineItem } from "@/lib/types/checkout";

export function computeSubtotal(items: CheckoutLineItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function computeTotal(subtotal: number, discount: AppliedDiscount | null): number {
  const total = subtotal - (discount?.amount ?? 0);
  return Math.max(total, 0);
}
