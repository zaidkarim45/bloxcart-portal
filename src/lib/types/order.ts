/**
 * Full internal status list from the project spec. Not every value is
 * reachable in the current mock-data flow (Phase C) -- delivery_failed,
 * manual_review, cancelled, and refunded are modeled here so the type is
 * already correct for Phase E (real state machine), even though nothing
 * yet transitions into them.
 */
export type OrderStatus =
  | "payment_pending"
  | "payment_confirmed"
  | "awaiting_account"
  | "account_linked"
  | "awaiting_customer"
  | "customer_ready"
  | "queued"
  | "agent_assigned"
  | "delivery_preparing"
  | "customer_joining"
  | "delivery_in_progress"
  | "delivered"
  | "delivery_failed"
  | "manual_review"
  | "cancelled"
  | "refunded";

export interface RobloxAccount {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  verified: boolean;
}

export interface OrderLineItem {
  id: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  price: number;
  fulfilled: boolean;
}

export interface Order {
  id: string;
  publicOrderNumber: string;
  createdAt: string;
  currency: string;
  total: number;
  status: OrderStatus;
  robloxAccount: RobloxAccount | null;
  items: OrderLineItem[];
  customerReadyAt: string | null;
  deliveredAt: string | null;
  assignedAgentName: string | null;
}

export type MessageSender = "system" | "assistant" | "customer" | "agent";

export interface ChatMessageAction {
  label: string;
  onSelect: () => void;
}

export interface ChatMessageData {
  id: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
  agentName?: string;
}
