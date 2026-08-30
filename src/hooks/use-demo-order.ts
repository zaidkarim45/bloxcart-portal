"use client";

import { useCallback, useRef, useState } from "react";

import type { ConnectionState } from "@/components/order/connection-badge";
import { reassuranceMessages, workflowMessages } from "@/lib/delivery/messages";
import { MOCK_ORDER } from "@/lib/mock/order";
import type { ChatMessageData, MessageSender, Order, OrderStatus } from "@/lib/types/order";
import type { RobloxProfile } from "@/lib/roblox/types";

/**
 * Client-side stand-in for the real order state machine (Phase E). All
 * mutation happens through named actions here, never by components
 * setting `order.status` directly -- once this is backed by a real
 * server, only the internals of these functions change (to API calls),
 * not their call sites in the page component.
 */
export function useDemoOrder() {
  const [order, setOrder] = useState<Order>(MOCK_ORDER);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("connected");
  const idCounter = useRef(0);

  const pushMessage = useCallback((sender: MessageSender, text: string, agentName?: string) => {
    idCounter.current += 1;
    const message: ChatMessageData = {
      id: `msg_${idCounter.current}`,
      sender,
      text,
      createdAt: new Date().toISOString(),
      agentName,
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendAssistantMessage = useCallback(
    (text: string, thinkMs = 900) =>
      new Promise<void>((resolve) => {
        setIsAssistantTyping(true);
        setTimeout(() => {
          setIsAssistantTyping(false);
          pushMessage("assistant", text);
          resolve();
        }, thinkMs);
      }),
    [pushMessage]
  );

  const transition = useCallback((status: OrderStatus) => {
    setOrder((prev) => ({ ...prev, status }));
  }, []);

  const linkAccount = useCallback(
    async (profile: RobloxProfile) => {
      setOrder((prev) => ({
        ...prev,
        status: "account_linked",
        robloxAccount: { ...profile, verified: true },
      }));
      pushMessage("system", "Roblox account linked");
      await sendAssistantMessage(workflowMessages.accountLinked({ ...profile, verified: true }), 700);
      transition("awaiting_customer");
      await sendAssistantMessage(workflowMessages.readyCheck, 1100);
    },
    [pushMessage, sendAssistantMessage, transition]
  );

  const markCustomerReady = useCallback(async () => {
    pushMessage("system", "You marked yourself as ready");
    setOrder((prev) => ({ ...prev, status: "customer_ready", customerReadyAt: new Date().toISOString() }));
    await sendAssistantMessage(workflowMessages.customerReadyAck, 600);
    transition("queued");
    await sendAssistantMessage(
      `${workflowMessages.waiting}\n\n${reassuranceMessages[0]}`,
      900
    );
  }, [pushMessage, sendAssistantMessage, transition]);

  const sendCustomerMessage = useCallback(
    async (text: string) => {
      pushMessage("customer", text);
      if (order.status === "queued" || order.status === "customer_ready") {
        await sendAssistantMessage(
          "We've received your message. Your order will remain active while you wait.",
          800
        );
      }
    },
    [order.status, pushMessage, sendAssistantMessage]
  );

  // --- Dev-only simulation controls (staff-side actions, no real backend yet) ---

  const simulateAgentAssigned = useCallback(async () => {
    const agentName = "Agent Riley";
    setOrder((prev) => ({ ...prev, status: "agent_assigned", assignedAgentName: agentName }));
    pushMessage("system", "Delivery agent assigned");
    await sendAssistantMessage(workflowMessages.agentAssigned(agentName), 700);
  }, [pushMessage, sendAssistantMessage]);

  const simulateDeliveryStarted = useCallback(async () => {
    transition("delivery_in_progress");
    pushMessage("agent", "I'm heading to the trade now — please join when I send the invite.", order.assignedAgentName ?? undefined);
    await sendAssistantMessage(workflowMessages.deliveryStarted, 600);
  }, [order.assignedAgentName, pushMessage, sendAssistantMessage, transition]);

  const simulateDeliveryComplete = useCallback(async () => {
    setOrder((prev) => ({
      ...prev,
      status: "delivered",
      deliveredAt: new Date().toISOString(),
      items: prev.items.map((item) => ({ ...item, fulfilled: true })),
    }));
    pushMessage("system", "Delivery marked complete");
    await sendAssistantMessage(workflowMessages.deliveryComplete, 500);
  }, [pushMessage, sendAssistantMessage]);

  const simulateReconnect = useCallback(() => {
    setConnection("reconnecting");
    setTimeout(() => setConnection("connected"), 1800);
  }, []);

  return {
    order,
    messages,
    isAssistantTyping,
    isLinkModalOpen,
    connection,
    setIsLinkModalOpen,
    linkAccount,
    markCustomerReady,
    sendCustomerMessage,
    simulateAgentAssigned,
    simulateDeliveryStarted,
    simulateDeliveryComplete,
    simulateReconnect,
  };
}
