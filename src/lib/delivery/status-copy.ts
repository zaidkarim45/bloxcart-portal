import type { OrderStatus } from "@/lib/types/order";

export interface StatusCopy {
  label: string;
  description: string;
}

/**
 * Maps internal order status -> what the customer actually sees. Never
 * render `order.status` directly in customer-facing UI -- always go
 * through this so internal state names/vocabulary can change without
 * silently changing customer-visible copy.
 */
const STATUS_COPY: Record<OrderStatus, StatusCopy> = {
  payment_pending: {
    label: "Awaiting payment",
    description: "We're confirming your payment.",
  },
  payment_confirmed: {
    label: "Payment received",
    description: "Your payment has been confirmed.",
  },
  awaiting_account: {
    label: "Link your Roblox account",
    description: "Connect the Roblox account you want this order delivered to.",
  },
  account_linked: {
    label: "Account linked",
    description: "Your Roblox account is linked to this order.",
  },
  awaiting_customer: {
    label: "Preparing your delivery",
    description: "Let us know when you're ready to receive your items.",
  },
  customer_ready: {
    label: "Added to delivery queue",
    description: "Your order remains active while you wait.",
  },
  queued: {
    label: "Preparing your delivery",
    description: "We'll update you here as soon as your delivery is ready.",
  },
  agent_assigned: {
    label: "Delivery agent assigned",
    description: "An agent is preparing to deliver your items.",
  },
  delivery_preparing: {
    label: "Delivery agent assigned",
    description: "An agent is preparing to deliver your items.",
  },
  customer_joining: {
    label: "Delivery in progress",
    description: "Follow the instructions from your delivery agent.",
  },
  delivery_in_progress: {
    label: "Delivery in progress",
    description: "Your items are being delivered.",
  },
  delivered: {
    label: "Delivery complete",
    description: "Your order has been successfully fulfilled.",
  },
  delivery_failed: {
    label: "Delivery needs attention",
    description: "We ran into an issue and are looking into it.",
  },
  manual_review: {
    label: "Under review",
    description: "Our team is manually reviewing your order.",
  },
  cancelled: {
    label: "Cancelled",
    description: "This order has been cancelled.",
  },
  refunded: {
    label: "Refunded",
    description: "This order has been refunded.",
  },
};

export function getStatusCopy(status: OrderStatus): StatusCopy {
  return STATUS_COPY[status];
}
