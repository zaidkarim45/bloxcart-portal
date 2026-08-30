"use client";

import { AnimatePresence, motion } from "framer-motion";

import { DiscountInput } from "@/components/checkout/discount-input";
import { ProductSummaryItem } from "@/components/checkout/product-summary-item";
import { TrustCards } from "@/components/checkout/trust-cards";
import { computeSubtotal, computeTotal } from "@/lib/checkout/totals";
import { formatMoney } from "@/lib/format";
import type { AppliedDiscount, CheckoutLineItem, DiscountState } from "@/lib/types/checkout";
import { cn } from "@/lib/utils";

export interface OrderSummaryProps {
  items: CheckoutLineItem[];
  currency: string;
  discountState: DiscountState;
  appliedDiscount: AppliedDiscount | null;
  onApplyDiscount: (code: string) => void;
  onRemoveDiscount: () => void;
}

function AnimatedAmount({ value, currency, className }: { value: number; currency: string; className?: string }) {
  return (
    <span className={cn("relative inline-grid overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="col-start-1 row-start-1"
        >
          {formatMoney(value, currency)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function OrderSummary({
  items,
  currency,
  discountState,
  appliedDiscount,
  onApplyDiscount,
  onRemoveDiscount,
}: OrderSummaryProps) {
  const subtotal = computeSubtotal(items);
  const total = computeTotal(subtotal, appliedDiscount);

  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6">
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <ProductSummaryItem key={item.id} item={item} currency={currency} />
        ))}
      </div>

      <DiscountInput
        state={discountState}
        applied={appliedDiscount}
        currency={currency}
        onApply={onApplyDiscount}
        onRemove={onRemoveDiscount}
      />

      <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <AnimatedAmount value={subtotal} currency={currency} className="text-foreground" />
        </div>

        <AnimatePresence>
          {appliedDiscount ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between text-success"
            >
              <span>Discount &middot; {appliedDiscount.code}</span>
              <span>&minus;{formatMoney(appliedDiscount.amount, currency)}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
          <span className="text-base font-semibold text-foreground">Total</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">{currency}</span>
            <AnimatedAmount
              value={total}
              currency={currency}
              className="text-xl font-bold text-foreground"
            />
          </div>
        </div>
      </div>

      <TrustCards />
    </aside>
  );
}
