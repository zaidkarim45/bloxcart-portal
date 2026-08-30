"use client";

import { motion } from "framer-motion";
import { Settings2, ShieldCheck } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import type { RobloxAccount } from "@/lib/types/order";

export function RobloxAccountCard({
  account,
  onChangeAccount,
  locked,
}: {
  account: RobloxAccount;
  onChangeAccount: () => void;
  locked: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-4 rounded-xl border border-primary/40 bg-card-secondary p-4 shadow-[0_0_0_3px_var(--primary-glow)]"
    >
      <Avatar src={account.avatarUrl} name={account.displayName} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-semibold text-foreground">{account.displayName}</p>
          {account.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">@{account.username}</p>
        <p className="mt-1 text-xs text-subtle-foreground">Your items will be delivered to this account.</p>
      </div>
      {!locked ? (
        <button
          type="button"
          onClick={onChangeAccount}
          aria-label="Change linked Roblox account"
          className="shrink-0 rounded-lg border border-border-muted p-2 text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      ) : null}
    </motion.div>
  );
}
