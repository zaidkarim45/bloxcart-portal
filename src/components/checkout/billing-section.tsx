"use client";

import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface BillingAddress {
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postcode: string;
}

export interface BillingSectionProps {
  value: BillingAddress;
  onChange: (value: BillingAddress) => void;
}

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia"];

export function BillingSection({ value, onChange }: BillingSectionProps) {
  function set<K extends keyof BillingAddress>(key: K, val: BillingAddress[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Billing address</h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="billing-country" className="sr-only">
          Country/Region
        </Label>
        <div className="relative">
          <select
            id="billing-country"
            value={value.country}
            onChange={(e) => set("country", e.target.value)}
            className="h-14 w-full appearance-none rounded-lg border border-border bg-input px-3.5 pt-5 pb-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute left-3.5 top-1.5 text-[11px] text-muted-foreground">
            Country/Region
          </span>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="billing-first-name" className="sr-only">
            First name
          </Label>
          <Input
            id="billing-first-name"
            placeholder="First name"
            autoComplete="given-name"
            value={value.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="billing-last-name" className="sr-only">
            Last name
          </Label>
          <Input
            id="billing-last-name"
            placeholder="Last name"
            autoComplete="family-name"
            value={value.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="billing-address" className="sr-only">
          Address
        </Label>
        <Input
          id="billing-address"
          placeholder="Address"
          autoComplete="street-address"
          value={value.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="billing-city" className="sr-only">
            City
          </Label>
          <Input
            id="billing-city"
            placeholder="City"
            autoComplete="address-level2"
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="billing-postcode" className="sr-only">
            Postcode
          </Label>
          <Input
            id="billing-postcode"
            placeholder="Postcode"
            autoComplete="postal-code"
            value={value.postcode}
            onChange={(e) => set("postcode", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
