import type { Metadata } from "next";

import { OrderPageClient } from "@/components/order/order-page-client";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

export default function OrderDemoPage() {
  return <OrderPageClient />;
}
