import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getOrderMessages } from "@/lib/orders/get-messages";
import { getStaffOrder } from "@/lib/staff/get-orders";
import { StaffOrderClient } from "./staff-order-client";

export const metadata: Metadata = {
  title: "Staff — Order",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StaffOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getStaffOrder(id);
  if (!order) notFound();

  const messages = await getOrderMessages(order.id);

  return <StaffOrderClient order={order} initialMessages={messages} />;
}
