"use client";

import { motion } from "framer-motion";
import { Gamepad2, Gem, Package, Shield, Sparkles, Swords } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface DecorationIcon {
  Icon: LucideIcon;
  className: string;
  delay: number;
  duration: number;
}

// Placeholder glyphs standing in for item art -- deliberately generic
// (lucide icons, not game assets) so nothing here resembles any specific
// game's branding or artwork.
const ICONS: DecorationIcon[] = [
  { Icon: Gamepad2, className: "left-[4%] top-2", delay: 0, duration: 7 },
  { Icon: Sparkles, className: "left-[14%] top-8", delay: 0.6, duration: 6 },
  { Icon: Gem, className: "left-[24%] top-1", delay: 1.1, duration: 8 },
  { Icon: Swords, className: "right-[24%] top-1", delay: 0.3, duration: 7.5 },
  { Icon: Package, className: "right-[13%] top-7", delay: 0.9, duration: 6.5 },
  { Icon: Shield, className: "right-[4%] top-2", delay: 1.4, duration: 8.5 },
];

/**
 * Slow-floating decorative icons above the checkout header. Never
 * interactive, never distracting -- reduced-motion users get the static
 * layout with no animation (see globals.css's prefers-reduced-motion rule,
 * which also disables the transforms below via animation-duration: 0.01ms).
 */
export function CheckoutDecoration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mx-auto hidden h-16 max-w-3xl sm:block"
    >
      {ICONS.map(({ Icon, className, delay, duration }, i) => (
        <motion.div
          key={i}
          className={cn("absolute flex h-10 w-10 items-center justify-center rounded-xl border border-border-muted bg-card-secondary/60 text-muted-foreground shadow-sm", className)}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: [0, -6, 0], rotate: [0, 3, 0, -3, 0] }}
          transition={{
            opacity: { duration: 0.5, delay },
            y: { duration, repeat: Infinity, ease: "easeInOut", delay },
            rotate: { duration: duration * 1.4, repeat: Infinity, ease: "easeInOut", delay },
          }}
          whileHover={{ scale: 1.08 }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </motion.div>
      ))}
    </div>
  );
}
