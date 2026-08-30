import { Info, Link2 } from "lucide-react";

import { OrderHeader } from "@/components/order/order-header";
import { OrderItems } from "@/components/order/order-items";
import { OrderMetadata } from "@/components/order/order-metadata";
import { OrderProgress } from "@/components/order/order-progress";
import { OrderTimeline } from "@/components/order/order-timeline";
import { RobloxAccountCard } from "@/components/order/roblox-account-card";
import { buildOrderTimeline } from "@/lib/delivery/timeline";
import { getStatusCopy } from "@/lib/delivery/status-copy";
import type { Order } from "@/lib/types/order";

/**
 * Read-only view of a REAL order pulled from Supabase (Phase E/F) --
 * distinct from `/order/demo`'s fully-interactive client-side mock. The
 * account-linking flow, chat, and staff-driven status changes aren't
 * wired to persistence yet (that's Phase G/H); this proves data really
 * round-trips through the database before building interactivity on top
 * of it.
 */
export function RealOrderView({ order }: { order: Order }) {
  const timeline = buildOrderTimeline(order);
  const fulfilledCount = order.items.filter((item) => item.fulfilled).length;
  const statusCopy = getStatusCopy(order.status);

  return (
    <div className="min-h-screen bg-background pb-16">
      <OrderHeader />
      <OrderMetadata order={order} connection="connected" />

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_340px] lg:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              This is real data from the database (order {order.publicOrderNumber}), rendered
              read-only. Linking accounts, chat, and live status changes aren&apos;t connected yet.
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h1 className="text-lg font-semibold text-foreground">{statusCopy.label}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{statusCopy.description}</p>
          </div>

          {order.robloxAccount ? (
            <RobloxAccountCard account={order.robloxAccount} onChangeAccount={() => {}} locked />
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <Link2 className="h-4 w-4 shrink-0 text-primary" />
              No Roblox account linked to this order yet.
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5 lg:h-fit lg:sticky lg:top-6">
          <OrderProgress completed={fulfilledCount} total={order.items.length} />
          <OrderTimeline stages={timeline} />
          <OrderItems items={order.items} currency={order.currency} />
        </aside>
      </main>
    </div>
  );
}
