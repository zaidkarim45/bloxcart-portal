import Link from "next/link";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

/**
 * Placeholder root route. The real storefront isn't part of this project
 * (that's the Shopify theme) -- this app is checkout + the order portal +
 * the admin dashboard, so this page is just a development index linking to
 * what's built so far.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">{brand.name} · Order Platform</p>
      <h1 className="max-w-xl text-3xl font-bold tracking-tight text-foreground">
        Checkout + Order Portal (dev index)
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This project has no public storefront of its own — it powers checkout and post-purchase
        order tracking for the Shopify theme.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/checkout">View checkout prototype</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/order/demo">View order portal (soon)</Link>
        </Button>
      </div>
    </div>
  );
}
