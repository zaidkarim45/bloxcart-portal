# Architecture

Companion app to the `bloxcartz` Shopify theme: everything after "add to
cart" that isn't Shopify's own checkout page — the checkout UI prototype,
and (upcoming) the post-purchase order portal and internal delivery
dashboard.

## Why a separate project

`bloxcartz` is a Shopify Online Store 2.0 theme (Liquid/CSS/JS only, no
Node project) that auto-deploys to the live store on every push to `main`.
This app is Next.js/Supabase/TypeScript — a fundamentally different runtime
that doesn't belong inside a theme's fixed folder contract.

## Stack

Next.js (App Router) + TypeScript + Tailwind v4 + Framer Motion +
shadcn-style primitives (hand-built in `components/ui/`, not fetched via
the shadcn CLI — `ui.shadcn.com` is blocked by this environment's network
policy, so the same Radix + CVA + Tailwind pattern is authored directly).
Supabase/Postgres, Shopify Admin API + webhooks, Discord webhooks, and
public Roblox profile endpoints are the planned external integrations —
none are connected yet (see "Demo mode" below).

## Important: payment is not custom-built

Shopify does not allow a merchant's own code to collect raw card numbers
(PCI-DSS) — `components/checkout/payment-section.tsx` is a **visual
prototype only**, explicitly labeled as such in its own file comment. The
real integration point is either:

1. Redirecting to Shopify's own hosted checkout for the cart, or
2. Reskinning that real checkout via Shopify's Checkout Branding /
   Checkout UI Extensions APIs.

Nothing in this codebase should ever be extended to actually submit card
data anywhere.

## Demo mode

`lib/config.ts#isDemoMode()` is an explicit flag (`NEXT_PUBLIC_DEMO_MODE`),
not inferred from missing credentials — inferring it would make "forgot to
configure production" indistinguishable from "intentionally running the
demo." Mock data lives under `lib/mock/`.

## Order domain (planned — Phase 3/8, not yet implemented)

Status machine: `payment_pending → payment_confirmed → awaiting_account →
account_linked → awaiting_customer → customer_ready → queued →
agent_assigned → delivery_preparing → customer_joining →
delivery_in_progress → delivered`, with `delivery_failed`,
`manual_review`, `cancelled`, `refunded` as off-ramps. All transitions
validated server-side; every transition writes an append-only
`order_events` row. Customers get a mapped subset of these as
human-readable status copy — never the raw internal state name.

Orders are addressed by an unguessable `public_access_token`
(`/order/[token]`), never by database id.

## Fulfillment abstraction

`DeliveryProvider` interface (`prepareDelivery`, `startDelivery`,
`getDeliveryStatus`, `completeDelivery`, `cancelDelivery`); `
ManualDeliveryProvider` is the only implementation for now and coordinates
the staff workflow — it does not touch Roblox/MM2 itself. Nothing outside
`lib/delivery/` should assume how in-game fulfillment happens.

## Status

- **Phase A** (scaffold, design tokens, folder structure): done.
- **Phase B** (`/checkout`, mock data): done — see `components/checkout/`.
- **Phase C** (`/order/demo`, mock data): done — see `components/order/`,
  `components/chat/`, `hooks/use-demo-order.ts`. Covers the full
  customer-facing journey (link account → ready → queued → agent
  assigned → delivery in progress → complete) driven by a client-side
  mock state machine. Staff-side actions that don't exist yet (assign
  agent, start/complete delivery) are exposed via a dev-only, collapsed-
  by-default panel (`components/order/demo-controls.tsx`), gated by
  `isDemoMode()` — must never render in production.
- `/order/[token]` (real, persisted orders): not started — depends on
  Phase E/F (DB schema + real state machine).
- Everything from Phase D onward beyond the above (Roblox *real* lookup
  service, DB schema, realtime, admin dashboard, Shopify webhooks,
  Discord, proof uploads, analytics): not started.

See the project's own phase list for the full order — this file gets
updated at the end of each phase rather than duplicating that list here.
