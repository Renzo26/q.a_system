import { ScanSearch, FlaskConical, ShieldAlert, Rocket, Sparkles, type LucideIcon } from "lucide-react";
import { promptStarters } from "@/lib/copilotEngine";

const iconMap: Record<string, LucideIcon> = {
  scan: ScanSearch,
  flask: FlaskConical,
  shield: ShieldAlert,
  rocket: Rocket,
};

export function PromptStarters({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-shell text-brand shadow-card">
        <Sparkles className="size-7" />
      </span>
      <h1 className="mt-5 font-display text-[24px] font-bold tracking-tight text-ink">
        Argus, seu agente de QA
      </h1>
      <p className="mt-2 max-w-md text-[14.5px] text-ink-soft">
        Pergunte sobre os defeitos, as coleções de teste e a qualidade do projeto — ou comece por um dos atalhos.
      </p>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {promptStarters.map((s) => {
          const Icon = iconMap[s.icon] ?? Sparkles;
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => onPick(s.prompt)}
              className="group flex items-center gap-3 rounded-tile border border-line bg-surface p-3.5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-pop"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-soft transition-colors group-hover:bg-brand group-hover:text-brand-ink">
                <Icon className="size-4" />
              </span>
              <span className="text-[13.5px] font-semibold text-ink">{s.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
