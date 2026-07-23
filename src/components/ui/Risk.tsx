import { cn, riskLabel, type RiskLevel } from "@/lib/utils";

const dot: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  med: "bg-risk-med",
  high: "bg-risk-high",
};

const badge: Record<RiskLevel, string> = {
  low: "bg-risk-low-soft text-risk-low",
  med: "bg-risk-med-soft text-risk-med",
  high: "bg-risk-high-soft text-risk-high",
};

const text: Record<RiskLevel, string> = {
  low: "text-risk-low",
  med: "text-risk-med",
  high: "text-risk-high",
};

const strokeVar: Record<RiskLevel, string> = {
  low: "var(--color-risk-low)",
  med: "var(--color-risk-med)",
  high: "var(--color-risk-high)",
};

export function RiskDot({ level, className }: { level: RiskLevel; className?: string }) {
  return <span className={cn("inline-block size-2 rounded-full", dot[level], className)} />;
}

export function RiskBadge({ level, label, className }: { level: RiskLevel; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        badge[level],
        className,
      )}
    >
      <RiskDot level={level} />
      {label ?? riskLabel[level]}
    </span>
  );
}

export function ScoreRing({ score, level, size = 56 }: { score: number; level: RiskLevel; size?: number }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={strokeVar[level]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-1000 ease-[var(--ease-out-quart)]"
        />
      </svg>
      <span className={cn("nums absolute font-bold", text[level])} style={{ fontSize: size * 0.28 }}>
        {score}
      </span>
    </div>
  );
}
