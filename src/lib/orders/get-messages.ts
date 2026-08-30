import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ChatMessageData, MessageSender } from "@/lib/types/order";

interface MessageRow {
  id: string;
  sender: MessageSender;
  agent_name: string | null;
  content: string;
  created_at: string;
}

export async function getOrderMessages(orderId: string): Promise<ChatMessageData[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender, agent_name, content, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getOrderMessages failed:", error.message);
    return [];
  }

  return (data as MessageRow[]).map((row) => ({
    id: row.id,
    sender: row.sender,
    text: row.content,
    createdAt: row.created_at,
    agentName: row.agent_name ?? undefined,
  }));
}
