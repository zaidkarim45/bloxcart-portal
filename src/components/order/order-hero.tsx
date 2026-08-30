"use client";

import { motion } from "framer-motion";
import { Heart, Link2 } from "lucide-react";

import { RobloxAccountCard } from "@/components/order/roblox-account-card";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types/order";

const ACCOUNT_LOCKED_STATUSES: Order["status"][] = [
  "agent_assigned",
  "delivery_preparing",
  "customer_joining",
  "delivery_in_progress",
  "delivered",
];

export function OrderHero({
  order,
  onLinkAccount,
  onChangeAccount,
  onCustomerReady,
}: {
  order: Order;
  onLinkAccount: () => void;
  onChangeAccount: () => void;
  onCustomerReady: () => void;
}) {
  if (!order.robloxAccount) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Link2 className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-lg font-semibold text-foreground">Link Your Roblox Account</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Connect the Roblox account you want this order delivered to.
        </p>
        <Button className="mt-4" onClick={onLinkAccount}>
          Link Roblox Account
        </Button>
      </motion.div>
    );
  }

  const locked = ACCOUNT_LOCKED_STATUSES.includes(order.status);
  const showReadyCta = order.status === "awaiting_customer";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-success">
        <Heart className="h-4 w-4 fill-current" />
        <h2 className="text-base font-semibold">
          {showReadyCta ? "Ready to Claim Your Items!" : "Your order is being handled"}
        </h2>
      </div>
      <RobloxAccountCard account={order.robloxAccount} onChangeAccount={onChangeAccount} locked={locked} />
      {showReadyCta ? (
        <Button className="w-full sm:w-auto" onClick={onCustomerReady}>
          I&apos;m Ready
        </Button>
      ) : null}
    </div>
  );
}
