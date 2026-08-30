import { cn } from "@/lib/utils";

export type ConnectionState = "connected" | "reconnecting";

/**
 * Represents the order portal's own realtime connection, not whether the
 * customer's Roblox account is online -- never conflate the two (see
 * spec: "Do not imply the Roblox account itself is online").
 */
export function ConnectionBadge({ state }: { state: ConnectionState }) {
  const connected = state === "connected";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          connected ? "bg-success" : "animate-pulse bg-warning"
        )}
      />
      {connected ? "Connected" : "Reconnecting"}
    </span>
  );
}
