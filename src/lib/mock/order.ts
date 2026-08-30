import type { Order } from "@/lib/types/order";

/**
 * Seed order for `/order/demo`, matching the demo order used on the
 * checkout prototype (#249464, Run Faster, $4.95 after discount) so both
 * pages tell one consistent story.
 */
export const MOCK_ORDER: Order = {
  id: "order_249464",
  publicOrderNumber: "249464",
  createdAt: new Date().toISOString(),
  currency: "USD",
  total: 4.95,
  status: "awaiting_account",
  robloxAccount: null,
  items: [
    {
      id: "run-faster",
      name: "Run Faster",
      imageUrl: null,
      quantity: 1,
      price: 5.49,
      fulfilled: false,
    },
  ],
  customerReadyAt: null,
  deliveredAt: null,
  assignedAgentName: null,
};
