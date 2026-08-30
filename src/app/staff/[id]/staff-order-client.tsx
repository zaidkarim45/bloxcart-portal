"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ChatWindow } from "@/components/chat/chat-window";
import { sendStaffMessageAction, updateOrderStatusAction } from "@/lib/staff/actions";
import type { StaffOrderDetail } from "@/lib/staff/get-orders";
import type { ChatMessageData, OrderStatus } from "@/lib/types/order";

const ALL_STATUSES: OrderStatus[] = [
  "payment_pending",
  "payment_confirmed",
  "awaiting_account",
  "account_linked",
  "awaiting_customer",
  "customer_ready",
  "queued",
  "agent_assigned",
  "delivery_preparing",
  "customer_joining",
  "delivery_in_progress",
  "delivered",
  "delivery_failed",
  "manual_review",
  "cancelled",
  "refunded",
];

export function StaffOrderClient({
  order,
  initialMessages,
}: {
  order: StaffOrderDetail;
  initialMessages: ChatMessageData[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSend(text: string) {
    startTransition(async () => {
      const result = await sendStaffMessageAction(order.id, text);
      if (!result.ok) setError(result.error ?? "Message failed to send.");
      router.refresh();
    });
  }

  function handleStatusChange(status: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      if (!result.ok) setError(result.error ?? "Couldn't update status.");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Link href="/staff" className="text-sm text-muted-foreground hover:text-foreground">
          ← All orders
        </Link>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Order #{order.publicOrderNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">{order.customerEmail ?? "no email on file"}</p>
          {order.robloxAccount ? (
            <p className="mt-1 text-xs text-muted-foreground">Roblox: @{order.robloxAccount.username}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Roblox account not linked yet.</p>
          )}

          <label className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
            Status
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        </div>

        <div className="h-[32rem]">
          <ChatWindow messages={initialMessages} isAssistantTyping={false} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
