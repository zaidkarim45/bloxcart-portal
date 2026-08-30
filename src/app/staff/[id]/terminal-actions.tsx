"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cancelOrderAction, fulfillOrderAction, refundOrderAction } from "@/lib/staff/actions";
import type { StaffOrderDetail } from "@/lib/staff/get-orders";
import type { OrderStatus } from "@/lib/types/order";

type PendingAction = "fulfill" | "cancel" | "refund";

const TERMINAL_COPY: Partial<
  Record<OrderStatus, { label: string; className: string; icon: typeof CheckCircle2 }>
> = {
  delivered: {
    label: "Delivered & Fulfilled",
    className: "border-success/30 bg-success/15 text-success",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-danger/30 bg-danger/15 text-danger",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    className: "border-warning/30 bg-warning/15 text-warning",
    icon: RotateCcw,
  },
};

const CONFIRM_COPY: Record<
  PendingAction,
  { title: string; description: string; confirmLabel: string; variant: "success" | "danger" | "warning" }
> = {
  fulfill: {
    title: "Mark this order Fulfilled?",
    description:
      "This tells Shopify the order has been delivered and notifies the customer. Only do this after the items are actually in their inventory.",
    confirmLabel: "Yes, mark Fulfilled",
    variant: "success",
  },
  cancel: {
    title: "Cancel this order?",
    description:
      "This voids the order on Shopify with no refund issued. Use this for mistaken or duplicate orders, not ones you're refunding.",
    confirmLabel: "Yes, cancel order",
    variant: "danger",
  },
  refund: {
    title: "Refund this order?",
    description:
      "This cancels the order on Shopify and issues a full refund back to the customer's original payment method. This cannot be undone.",
    confirmLabel: "Yes, refund in full",
    variant: "warning",
  },
};

export function TerminalActions({ order }: { order: StaffOrderDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<PendingAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const terminal = TERMINAL_COPY[order.status];
  if (terminal) {
    const Icon = terminal.icon;
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${terminal.className}`}
      >
        <Icon className="h-4 w-4" />
        {terminal.label}
      </motion.div>
    );
  }

  function run(action: PendingAction) {
    setError(null);
    startTransition(async () => {
      const params = {
        orderId: order.id,
        shopifyOrderId: order.shopifyOrderId,
        publicOrderNumber: order.publicOrderNumber,
      };
      const fn =
        action === "fulfill" ? fulfillOrderAction : action === "cancel" ? cancelOrderAction : refundOrderAction;
      const result = await fn(params);
      setConfirming(null);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.05 }}
        className="flex flex-wrap gap-2"
      >
        <Button variant="success" onClick={() => setConfirming("fulfill")} disabled={isPending}>
          <CheckCircle2 className="h-4 w-4" />
          Fulfilled
        </Button>
        <Button variant="warning" onClick={() => setConfirming("refund")} disabled={isPending}>
          <RotateCcw className="h-4 w-4" />
          Refund
        </Button>
        <Button variant="danger" onClick={() => setConfirming("cancel")} disabled={isPending}>
          <XCircle className="h-4 w-4" />
          Cancel
        </Button>
      </motion.div>

      {error ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-danger">
          {error}
        </motion.p>
      ) : null}

      <Dialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent>
          {confirming ? (
            <>
              <DialogHeader>
                <DialogTitle>{CONFIRM_COPY[confirming].title}</DialogTitle>
                <DialogDescription>{CONFIRM_COPY[confirming].description}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Button
                  variant={CONFIRM_COPY[confirming].variant}
                  onClick={() => run(confirming)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Working…
                    </>
                  ) : (
                    CONFIRM_COPY[confirming].confirmLabel
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(null)} disabled={isPending}>
                  Never mind
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
