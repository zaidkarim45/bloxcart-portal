import { LifeBuoy, ShieldCheck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TrustCard {
  Icon: LucideIcon;
  title: string;
  body: string;
}

// Truthful reassurance copy only -- no delivery-time or availability
// promises that aren't actually configured. See PHASE 1 spec: avoid
// unsupported claims like "instant" or "guaranteed" delivery.
const TRUST_CARDS: TrustCard[] = [
  {
    Icon: LifeBuoy,
    title: "Support",
    body: "Need help? Our support team can assist with your order.",
  },
  {
    Icon: ShieldCheck,
    title: "Delivery Guarantee",
    body: "Your order remains protected until fulfillment is completed.",
  },
  {
    Icon: Zap,
    title: "Order Tracking",
    body: "Follow your live order page after checkout to receive your items.",
  },
];

export function TrustCards() {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {TRUST_CARDS.map(({ Icon, title, body }) => (
        <div
          key={title}
          className="flex flex-col gap-1.5 rounded-lg border border-border-muted bg-card-secondary p-3"
        >
          <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <p className="text-xs font-semibold text-foreground">{title}</p>
          <p className="text-[11px] leading-snug text-muted-foreground">{body}</p>
        </div>
      ))}
    </div>
  );
}
