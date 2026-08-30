import "server-only";

/**
 * Fires a plain-text Discord webhook message. Silently no-ops when
 * DISCORD_WEBHOOK_URL isn't set (pre-launch / local dev) rather than
 * throwing -- a missing notification should never break the order flow
 * or chat that triggered it.
 */
export async function notifyDiscord(content: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch (err) {
    console.error("notifyDiscord failed:", err instanceof Error ? err.message : err);
  }
}
