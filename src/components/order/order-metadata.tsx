import { Calendar, Hash } from "lucide-react";

import { ConnectionBadge, type ConnectionState } from "@/components/order/connection-badge";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types/order";

export function OrderMetadata({
  order,
  connection,
}: {
  order: Order;
  connection: ConnectionState;
}) {
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border-muted px-4 py-3 text-sm text-muted-foreground sm:px-6">
      <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
        <Hash className="h-3.5 w-3.5" />
        {order.publicOrderNumber}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" />
        {date}
      </span>
      <span className="font-medium text-foreground">{formatMoney(order.total, order.currency)}</span>
      <ConnectionBadge state={connection} />
      {order.robloxAccount ? (
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border-muted bg-card-secondary px-2.5 py-1 text-xs">
          Account Linked
          <span className="font-semibold text-primary">{order.robloxAccount.username}</span>
        </span>
      ) : null}
    </div>
  );
}
