import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { ChatMessageData } from "@/lib/types/order";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  if (message.sender === "system") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="my-2 flex justify-center"
      >
        <span className="rounded-full bg-elevated px-3 py-1 text-xs text-subtle-foreground">
          {message.text}
        </span>
      </motion.div>
    );
  }

  const isCustomer = message.sender === "customer";
  const senderLabel =
    message.sender === "agent" ? message.agentName ?? "Agent" : message.sender === "assistant" ? "Delivery Assistant" : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn("flex flex-col gap-1", isCustomer ? "items-end" : "items-start")}
    >
      {senderLabel ? (
        <span className="px-1 text-xs font-medium text-muted-foreground">{senderLabel}</span>
      ) : null}
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%]",
          isCustomer
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border border-border-muted bg-card-secondary text-foreground"
        )}
      >
        {message.text}
      </div>
      <span className="px-1 text-[11px] text-subtle-foreground">{formatTime(message.createdAt)}</span>
    </motion.div>
  );
}
