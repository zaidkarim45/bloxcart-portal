"use client";

import { useState } from "react";
import { Wrench, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/lib/types/order";

export interface DemoControlsProps {
  status: OrderStatus;
  onAssignAgent: () => void;
  onStartDelivery: () => void;
  onCompleteDelivery: () => void;
  onSimulateReconnect: () => void;
}

/**
 * Staff/backend actions this app doesn't have yet, exposed here so the
 * customer-facing flow is demoable end to end. Gated by isDemoMode() at
 * the call site -- must never render in production.
 *
 * Starts collapsed to a small toggle: expanded by default it overlapped
 * the chat composer's send button on narrow viewports (this is dev-only
 * tooling, not part of the customer experience, so it shouldn't compete
 * with real UI for screen space).
 */
export function DemoControls({
  status,
  onAssignAgent,
  onStartDelivery,
  onCompleteDelivery,
  onSimulateReconnect,
}: DemoControlsProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open dev controls"
        className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-warning/50 bg-elevated/95 text-warning shadow-xl backdrop-blur"
      >
        <Wrench className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 flex max-w-xs flex-col gap-2 rounded-xl border border-dashed border-warning/50 bg-elevated/95 p-3 text-xs shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-warning">DEV — Simulate staff actions</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close dev controls"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          disabled={status !== "queued"}
          onClick={onAssignAgent}
        >
          Assign agent
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={status !== "agent_assigned"}
          onClick={onStartDelivery}
        >
          Start delivery
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={status !== "delivery_in_progress"}
          onClick={onCompleteDelivery}
        >
          Complete delivery
        </Button>
        <Button size="sm" variant="ghost" onClick={onSimulateReconnect}>
          Simulate reconnect
        </Button>
      </div>
    </div>
  );
}
