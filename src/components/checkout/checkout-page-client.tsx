"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { BillingSection, type BillingAddress } from "@/components/checkout/billing-section";
import { CheckoutLayout } from "@/components/checkout/checkout-layout";
import { ContactSection } from "@/components/checkout/contact-section";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentSection } from "@/components/checkout/payment-section";
import { Button } from "@/components/ui/button";
import { computeSubtotal, computeTotal } from "@/lib/checkout/totals";
import { formatMoney } from "@/lib/format";
import { MOCK_CHECKOUT_ITEMS, MOCK_VALID_DISCOUNT_CODES } from "@/lib/mock/checkout";
import type { AppliedDiscount, DiscountState } from "@/lib/types/checkout";

const CURRENCY = "USD";

// Simulated latency for the mock discount lookup -- a real integration
// swaps this for an actual Shopify/discount-service call behind the same
// onApplyDiscount contract.
function fakeDiscountLookup(code: string): Promise<number | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_VALID_DISCOUNT_CODES[code.toUpperCase()] ?? null);
    }, 700);
  });
}

export function CheckoutPageClient() {
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [billing, setBilling] = useState<BillingAddress>({
    country: "United States",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
  });

  const [discountState, setDiscountState] = useState<DiscountState>("idle");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailError =
    email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Enter a valid email address."
      : undefined;

  async function handleApplyDiscount(code: string) {
    setDiscountState("checking");
    try {
      const amount = await fakeDiscountLookup(code);
      if (amount == null) {
        setDiscountState("invalid");
        return;
      }
      setAppliedDiscount({ code: code.toUpperCase(), amount });
      setDiscountState("applied");
    } catch {
      setDiscountState("error");
    }
  }

  function handleRemoveDiscount() {
    setAppliedDiscount(null);
    setDiscountState("idle");
  }

  const subtotal = computeSubtotal(MOCK_CHECKOUT_ITEMS);
  const total = computeTotal(subtotal, appliedDiscount);
  const canSubmit = email.length > 0 && !emailError && !isSubmitting;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    // Real payment happens through Shopify's own checkout (see
    // PaymentSection) -- this just simulates the transition to keep the
    // prototype demoable end-to-end.
    setTimeout(() => setIsSubmitting(false), 1200);
  }

  return (
    <CheckoutLayout
      left={
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <ContactSection
            email={email}
            onEmailChange={setEmail}
            emailError={emailError}
            marketingOptIn={marketingOptIn}
            onMarketingOptInChange={setMarketingOptIn}
          />
          <PaymentSection />
          <BillingSection value={billing} onChange={setBilling} />

          <motion.div whileTap={{ scale: 0.99 }}>
            <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
              {isSubmitting ? "Processing…" : `Pay ${formatMoney(total, CURRENCY)}`}
            </Button>
          </motion.div>
        </form>
      }
      right={
        <OrderSummary
          items={MOCK_CHECKOUT_ITEMS}
          currency={CURRENCY}
          discountState={discountState}
          appliedDiscount={appliedDiscount}
          onApplyDiscount={handleApplyDiscount}
          onRemoveDiscount={handleRemoveDiscount}
        />
      }
    />
  );
}
