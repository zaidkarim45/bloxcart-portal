import { NextResponse } from "next/server";

/**
 * One-time-use helper: finishes Shopify's OAuth handshake for the
 * Dev-Dashboard-created "Bloxcart Portal" app and shows the resulting
 * Admin API access token on screen so it can be copied into
 * SHOPIFY_ADMIN_API_ACCESS_TOKEN. The old "custom app" flow used to hand
 * this token over directly on Install; Dev Dashboard apps go through a
 * real OAuth exchange instead, which needs *something* server-side to
 * receive the redirect and trade the one-time code for a token -- this
 * route is that something. Not meant to stay load-bearing long-term
 * (Shopify's `code` is single-use and short-lived, and the token is only
 * ever printed once, directly to whoever completed the Shopify login), but
 * there's no harm leaving it deployed afterward.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");

  if (!code || !shop) {
    return NextResponse.json({ error: "Missing code or shop in callback URL." }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_OAUTH_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing SHOPIFY_OAUTH_CLIENT_ID or SHOPIFY_OAUTH_CLIENT_SECRET." },
      { status: 500 }
    );
  }

  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    return NextResponse.json({ error: "Shopify token exchange failed.", detail }, { status: 502 });
  }

  const json = (await tokenRes.json()) as { access_token: string; scope: string };

  return new NextResponse(
    `<!doctype html><html><body style="font-family: monospace; padding: 2rem; background: #0a0a0a; color: #eee;">
      <h2>Copy this into SHOPIFY_ADMIN_API_ACCESS_TOKEN on Vercel:</h2>
      <p style="word-break: break-all; background: #1a1a1a; padding: 1rem; border-radius: 8px;">${json.access_token}</p>
      <p>Granted scopes: ${json.scope}</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
