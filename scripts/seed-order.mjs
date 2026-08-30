// One-off seed script for manually creating a test order while there's no
// Shopify webhook yet (Phase L). Run with: npm run db:seed
// Requires supabase/schema.sql to have already been applied.
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  try {
    const content = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {
    // .env.local is optional if these are already exported in the shell
  }
}
loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

const token = randomBytes(24).toString("base64url");

const { data: order, error: orderError } = await supabase
  .from("orders")
  .insert({
    public_order_number: "249464",
    public_access_token: token,
    status: "awaiting_account",
    subtotal: 5.49,
    discount_total: 0.54,
    total: 4.95,
    currency: "USD",
  })
  .select()
  .single();

if (orderError) {
  console.error("Failed to create order:", orderError.message);
  process.exit(1);
}

const { error: itemError } = await supabase.from("order_items").insert({
  order_id: order.id,
  name: "Run Faster",
  quantity: 1,
  price: 5.49,
  fulfilled: false,
});

if (itemError) {
  console.error("Failed to create order item:", itemError.message);
  process.exit(1);
}

await supabase.from("order_events").insert({
  order_id: order.id,
  event_type: "PAYMENT_CONFIRMED",
  to_status: "awaiting_account",
  actor_type: "system",
});

console.log("Seeded order #249464");
console.log(`Token: ${token}`);
console.log(`Path:  /order/${token}`);
