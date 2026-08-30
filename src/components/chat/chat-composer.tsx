"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ChatComposer({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="flex items-end gap-2 border-t border-border-muted p-3">
      <button
        type="button"
        disabled
        aria-label="Attach a file (coming soon)"
        title="Attachments coming soon"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-subtle-foreground disabled:cursor-not-allowed"
      >
        <Paperclip className="h-4 w-4" />
      </button>
      <textarea
        rows={1}
        value={value}
        disabled={disabled}
        placeholder="Message the delivery assistant…"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      />
      <Button
        type="button"
        size="icon"
        className="rounded-full"
        disabled={disabled || !value.trim()}
        onClick={submit}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
