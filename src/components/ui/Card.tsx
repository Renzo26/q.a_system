import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className, interactive, style, onClick }: CardProps) {
  return (
    <div
      style={style}
      onClick={onClick}
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        interactive && "transition-all duration-300 ease-[var(--ease-out-quart)] hover:-translate-y-0.5 hover:shadow-pop",
        className,
      )}
    >
      {children}
    </div>
  );
}
