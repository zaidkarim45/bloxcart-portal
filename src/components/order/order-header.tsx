import Link from "next/link";
import { HelpCircle, ExternalLink } from "lucide-react";

import { brand } from "@/lib/brand";

export function OrderHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border-muted px-4 py-4 sm:px-6">
      <Link href="/" className="text-base font-bold tracking-tight text-foreground">
        {brand.name}
      </Link>
      <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
        <a href={brand.supportUrl} className="inline-flex items-center gap-1.5 hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
          Help
        </a>
        <a
          href={brand.storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-foreground"
        >
          Visit Store
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}
