import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  color?: string;
  className?: string;
  height?: number;
}

export function Progress({ value, color = "var(--color-ink)", className, height = 6 }: ProgressProps) {
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-line", className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-quart)]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

/** Barra de cobertura com cor derivada do próprio valor. */
export function CoverageBar({ value, className }: { value: number; className?: string }) {
  const color =
    value >= 80 ? "var(--color-risk-low)" : value >= 65 ? "var(--color-risk-med)" : "var(--color-risk-high)";
  return <Progress value={value} color={color} className={className} />;
}
