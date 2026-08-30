-- bloxcart-portal database schema (Phase E)
-- Run this once in Supabase: Dashboard -> SQL Editor -> New Query -> paste -> Run.
-- Safe to re-run: everything is guarded with `if not exists`.

create extension if not exists pgcrypto;

do $$ begin
  create type order_status as enum (
    'payment_pending',
    'payment_confirmed',
    'awaiting_account',
    'account_linked',
    'awaiting_customer',
    'customer_ready',
    'queued',
    'agent_assigned',
    'delivery_preparing',
    'customer_joining',
    'delivery_in_progress',
    'delivered',
    'delivery_failed',
    'manual_review',
    'cancelled',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists roblox_accounts (
  id uuid primary key default gen_random_uuid(),
  roblox_user_id text not null unique,
  username text not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists staff_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- public_access_token is what /order/[token] looks orders up by -- never
-- the row id. Generated in application code (crypto.randomBytes(24)
-- .toString('base64url')), not by a Postgres default, so token format
-- stays consistent regardless of which code path creates an order.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  public_order_number text not null,
  public_access_token text not null unique,
  shopify_order_id text unique,
  shopify_order_name text,
  customer_id uuid references customers(id),
  status order_status not null default 'payment_pending',
  subtotal numeric(10, 2) not null default 0,
  discount_total numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  roblox_account_id uuid references roblox_accounts(id),
  assigned_agent_id uuid references staff_users(id),
  customer_ready_at timestamptz,
  delivery_started_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  name text not null,
  image_url text,
  quantity integer not null default 1,
  price numeric(10, 2) not null,
  fulfilled boolean not null default false
);

-- Append-only audit trail. Never updated or deleted, only inserted into --
-- see transitionOrderStatus() in lib/delivery once the real state machine
-- (rather than the client-side demo one) writes to this table.
create table if not exists order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  event_type text not null,
  from_status order_status,
  to_status order_status,
  actor_type text not null,
  actor_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  sender text not null check (sender in ('system', 'assistant', 'customer', 'agent')),
  agent_name text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items (order_id);
create index if not exists order_events_order_id_idx on order_events (order_id);
create index if not exists messages_order_id_idx on messages (order_id);
create index if not exists orders_public_access_token_idx on orders (public_access_token);

-- RLS on, no policies: the anon/publishable key can read/write nothing by
-- default. All access goes through server-side code using the
-- service_role key (which bypasses RLS), never direct client-side
-- queries -- see docs/ARCHITECTURE.md. Policies get added in Phase G if
-- Supabase Realtime ends up subscribing from the browser directly.
alter table customers enable row level security;
alter table roblox_accounts enable row level security;
alter table staff_users enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;
alter table messages enable row level security;
