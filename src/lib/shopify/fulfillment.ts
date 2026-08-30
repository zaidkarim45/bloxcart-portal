import "server-only";

import { shopifyAdminGraphQL, shopifyOrderGid } from "./admin-client";

export interface ShopifyActionResult {
  ok: boolean;
  error?: string;
}

interface FulfillmentOrdersResponse {
  order: {
    fulfillmentOrders: { nodes: { id: string; status: string }[] };
  } | null;
}

interface FulfillmentCreateResponse {
  fulfillmentCreateV2: {
    fulfillment: { id: string; status: string } | null;
    userErrors: { field: string[] | null; message: string }[];
  };
}

/**
 * Fulfills every remaining (OPEN) fulfillment order on the Shopify order in
 * one call. If nothing is open -- already fulfilled, or a redundant click --
 * that's treated as success rather than an error, since the end state
 * ("fulfilled in Shopify") is already true either way.
 */
export async function fulfillShopifyOrder(shopifyOrderId: string): Promise<ShopifyActionResult> {
  const { order } = await shopifyAdminGraphQL<FulfillmentOrdersResponse>(
    `query OrderFulfillmentOrders($id: ID!) {
      order(id: $id) {
        fulfillmentOrders(first: 20) {
          nodes { id status }
        }
      }
    }`,
    { id: shopifyOrderGid(shopifyOrderId) }
  );

  if (!order) return { ok: false, error: "Shopify order not found." };

  const openFulfillmentOrders = order.fulfillmentOrders.nodes.filter((fo) => fo.status === "OPEN");
  if (openFulfillmentOrders.length === 0) {
    return { ok: true };
  }

  const { fulfillmentCreateV2 } = await shopifyAdminGraphQL<FulfillmentCreateResponse>(
    `mutation FulfillOrder($fulfillment: FulfillmentV2Input!) {
      fulfillmentCreateV2(fulfillment: $fulfillment) {
        fulfillment { id status }
        userErrors { field message }
      }
    }`,
    {
      fulfillment: {
        lineItemsByFulfillmentOrder: openFulfillmentOrders.map((fo) => ({ fulfillmentOrderId: fo.id })),
        notifyCustomer: true,
      },
    }
  );

  if (fulfillmentCreateV2.userErrors.length > 0) {
    return { ok: false, error: fulfillmentCreateV2.userErrors.map((e) => e.message).join("; ") };
  }

  return { ok: true };
}
