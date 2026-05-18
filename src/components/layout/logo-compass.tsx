import { cn } from "@/lib/utils";

interface LogoCompassProps {
  className?: string;
  size?: number;
}

export function LogoCompass({ className, size = 32 }: LogoCompassProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="17"
        className="stroke-gold"
        strokeWidth="1.5"
      />
      <circle
        cx="20"
        cy="20"
        r="13"
        className="stroke-gold/40"
        strokeWidth="1"
        strokeDasharray="1 2"
      />
      {/* Compass needle: bright red north, muted south */}
      <path d="M20 6 L24 20 L20 18 Z" className="fill-north" />
      <path d="M20 6 L16 20 L20 18 Z" className="fill-north/70" />
      <path d="M20 34 L24 20 L20 22 Z" className="fill-foreground/40" />
      <path d="M20 34 L16 20 L20 22 Z" className="fill-foreground/60" />
      <circle cx="20" cy="20" r="1.6" className="fill-gold" />
    </svg>
  );
}
