import type { Metadata } from "next";

import { RealOrderView } from "@/components/order/real-order-view";
import { getOrderByToken } from "@/lib/orders/get-order";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

export default async function OrderTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getOrderByToken(token);

  if (!result.ok) {
    // Deliberately visible while nothing here is customer-facing yet --
    // see the comment on GetOrderResult in lib/orders/get-order.ts.
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border border-danger/30 bg-card p-6 text-center">
          <p className="text-sm font-semibold text-danger">Order lookup failed ({result.reason})</p>
          <p className="mt-2 text-sm text-muted-foreground">{result.detail}</p>
        </div>
      </div>
    );
  }

  return <RealOrderView order={result.order} />;
}
