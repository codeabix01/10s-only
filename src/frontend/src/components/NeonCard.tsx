import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  glow?: "purple" | "magenta" | "cyan" | "none";
  hoverable?: boolean;
  "data-ocid"?: string;
  style?: React.CSSProperties;
}

const glowClasses: Record<string, string> = {
  purple:
    "border-primary/40 hover:border-primary/70 hover:shadow-[0_0_20px_rgba(104,0,255,0.35),0_0_40px_rgba(104,0,255,0.15)]",
  magenta:
    "border-secondary/40 hover:border-secondary/70 hover:shadow-[0_0_20px_rgba(255,0,220,0.35),0_0_40px_rgba(255,0,220,0.15)]",
  cyan: "border-accent/40 hover:border-accent/70 hover:shadow-[0_0_20px_rgba(0,255,240,0.25),0_0_40px_rgba(0,255,240,0.12)]",
  none: "border-border/30",
};

export function NeonCard({
  children,
  className,
  glow = "purple",
  hoverable = false,
  ...props
}: NeonCardProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative rounded-xl backdrop-blur-md bg-card/15 border transition-all duration-300",
        glowClasses[glow],
        hoverable && "cursor-pointer hover:bg-card/25 hover:scale-[1.01]",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.025]"
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="5"/><feColorMatrix type="saturate" values="0"/><feBlend in="SourceGraphic" mode="overlay"/></filter><rect width="200" height="200" fill="%23fff" filter="url(%23n)"/></svg>\')',
        }}
      />
      {children}
    </div>
  );
}
