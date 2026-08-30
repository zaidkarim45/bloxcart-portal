"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { brand } from "@/lib/brand";

const POLL_INTERVAL_MS = 1200;
const TIMEOUT_MS = 20_000;

/**
 * Lands here straight from Shopify's Order Status page (see the
 * "Additional scripts" snippet in docs/ARCHITECTURE.md) with the Shopify
 * order id and email in the URL. The real order row is created by a
 * webhook that may take a second or two to land, so this polls rather
 * than doing one lookup and giving up -- see spec: "the portal will
 * briefly say Setting up your order... for a beat, that's normal."
 */
export function RedirectingClient() {
  const searchParams = useSearchParams();
  const shopifyOrderId = searchParams.get("shopify_order_id");
  const email = searchParams.get("email");
  const missingParams = !shopifyOrderId || !email;

  const [timedOut, setTimedOut] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (missingParams) return;

    startedAtRef.current = Date.now();
    let cancelled = false;

    async function poll() {
      if (cancelled) return;

      try {
        const res = await fetch(
          `/api/orders/lookup?shopify_order_id=${encodeURIComponent(shopifyOrderId!)}&email=${encodeURIComponent(email!)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.found && data.token) {
          window.location.replace(`/order/${data.token}`);
          return;
        }
      } catch {
        // Swallow and retry -- a single failed poll shouldn't end the flow.
      }

      if (cancelled) return;
      if (Date.now() - (startedAtRef.current ?? Date.now()) > TIMEOUT_MS) {
        setTimedOut(true);
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [missingParams, shopifyOrderId, email]);

  if (missingParams || timedOut) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <p className="text-base font-semibold text-foreground">
          Your order is still being set up.
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This is taking longer than expected, but your payment went through and your order is
          safe. Check your confirmation email for an order number, or contact support at{" "}
          <a href={`mailto:${brand.supportEmail}`} className="text-primary underline">
            {brand.supportEmail}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-base font-semibold text-foreground">Setting up your order…</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Your payment went through — we&apos;re just getting your delivery page ready.
      </p>
    </div>
  );
}
