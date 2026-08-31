"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ChatWindow } from "@/components/chat/chat-window";
import { CompletionCard } from "@/components/order/completion-card";
import { LinkRobloxModal } from "@/components/order/link-roblox-modal";
import { OrderHeader } from "@/components/order/order-header";
import { OrderHero } from "@/components/order/order-hero";
import { OrderItems } from "@/components/order/order-items";
import { OrderMetadata } from "@/components/order/order-metadata";
import { OrderProgress } from "@/components/order/order-progress";
import { OrderTimeline } from "@/components/order/order-timeline";
import { buildOrderTimeline } from "@/lib/delivery/timeline";
import {
  linkRobloxAccountAction,
  markCustomerReadyAction,
  sendCustomerMessageAction,
} from "@/lib/orders/actions";
import type { ChatMessageData, Order } from "@/lib/types/order";
import type { RobloxProfile } from "@/lib/roblox/types";
import { useLiveMessages } from "@/hooks/use-live-messages";

/**
 * The real, persisted counterpart to `/order/demo`'s client-side mock --
 * every action here calls a server action that writes to Supabase, then
 * `router.refresh()` re-fetches the Server Component tree so what's on
 * screen always reflects the database, never optimistic local state that
 * could drift from it.
 *
 * Chat is the one exception to "refresh to see changes": it polls
 * /api/order/[token]/messages every few seconds via useLiveMessages, so a
 * staff reply shows up on its own instead of needing a manual refresh.
 * Sending still shows an optimistic bubble immediately (addPending),
 * cleared the moment the next poll confirms the real row landed.
 */
export function RealOrderPageClient({
  initialOrder,
  initialMessages,
  token,
}: {
  initialOrder: Order;
  initialMessages: ChatMessageData[];
  token: string;
}) {
  const router = useRouter();
  const order = initialOrder;
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { messages, addPending } = useLiveMessages(initialMessages, `/api/order/${token}/messages`);

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

  function handleSendMessage(text: string) {
    addPending({
      id: `pending-${Date.now()}`,
      sender: "customer",
      text,
      createdAt: new Date().toISOString(),
    });
    startTransition(async () => {
      const result = await sendCustomerMessageAction(token, text);
      if (!result.ok) {
        setActionError(result.error ?? "Your message didn't send. Please try again.");
      }
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
              <div className="h-[28rem]">
                <ChatWindow
                  messages={messages}
                  isAssistantTyping={false}
                  onSend={handleSendMessage}
                  composerDisabled={!order.robloxAccount}
                />
              </div>
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
