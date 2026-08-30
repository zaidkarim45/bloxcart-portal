import { Package } from "lucide-react";

import { formatMoney } from "@/lib/format";
import type { CheckoutLineItem } from "@/lib/types/checkout";

export function ProductSummaryItem({
  item,
  currency,
}: {
  item: CheckoutLineItem;
  currency: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-muted bg-elevated">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote product images, dimensions vary by source
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Package className="h-6 w-6 text-subtle-foreground" strokeWidth={1.5} />
        )}
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-card-secondary px-1 text-[11px] font-semibold text-foreground shadow ring-1 ring-border">
          {item.quantity}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
      </div>
      <p className="shrink-0 text-sm font-medium text-foreground">
        {formatMoney(item.unitPrice * item.quantity, currency)}
      </p>
    </div>
  );
}
