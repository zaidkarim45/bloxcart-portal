"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Tag, X, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import type { AppliedDiscount, DiscountState } from "@/lib/types/checkout";

export interface DiscountInputProps {
  state: DiscountState;
  applied: AppliedDiscount | null;
  currency: string;
  onApply: (code: string) => void;
  onRemove: () => void;
}

export function DiscountInput({ state, applied, currency, onApply, onRemove }: DiscountInputProps) {
  const [code, setCode] = useState("");
  const isChecking = state === "checking";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || isChecking) return;
    onApply(trimmed);
  }

  return (
    <div className="flex flex-col gap-2">
      {!applied ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <motion.div
            key={state}
            className="flex-1"
            animate={state === "invalid" ? { x: [0, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.32, ease: "easeInOut" }}
          >
            <Input
              placeholder="Discount code or gift card"
              value={code}
              disabled={isChecking}
              invalid={state === "invalid"}
              onChange={(e) => setCode(e.target.value)}
            />
          </motion.div>
          <Button type="submit" variant="secondary" disabled={isChecking || !code.trim()}>
            {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        </form>
      ) : null}

      <AnimatePresence mode="wait">
        {applied ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm"
          >
            <Tag className="h-3.5 w-3.5 text-success" />
            <span className="font-semibold text-foreground">{applied.code}</span>
            <span className="text-muted-foreground">
              &minus;{formatMoney(applied.amount, currency)} applied
            </span>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove discount code"
              className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : state === "invalid" ? (
          <motion.p
            key="invalid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs font-medium text-danger"
          >
            <XCircle className="h-3.5 w-3.5" />
            That code isn&apos;t valid or has expired.
          </motion.p>
        ) : state === "error" ? (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs font-medium text-danger"
          >
            <XCircle className="h-3.5 w-3.5" />
            Something went wrong. Please try again.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
