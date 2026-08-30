import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
  const order = await getOrderByToken(token);

  if (!order) {
    notFound();
  }

  return <RealOrderView order={order} />;
}
