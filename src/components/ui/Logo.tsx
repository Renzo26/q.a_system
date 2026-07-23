import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  showText?: boolean;
  className?: string;
}

const markSize = { sm: "size-8", md: "size-9", lg: "size-11" };
const textSize = { sm: "text-[15px]", md: "text-[17px]", lg: "text-[20px]" };

export function Logo({ size = "md", variant = "dark", showText = true, className }: LogoProps) {
  const wordColor = variant === "dark" ? "text-shell-ink" : "text-ink";
  const subColor = variant === "dark" ? "text-shell-mute" : "text-ink-mute";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-brand text-brand-ink",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_24px_-10px_rgba(228,242,74,0.7)]",
          markSize[size],
        )}
      >
        <Check className={size === "lg" ? "size-6" : "size-5"} strokeWidth={3.2} />
      </span>
      {showText && (
        <div className="leading-none">
          <div className={cn("font-display font-bold tracking-tight", textSize[size], wordColor)}>
            QA<span className="text-brand"> Argus</span>
          </div>
          <div className={cn("mt-1 font-mono text-[10px] uppercase tracking-[0.18em]", subColor)}>
            quality intelligence
          </div>
        </div>
      )}
    </div>
  );
}
