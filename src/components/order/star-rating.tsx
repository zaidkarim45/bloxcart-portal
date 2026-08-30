"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRating({ onRate }: { onRate: (rating: number) => void }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rate your experience">
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= (hovered || rating);
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => {
              setRating(value);
              onRate(value);
            }}
            className="transition-transform hover:scale-110 focus-visible:outline-none"
          >
            <Star
              className={cn("h-7 w-7", filled ? "fill-warning text-warning" : "text-border")}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
