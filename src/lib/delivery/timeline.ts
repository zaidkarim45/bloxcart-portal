import { formatMoney } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types/order";

export type TimelineStageState = "completed" | "current" | "upcoming";

export interface TimelineStage {
  id: string;
  title: string;
  description: string;
  state: TimelineStageState;
}

const FULFILLMENT_STATUSES: OrderStatus[] = [
  "queued",
  "agent_assigned",
  "delivery_preparing",
  "customer_joining",
  "delivery_in_progress",
];

/** Ordered furthest-along-first isn't needed -- comparisons below just check set membership. */
function isAtLeast(status: OrderStatus, reached: OrderStatus[]): boolean {
  return reached.includes(status);
}

export function buildOrderTimeline(order: Order): TimelineStage[] {
  const { status } = order;
  const paymentDone = status !== "payment_pending";
  const accountLinked = Boolean(order.robloxAccount);
  const fulfillmentStarted = isAtLeast(status, FULFILLMENT_STATUSES) || status === "delivered";
  const fulfillmentDone = status === "delivered";

  return [
    {
      id: "order_placed",
      title: "Order Placed",
      description: `Order ${order.publicOrderNumber} received`,
      state: "completed",
    },
    {
      id: "payment_received",
      title: "Payment Received",
      description: paymentDone
        ? `${formatMoney(order.total, order.currency)} received`
        : "Confirming payment",
      state: paymentDone ? "completed" : "current",
    },
    {
      id: "account_linked",
      title: "Account Linked",
      description: accountLinked
        ? `Delivering to ${order.robloxAccount?.username}`
        : "Waiting for Roblox account",
      state: accountLinked ? "completed" : paymentDone ? "current" : "upcoming",
    },
    {
      id: "order_fulfillment",
      title: "Order Fulfillment",
      description: fulfillmentDone
        ? "All items delivered"
        : fulfillmentStarted
          ? "In progress"
          : "Awaiting fulfillment",
      state: fulfillmentDone ? "completed" : fulfillmentStarted ? "current" : "upcoming",
    },
    {
      id: "delivery_completed",
      title: "Delivery Completed",
      description: fulfillmentDone ? "Completed" : "Not yet completed",
      state: fulfillmentDone ? "completed" : "upcoming",
    },
  ];
}
