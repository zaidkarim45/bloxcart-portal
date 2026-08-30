"use client";

import { useId, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ContactSectionProps {
  email: string;
  onEmailChange: (value: string) => void;
  emailError?: string;
  marketingOptIn: boolean;
  onMarketingOptInChange: (value: boolean) => void;
}

export function ContactSection({
  email,
  onEmailChange,
  emailError,
  marketingOptIn,
  onMarketingOptInChange,
}: ContactSectionProps) {
  const emailId = useId();
  const [touched, setTouched] = useState(false);
  const showError = touched && Boolean(emailError);

  return (
    <section aria-labelledby={`${emailId}-heading`} className="flex flex-col gap-4">
      <div>
        <h2 id={`${emailId}-heading`} className="text-lg font-semibold text-foreground">
          Contact Email (Used for Delivery Instructions)
        </h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={emailId} className="sr-only">
          Email
        </Label>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          invalid={showError}
          aria-describedby={showError ? `${emailId}-error` : undefined}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={() => setTouched(true)}
        />
        {showError ? (
          <p id={`${emailId}-error`} className="text-xs font-medium text-danger">
            {emailError}
          </p>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
        <Checkbox
          checked={marketingOptIn}
          onCheckedChange={(checked) => onMarketingOptInChange(checked === true)}
          className="mt-0.5"
        />
        <span>
          Get exclusive discounts and offers on Roblox items. Check your email to confirm your
          subscription!
        </span>
      </label>
    </section>
  );
}
