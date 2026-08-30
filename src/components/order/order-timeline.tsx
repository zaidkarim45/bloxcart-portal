import { Calendar, CheckCircle2, CreditCard, Link2, PackageCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { TimelineStage } from "@/lib/delivery/timeline";
import { cn } from "@/lib/utils";

const STAGE_ICONS: Record<string, LucideIcon> = {
  order_placed: Calendar,
  payment_received: CreditCard,
  account_linked: Link2,
  order_fulfillment: Truck,
  delivery_completed: PackageCheck,
};

export function OrderTimeline({ stages }: { stages: TimelineStage[] }) {
  return (
    <ol className="flex flex-col">
      {stages.map((stage, i) => {
        const Icon = STAGE_ICONS[stage.id] ?? CheckCircle2;
        const isLast = i === stages.length - 1;
        return (
          <li key={stage.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px",
                  stage.state === "upcoming" ? "bg-border" : "bg-primary/50"
                )}
              />
            ) : null}
            <span
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                stage.state === "completed" && "border-success bg-success/15 text-success",
                stage.state === "current" &&
                  "border-primary bg-primary/15 text-primary shadow-[0_0_0_4px_var(--primary-glow)]",
                stage.state === "upcoming" && "border-border bg-elevated text-subtle-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="pt-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  stage.state === "upcoming" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {stage.title}
              </p>
              <p className="text-xs text-muted-foreground">{stage.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
