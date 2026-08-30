"use client";

import { CompletionCard } from "@/components/order/completion-card";
import { DemoControls } from "@/components/order/demo-controls";
import { LinkRobloxModal } from "@/components/order/link-roblox-modal";
import { OrderHeader } from "@/components/order/order-header";
import { OrderHero } from "@/components/order/order-hero";
import { OrderItems } from "@/components/order/order-items";
import { OrderMetadata } from "@/components/order/order-metadata";
import { OrderProgress } from "@/components/order/order-progress";
import { OrderTimeline } from "@/components/order/order-timeline";
import { ChatWindow } from "@/components/chat/chat-window";
import { buildOrderTimeline } from "@/lib/delivery/timeline";
import { isDemoMode } from "@/lib/config";
import { useDemoOrder } from "@/hooks/use-demo-order";

export function OrderPageClient() {
  const {
    order,
    messages,
    isAssistantTyping,
    isLinkModalOpen,
    connection,
    setIsLinkModalOpen,
    linkAccount,
    markCustomerReady,
    sendCustomerMessage,
    simulateAgentAssigned,
    simulateDeliveryStarted,
    simulateDeliveryComplete,
    simulateReconnect,
  } = useDemoOrder();

  const timeline = buildOrderTimeline(order);
  const fulfilledCount = order.items.filter((item) => item.fulfilled).length;
  const isDelivered = order.status === "delivered";

  return (
    <div className="min-h-screen bg-background pb-24">
      <OrderHeader />
      <OrderMetadata order={order} connection={connection} />

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_340px] lg:px-6">
        <div className="flex flex-col gap-6">
          {isDelivered ? (
            <CompletionCard order={order} />
          ) : (
            <>
              <OrderHero
                order={order}
                onLinkAccount={() => setIsLinkModalOpen(true)}
                onChangeAccount={() => setIsLinkModalOpen(true)}
                onCustomerReady={markCustomerReady}
              />
              <div className="h-[28rem]">
                <ChatWindow
                  messages={messages}
                  isAssistantTyping={isAssistantTyping}
                  onSend={sendCustomerMessage}
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
        onConfirm={linkAccount}
      />

      {isDemoMode() ? (
        <DemoControls
          status={order.status}
          onAssignAgent={simulateAgentAssigned}
          onStartDelivery={simulateDeliveryStarted}
          onCompleteDelivery={simulateDeliveryComplete}
          onSimulateReconnect={simulateReconnect}
        />
      ) : null}
    </div>
  );
}
