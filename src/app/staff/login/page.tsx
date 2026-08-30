import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Staff Login",
  robots: { index: false, follow: false },
};

export default function StaffLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <h1 className="text-lg font-semibold text-foreground">Staff Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter the staff password to continue.</p>
        <LoginForm />
      </div>
    </div>
  );
}
