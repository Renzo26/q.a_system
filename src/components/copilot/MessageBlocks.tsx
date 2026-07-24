import {
  Loader2,
  Check,
  ShieldAlert,
  ClipboardList,
  FlaskConical,
  Plus,
  X,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BadgeCheck,
} from "lucide-react";
import { ScoreRing, RiskBadge, RiskDot } from "@/components/ui/Risk";
import { cn, type RiskLevel } from "@/lib/utils";
import type { Block, PlanScenario } from "@/lib/copilotEngine";

/** Renderização mínima de markdown inline: **negrito** e `código`. */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {parte.slice(2, -2)}
        </strong>
      );
    }
    if (parte.startsWith("`") && parte.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[12.5px] text-ink">
          {parte.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{parte}</span>;
  });
}

function TextBlock({ text }: { text: string }) {
  return <div className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{renderInline(text)}</div>;
}

function StepsBlock({ steps, revealed = 0, done = false }: { steps: string[]; revealed?: number; done?: boolean }) {
  return (
    <div className="rounded-tile border border-line bg-surface-2 p-3.5">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
        {done ? <Check className="size-3.5 text-risk-low" /> : <Loader2 className="size-3.5 animate-spin text-brand-deep" />}
        {done ? "Análise concluída" : "Assistente Q.A trabalhando"}
      </div>
      <ul className="space-y-1.5">
        {steps.map((s, i) => {
          const isDone = i < revealed;
          const isCurrent = i === revealed && !done;
          if (i > revealed) return null;
          return (
            <li key={s} className="flex items-center gap-2 text-[12.5px]">
              {isDone ? (
                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-risk-low/15 text-risk-low">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
              ) : (
                <Loader2 className="size-4 shrink-0 animate-spin text-ink-mute" />
              )}
              <span className={cn(isCurrent ? "text-ink" : "text-ink-soft")}>{s}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RiskBlock(props: Extract<Block, { kind: "risk" }>) {
  return (
    <div className="overflow-hidden rounded-tile border border-line bg-surface shadow-card">
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2 px-4 py-2.5">
        <ShieldAlert className="size-4 text-risk-high" />
        <span className="text-[12.5px] font-semibold text-ink">Análise de risco</span>
        <span className="ml-auto font-mono text-[11px] text-ink-mute">PR {props.pr}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-4">
          <ScoreRing score={props.score} level={props.level} size={62} />
          <div className="min-w-0">
            <RiskBadge level={props.level} />
            <div className="mt-1.5 truncate font-mono text-[12px] text-ink-soft">
              {props.module} · cobertura {props.coverage}%
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">Principais fatores</div>
          {props.factors.map((f) => (
            <div key={f.label} className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-3 py-2">
              <RiskDot level={f.impact} />
              <span className="text-[12.5px] text-ink">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const scenarioStyle: Record<PlanScenario["type"], string> = {
  Positivo: "bg-risk-low-soft text-risk-low",
  Negativo: "bg-risk-high-soft text-risk-high",
  Borda: "bg-risk-med-soft text-risk-med",
  Regressão: "bg-info-soft text-info",
};

function PlanBlock({ title, scenarios }: Extract<Block, { kind: "plan" }>) {
  return (
    <div className="overflow-hidden rounded-tile border border-line bg-surface shadow-card">
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2 px-4 py-2.5">
        <ClipboardList className="size-4 text-ink-soft" />
        <span className="text-[12.5px] font-semibold text-ink">{title}</span>
      </div>
      <ul className="divide-y divide-line-soft">
        {scenarios.map((s) => (
          <li key={s.name} className="flex items-start gap-3 px-4 py-2.5">
            <span
              className={cn(
                "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                scenarioStyle[s.type],
              )}
            >
              {s.type}
            </span>
            <span className="text-[13px] text-ink">{s.name}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2 border-t border-line-soft p-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-[12.5px] font-semibold text-surface transition-colors hover:bg-ink/90"
        >
          <Plus className="size-3.5" />
          Adicionar aos Planos de Teste
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
        >
          Ver plano
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function TestsBlock({ tests }: Extract<Block, { kind: "tests" }>) {
  return (
    <div className="overflow-hidden rounded-tile border border-line bg-surface shadow-card">
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2 px-4 py-2.5">
        <FlaskConical className="size-4 text-brand-deep" />
        <span className="text-[12.5px] font-semibold text-ink">Testes sugeridos</span>
        <span className="ml-auto rounded-full bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-deep">
          {tests.length}
        </span>
      </div>
      <ul className="divide-y divide-line-soft">
        {tests.map((t) => (
          <li key={t.id} className="p-3.5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[13px] font-semibold text-ink">{t.name}</span>
              <RiskBadge level={t.priority} className="shrink-0" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-info-soft px-2 py-0.5 text-[11px] font-semibold text-info">{t.type}</span>
              <span className="font-mono text-[11px] text-ink-mute">confiança {t.confidence}%</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-semibold text-surface transition-colors hover:bg-ink/90"
                >
                  <Plus className="size-3" />
                  Plano
                </button>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-lg border border-line text-risk-low transition-colors hover:bg-risk-low-soft"
                  aria-label="Aceitar"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-lg border border-line text-ink-mute transition-colors hover:bg-risk-high-soft hover:text-risk-high"
                  aria-label="Rejeitar"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const verdictTone: Record<RiskLevel, string> = {
  low: "bg-risk-low-soft text-risk-low",
  med: "bg-risk-med-soft text-risk-med",
  high: "bg-risk-high-soft text-risk-high",
};

function VerdictBlock({ decision, level, confidence, justification, gates }: Extract<Block, { kind: "verdict" }>) {
  return (
    <div className="overflow-hidden rounded-tile border border-line bg-surface shadow-card">
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2 px-4 py-2.5">
        <BadgeCheck className="size-4 text-ink-soft" />
        <span className="text-[12.5px] font-semibold text-ink">Recomendação de liberação</span>
        <span className="ml-auto font-mono text-[11px] text-ink-mute">confiança {confidence}%</span>
      </div>
      <div className="p-4">
        <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12.5px] font-bold", verdictTone[level])}>
          <ShieldAlert className="size-4" />
          {decision}
        </span>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{justification}</p>
        <div className="mt-4 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">Quality gates</div>
          {gates.map((g) => (
            <div key={g.label} className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-3 py-2">
              {g.ok ? (
                <CheckCircle2 className="size-4 shrink-0 text-risk-low" />
              ) : (
                <XCircle className="size-4 shrink-0 text-risk-high" />
              )}
              <span className={cn("text-[12.5px]", g.ok ? "text-ink" : "text-ink-soft")}>{g.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MessageBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case "text":
      return <TextBlock text={block.text} />;
    case "steps":
      return <StepsBlock {...block} />;
    case "risk":
      return <RiskBlock {...block} />;
    case "plan":
      return <PlanBlock {...block} />;
    case "tests":
      return <TestsBlock {...block} />;
    case "verdict":
      return <VerdictBlock {...block} />;
  }
}
