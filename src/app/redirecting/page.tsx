import type { Metadata } from "next";
import { Suspense } from "react";

import { RedirectingClient } from "./redirecting-client";

export const metadata: Metadata = {
  title: "Redirecting…",
  robots: { index: false, follow: false },
};

export default function RedirectingPage() {
  return (
    <Suspense>
      <RedirectingClient />
    </Suspense>
  );
}
