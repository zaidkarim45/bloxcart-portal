"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { ChatWindow } from "@/components/chat/chat-window";
import { sendStaffMessageAction, updateOrderStatusAction } from "@/lib/staff/actions";
import type { StaffOrderDetail } from "@/lib/staff/get-orders";
import type { ChatMessageData, OrderStatus } from "@/lib/types/order";
import { useLiveMessages } from "@/hooks/use-live-messages";
import { TerminalActions } from "./terminal-actions";

// Delivered/cancelled/refunded are excluded here on purpose -- those go
// through TerminalActions now, which calls Shopify first and only updates
// this status if Shopify confirms it. Setting them from this dropdown
// would desync our DB from what Shopify actually shows.
const WORKFLOW_STATUSES: OrderStatus[] = [
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
  "delivery_failed",
  "manual_review",
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
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { messages, addPending } = useLiveMessages(
    initialMessages,
    `/api/staff/orders/${order.id}/messages`
  );

  function handleSend(text: string) {
    addPending({
      id: `pending-${Date.now()}`,
      sender: "agent",
      agentName: "Staff",
      text,
      createdAt: new Date().toISOString(),
    });
    startTransition(async () => {
      const result = await sendStaffMessageAction(order.id, text);
      if (!result.ok) setError(result.error ?? "Message failed to send.");
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

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Order #{order.publicOrderNumber}</p>
              <p className="mt-1 text-xs text-muted-foreground">{order.customerEmail ?? "no email on file"}</p>
              {order.robloxAccount ? (
                <p className="mt-1 text-xs text-muted-foreground">Roblox: @{order.robloxAccount.username}</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Roblox account not linked yet.</p>
              )}
            </div>
            <span className="shrink-0 rounded-full bg-elevated px-3 py-1 text-xs font-medium text-foreground">
              {order.status}
            </span>
          </div>

          <div className="mt-4">
            <TerminalActions order={order} />
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <motion.span animate={{ rotate: advancedOpen ? 180 : 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
            Advanced: set workflow step manually
          </button>

          <AnimatePresence initial={false}>
            {advancedOpen ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <label className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                  Workflow step
                  <select
                    value={WORKFLOW_STATUSES.includes(order.status) ? order.status : ""}
                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    {!WORKFLOW_STATUSES.includes(order.status) ? (
                      <option value="" disabled>
                        {order.status}
                      </option>
                    ) : null}
                    {WORKFLOW_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {error ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-danger">
              {error}
            </motion.p>
          ) : null}
        </motion.div>

        <div className="h-[32rem]">
          <ChatWindow messages={messages} isAssistantTyping={false} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
