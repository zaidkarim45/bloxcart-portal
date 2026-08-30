export interface CheckoutLineItem {
  id: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
}

export type DiscountState = "idle" | "checking" | "applied" | "invalid" | "error";

export interface AppliedDiscount {
  code: string;
  /** Amount deducted from the subtotal, in the same currency as the order. */
  amount: number;
}

export interface CheckoutSummary {
  items: CheckoutLineItem[];
  currency: string;
  subtotal: number;
  discount: AppliedDiscount | null;
  total: number;
}
