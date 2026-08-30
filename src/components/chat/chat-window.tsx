"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessage } from "@/components/chat/chat-message";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import type { ChatMessageData } from "@/lib/types/order";

export function ChatWindow({
  messages,
  isAssistantTyping,
  onSend,
  composerDisabled,
}: {
  messages: ChatMessageData[];
  isAssistantTyping: boolean;
  onSend: (text: string) => void;
  composerDisabled?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isAssistantTyping]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </AnimatePresence>
          {isAssistantTyping ? <TypingIndicator /> : null}
        </div>
      </div>
      <ChatComposer onSend={onSend} disabled={composerDisabled} />
    </div>
  );
}
