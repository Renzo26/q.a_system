import { BrandMark, BrandWordmark } from "@/components/ui/BrandMark";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  showText?: boolean;
  className?: string;
}

/* `variant` = tom do fundo em que o logo é aplicado.
   dark  → fundo escuro (shell): barras claras
   light → fundo claro (canvas): barras em tinta */
const markSize = { sm: "h-7", md: "h-8", lg: "h-10" };
const wordSize = { sm: "h-[11px]", md: "h-[13px]", lg: "h-4" };
const subSize = { sm: "text-[9px]", md: "text-[10px]", lg: "text-[11px]" };

export function Logo({ size = "md", variant = "dark", showText = true, className }: LogoProps) {
  const inkColor = variant === "dark" ? "text-shell-ink" : "text-ink";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark className={cn(markSize[size], inkColor)} solid={size !== "lg"} />
      {showText && (
        <div className="leading-none">
          <BrandWordmark className={cn(wordSize[size], inkColor)} />
          <div className={cn("mt-1.5 font-mono uppercase tracking-[0.2em] text-brand", subSize[size])}>
            Q.A com IA
          </div>
        </div>
      )}
    </div>
  );
}
