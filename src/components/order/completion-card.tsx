"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/order/confetti-burst";
import { StarRating } from "@/components/order/star-rating";
import { brand } from "@/lib/brand";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types/order";

export function CompletionCard({ order }: { order: Order }) {
  const [rated, setRated] = useState<number | null>(null);
  const completedAt = order.deliveredAt ? new Date(order.deliveredAt) : new Date();

  return (
    <div className="relative overflow-hidden rounded-xl border border-success/30 bg-card p-6 text-center sm:p-8">
      <ConfettiBurst />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success"
      >
        <CheckCircle2 className="h-9 w-9" />
      </motion.div>

      <h2 className="mt-4 text-2xl font-bold text-foreground">Delivery Complete!</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your order has been successfully fulfilled.
      </p>

      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3 rounded-lg border border-border-muted bg-card-secondary p-4 text-left">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Order</span>
          <span className="font-medium text-foreground">#{order.publicOrderNumber}</span>
        </div>
        {order.robloxAccount ? (
          <div className="flex items-center gap-3">
            <Avatar src={order.robloxAccount.avatarUrl} name={order.robloxAccount.displayName} size="sm" />
            <div>
              <p className="text-sm font-medium text-foreground">{order.robloxAccount.displayName}</p>
              <p className="text-xs text-muted-foreground">@{order.robloxAccount.username}</p>
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-1 border-t border-border pt-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-foreground">{item.name}</span>
              <span className="text-muted-foreground">{formatMoney(item.price, order.currency)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-subtle-foreground">
          Completed {completedAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-foreground">How was your experience?</p>
        <StarRating onRate={setRated} />
        {rated ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-success"
          >
            Thanks for the feedback!
          </motion.p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary">Leave Feedback</Button>
        <Button variant="ghost" asChild>
          <a href={brand.supportUrl}>Need help? Contact Support</a>
        </Button>
      </div>
    </div>
  );
}
