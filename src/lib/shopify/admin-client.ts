import "server-only";

/**
 * Matches the api_version pinned in the order-redirect checkout extension
 * (bloxcart-checkout-extension repo) -- keeping both on the same version
 * isn't required, but there's no reason to drift them apart.
 */
const API_VERSION = "2026-07";

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

function getConfig() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  if (!domain || !token) {
    throw new Error(
      "Shopify Admin API is not configured (missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_ACCESS_TOKEN)."
    );
  }
  return { domain, token };
}

export async function shopifyAdminGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const { domain, token } = getConfig();

  const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin API request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Shopify Admin API returned errors: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("Shopify Admin API returned no data.");
  }
  return json.data;
}

export function shopifyOrderGid(shopifyOrderId: string): string {
  return `gid://shopify/Order/${shopifyOrderId}`;
}
