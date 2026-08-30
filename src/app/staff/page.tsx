import type { Metadata } from "next";
import Link from "next/link";

import { staffLogoutAction } from "@/app/staff/login/actions";
import { getStaffOrders } from "@/lib/staff/get-orders";

export const metadata: Metadata = {
  title: "Staff — Orders",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StaffOrdersPage() {
  const orders = await getStaffOrders();

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Orders</h1>
          <form action={staffLogoutAction}>
            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
              Log out
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/staff/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">#{order.publicOrderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.customerEmail ?? "no email"}
                    {order.robloxUsername ? ` · @${order.robloxUsername}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-elevated px-3 py-1 text-xs font-medium text-foreground">
                  {order.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
