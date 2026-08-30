import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1">
      <span className="px-1 text-xs font-medium text-muted-foreground">Delivery Assistant is typing…</span>
      <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm border border-border-muted bg-card-secondary px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-subtle-foreground"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
