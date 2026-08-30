import "server-only";

import { shopifyAdminGraphQL, shopifyOrderGid } from "./admin-client";
import type { ShopifyActionResult } from "./fulfillment";

interface OrderCancelResponse {
  orderCancel: {
    job: { id: string; done: boolean } | null;
    orderCancelUserErrors: { field: string[] | null; message: string; code: string }[];
  };
}

/**
 * Both "cancel" and "refund" in the staff UI go through Shopify's own
 * orderCancel mutation rather than a hand-rolled refundCreate -- Shopify
 * already knows how to correctly compute a full refund across taxes,
 * shipping, and the original payment gateway, and reimplementing that math
 * ourselves is exactly the kind of thing that's easy to get subtly wrong
 * with real money. "Cancel" = void the order, no charge back (refund:
 * false) -- for mistaken/duplicate orders. "Refund" = cancel *and* fully
 * refund (refund: true) -- the actual common case for this business.
 */
async function cancelShopifyOrderInternal(
  shopifyOrderId: string,
  refund: boolean
): Promise<ShopifyActionResult> {
  const { orderCancel } = await shopifyAdminGraphQL<OrderCancelResponse>(
    `mutation CancelOrder($orderId: ID!, $reason: OrderCancelReason!, $refund: Boolean!, $restock: Boolean!, $notifyCustomer: Boolean) {
      orderCancel(orderId: $orderId, reason: $reason, refund: $refund, restock: $restock, notifyCustomer: $notifyCustomer) {
        job { id done }
        orderCancelUserErrors { field message code }
      }
    }`,
    {
      orderId: shopifyOrderGid(shopifyOrderId),
      reason: refund ? "CUSTOMER" : "OTHER",
      refund,
      restock: true,
      notifyCustomer: true,
    }
  );

  if (orderCancel.orderCancelUserErrors.length > 0) {
    return { ok: false, error: orderCancel.orderCancelUserErrors.map((e) => e.message).join("; ") };
  }

  return { ok: true };
}

export function cancelShopifyOrder(shopifyOrderId: string): Promise<ShopifyActionResult> {
  return cancelShopifyOrderInternal(shopifyOrderId, false);
}

export function refundShopifyOrder(shopifyOrderId: string): Promise<ShopifyActionResult> {
  return cancelShopifyOrderInternal(shopifyOrderId, true);
}
