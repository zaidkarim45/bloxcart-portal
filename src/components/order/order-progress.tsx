"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "framer-motion";

export function OrderProgress({ completed, total }: { completed: number; total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <h2 className="font-semibold text-foreground">Order Status</h2>
        <span className="text-xs text-muted-foreground">
          {completed}/{total} items
        </span>
      </div>
      <ProgressPrimitive.Root className="relative h-1.5 w-full overflow-hidden rounded-full bg-elevated">
        <ProgressPrimitive.Indicator asChild>
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
    </div>
  );
}
