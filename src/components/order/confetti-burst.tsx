"use client";

import { motion } from "framer-motion";

const COLORS = ["#8b5cf6", "#22c55e", "#f59e0b", "#a78bfa", "#f4f6fb"];
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  return {
    id: i,
    x: Math.cos(angle) * (60 + (i % 3) * 20),
    y: Math.sin(angle) * (60 + (i % 3) * 20),
    color: COLORS[i % COLORS.length],
    delay: (i % 5) * 0.02,
  };
});

/** A single tasteful burst, not a persistent effect -- fires once on mount. */
export function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.8, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
