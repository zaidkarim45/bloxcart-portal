"use client";

import { useEffect, useRef, useState } from "react";

import type { ChatMessageData } from "@/lib/types/order";

const POLL_INTERVAL_MS = 3000;

/**
 * Polls `${fetchUrl}?after=<lastMessageTimestamp>` every few seconds and
 * appends whatever's new -- the "live" chat mechanism for both the
 * customer and staff pages (see their matching /api/.../messages routes
 * for why this is polling and not a Supabase Realtime subscription).
 *
 * `fetchUrl` must be a stable string (e.g. built from a token/order id
 * that doesn't change across renders) -- it's the poll effect's only
 * dependency, so a new function/object identity every render would
 * restart the poll loop every render instead of every POLL_INTERVAL_MS.
 *
 * Optimistic sends: call `addPending` right after firing the send action
 * so the sender sees their own message immediately. It's tracked
 * separately from the confirmed/polled list and dropped the moment ANY
 * poll returns new rows -- at that point the real (authoritative) message
 * has landed, so there's nothing left for the placeholder to stand in for.
 */
export function useLiveMessages(initialMessages: ChatMessageData[], fetchUrl: string) {
  const [confirmed, setConfirmed] = useState(initialMessages);
  const [pending, setPending] = useState<ChatMessageData[]>([]);

  // Resync when the parent's server-fetched initialMessages prop changes
  // (e.g. router.refresh() after a non-chat action) -- adjusted during
  // render via plain state, per React's guidance for resetting state on a
  // prop change (same approach this app already uses elsewhere for the
  // same reason). Can't use a ref for the comparison here: refs can only
  // be read/written in effects and handlers, never during render.
  const [seenInitial, setSeenInitial] = useState(initialMessages);
  if (initialMessages !== seenInitial) {
    setSeenInitial(initialMessages);
    setConfirmed(initialMessages);
    setPending([]);
  }

  // A ref mirror of `confirmed`, kept in sync via effect, so the poll
  // closure below can always read the latest value without needing to
  // restart its effect (and timer) every time a message arrives.
  const confirmedRef = useRef(confirmed);
  useEffect(() => {
    confirmedRef.current = confirmed;
  }, [confirmed]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const after = confirmedRef.current.at(-1)?.createdAt ?? new Date(0).toISOString();
        const url = `${fetchUrl}?after=${encodeURIComponent(after)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as { messages?: ChatMessageData[] };
          const fresh = data.messages ?? [];
          if (!cancelled && fresh.length > 0) {
            setConfirmed((prev) => {
              const seen = new Set(prev.map((m) => m.id));
              const additions = fresh.filter((m) => !seen.has(m.id));
              return additions.length === 0 ? prev : [...prev, ...additions];
            });
            setPending([]);
          }
        }
      } catch {
        // Transient network hiccup -- just try again on the next tick.
      } finally {
        if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fetchUrl]);

  return {
    messages: pending.length > 0 ? [...confirmed, ...pending] : confirmed,
    addPending: (message: ChatMessageData) => setPending((prev) => [...prev, message]),
  };
}
