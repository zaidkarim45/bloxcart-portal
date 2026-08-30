import type { ReactNode } from "react";

import { CheckoutDecoration } from "@/components/checkout/checkout-decoration";
import { brand } from "@/lib/brand";

export function CheckoutLayout({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border-muted px-4 pb-4 pt-6">
        <CheckoutDecoration />
        <p className="mt-2 text-center text-lg font-bold tracking-tight text-foreground">
          {brand.name}
        </p>
      </header>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[1fr_400px] lg:gap-14 lg:px-6">
        <div className="flex flex-col gap-10">{left}</div>
        <div>{right}</div>
      </main>
    </div>
  );
}
