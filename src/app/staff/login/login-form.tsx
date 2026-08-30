"use client";

import { useActionState } from "react";

import { staffLoginAction } from "./actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(staffLoginAction, undefined);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        autoFocus
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
