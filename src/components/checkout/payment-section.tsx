"use client";

import { Lock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Visual prototype only -- this does NOT collect or transmit real card
 * data. Shopify does not allow a custom-coded page to take card numbers
 * directly (PCI-DSS); the production integration point for real payment is
 * either (a) redirecting to Shopify's own hosted checkout for the cart, or
 * (b) reskinning that real checkout via Shopify's Checkout Branding /
 * Checkout UI Extensions APIs. This component exists to validate the
 * layout/visual design against the reference and will be replaced by one
 * of those two integrations before this ever goes live.
 */
export function PaymentSection() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Payment</h2>
        <p className="text-sm text-muted-foreground">All transactions are secure and encrypted.</p>
      </div>

      <div className="rounded-xl border border-primary bg-card p-4 shadow-[0_0_0_3px_var(--primary-glow)]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Credit card</span>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {["VISA", "MC", "AMEX"].map((brand) => (
              <span
                key={brand}
                className="rounded-md border border-border-muted bg-elevated px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground"
              >
                {brand}
              </span>
            ))}
            <span className="rounded-md border border-border-muted bg-elevated px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              +3
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="relative">
            <Label htmlFor="card-number" className="sr-only">
              Card number
            </Label>
            <Input id="card-number" placeholder="Card number" disabled className="pr-10" />
            <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="card-expiry" className="sr-only">
                Expiration date
              </Label>
              <Input id="card-expiry" placeholder="Expiration date (MM / YY)" disabled />
            </div>
            <div>
              <Label htmlFor="card-cvc" className="sr-only">
                Security code
              </Label>
              <Input id="card-cvc" placeholder="Security code" disabled />
            </div>
          </div>

          <div>
            <Label htmlFor="card-name" className="sr-only">
              Name on card
            </Label>
            <Input id="card-name" placeholder="Name on card" disabled />
          </div>
        </div>
      </div>
    </section>
  );
}
