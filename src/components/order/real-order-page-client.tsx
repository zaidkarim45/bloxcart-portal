"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { CompletionCard } from "@/components/order/completion-card";
import { LinkRobloxModal } from "@/components/order/link-roblox-modal";
import { OrderHeader } from "@/components/order/order-header";
import { OrderHero } from "@/components/order/order-hero";
import { OrderItems } from "@/components/order/order-items";
import { OrderMetadata } from "@/components/order/order-metadata";
import { OrderProgress } from "@/components/order/order-progress";
import { OrderTimeline } from "@/components/order/order-timeline";
import { buildOrderTimeline } from "@/lib/delivery/timeline";
import { linkRobloxAccountAction, markCustomerReadyAction } from "@/lib/orders/actions";
import type { Order } from "@/lib/types/order";
import type { RobloxProfile } from "@/lib/roblox/types";

/**
 * The real, persisted counterpart to `/order/demo`'s client-side mock --
 * every action here calls a server action that writes to Supabase, then
 * `router.refresh()` re-fetches the Server Component tree so what's on
 * screen always reflects the database, never optimistic local state that
 * could drift from it.
 */
export function RealOrderPageClient({ initialOrder, token }: { initialOrder: Order; token: string }) {
  const router = useRouter();
  // Deliberately not local state -- this prop changes when router.refresh()
  // re-runs the Server Component parent after a server action, and this
  // component should always reflect that fresh value rather than freezing
  // whatever it first mounted with.
  const order = initialOrder;
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const timeline = buildOrderTimeline(order);
  const fulfilledCount = order.items.filter((item) => item.fulfilled).length;
  const isDelivered = order.status === "delivered";

  function handleLinkAccount(profile: RobloxProfile) {
    setActionError(null);
    startTransition(async () => {
      const result = await linkRobloxAccountAction(token, profile);
      if (!result.ok) {
        setActionError(result.error ?? "Something went wrong linking that account.");
        return;
      }
      router.refresh();
    });
  }

  function handleCustomerReady() {
    setActionError(null);
    startTransition(async () => {
      const result = await markCustomerReadyAction(token);
      if (!result.ok) {
        setActionError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <OrderHeader />
      <OrderMetadata order={order} connection="connected" />

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_340px] lg:px-6">
        <div className="flex flex-col gap-6">
          {isDelivered ? (
            <CompletionCard order={order} />
          ) : (
            <>
              {isPending ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </div>
              ) : null}
              {actionError ? (
                <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                  {actionError}
                </p>
              ) : null}
              <OrderHero
                order={order}
                onLinkAccount={() => setIsLinkModalOpen(true)}
                onChangeAccount={() => setIsLinkModalOpen(true)}
                onCustomerReady={handleCustomerReady}
              />
              <p className="rounded-lg border border-border-muted bg-card px-4 py-3 text-xs text-muted-foreground">
                Live chat with the delivery assistant isn&apos;t connected yet -- linking your
                account and marking yourself ready both save for real, though.
              </p>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5 lg:h-fit lg:sticky lg:top-6">
          <OrderProgress completed={fulfilledCount} total={order.items.length} />
          <OrderTimeline stages={timeline} />
          <OrderItems items={order.items} currency={order.currency} />
        </aside>
      </main>

      <LinkRobloxModal
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        onConfirm={handleLinkAccount}
      />
    </div>
  );
}
