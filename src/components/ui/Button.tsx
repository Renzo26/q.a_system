import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "brand" | "outline" | "ghost";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 active:scale-[0.985] " +
  "disabled:pointer-events-none disabled:opacity-55";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-surface hover:bg-ink/90",
  brand: "bg-brand text-brand-ink hover:bg-brand-bright",
  outline: "border border-line bg-surface text-ink hover:border-ink/25 hover:bg-surface-2",
  ghost: "text-ink-soft hover:bg-surface-2 hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-[13.5px]",
  lg: "h-12 px-5 text-[14.5px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
