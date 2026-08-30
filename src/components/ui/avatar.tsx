import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-20 w-20 text-2xl",
};

/**
 * Renders the given image, or a deterministic initials fallback when no
 * avatar URL is available (unavailable/failed Roblox avatar lookups must
 * degrade gracefully, never break the layout -- see spec's "avatar
 * unavailable" handling requirement).
 */
export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-card-secondary font-bold text-white",
        SIZE_CLASSES[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- external avatar host, size varies
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
