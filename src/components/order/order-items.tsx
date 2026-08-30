import { Package } from "lucide-react";

import { formatMoney } from "@/lib/format";
import type { OrderLineItem } from "@/lib/types/order";
import { cn } from "@/lib/utils";

export function OrderItems({ items, currency }: { items: OrderLineItem[]; currency: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">Order Items</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-border-muted bg-card-secondary p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-elevated">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote product images, dimensions vary
                <img src={item.imageUrl} alt="" className="h-full w-full rounded-lg object-cover" />
              ) : (
                <Package className="h-4 w-4 text-subtle-foreground" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{formatMoney(item.price, currency)}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                item.fulfilled
                  ? "bg-success/15 text-success"
                  : "bg-warning/15 text-warning"
              )}
            >
              {item.fulfilled ? "Fulfilled" : "Unfulfilled"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
