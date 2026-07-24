import { Bug, Workflow, Zap, Sparkles, ListChecks, FileText } from "lucide-react";
import { quickActions } from "@/lib/copilotEngine";

export function ContextPanel({ onAction }: { onAction: (prompt: string) => void }) {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-surface-2/40 p-4 xl:flex">
      <div>
        <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          Contexto do agente
        </div>
        <div className="rounded-tile border border-line bg-surface p-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-shell text-brand">
              <Sparkles className="size-4" />
            </span>
            <span className="text-[12.5px] font-semibold text-ink">Conectado aos dados do projeto</span>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
            O Assistente Q.A consulta os defeitos e as coleções de teste reais antes de responder.
          </p>
        </div>
      </div>

      {/* Fontes de dados */}
      <div className="rounded-tile border border-line bg-surface p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">Fontes de dados</div>
        <ul className="space-y-1.5 text-[12.5px] text-ink">
          <li className="flex items-center gap-2">
            <Bug className="size-3.5 text-risk-high" /> Defeitos e evidências
          </li>
          <li className="flex items-center gap-2">
            <Workflow className="size-3.5 text-brand-deep" /> Coleções do Postman (fluxos)
          </li>
        </ul>
      </div>

      {/* Ações rápidas */}
      <div>
        <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          Ações rápidas
        </div>
        <div className="space-y-1.5">
          {quickActions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => onAction(a.prompt)}
              className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-left text-[12.5px] font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
            >
              <Zap className="size-3.5 text-brand-deep" />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* O que o Assistente Q.A enxerga */}
      <div className="mt-auto rounded-tile border border-dashed border-line p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">O Assistente Q.A enxerga</div>
        <ul className="space-y-1.5 text-[12px] text-ink-soft">
          <li className="flex items-center gap-2">
            <Bug className="size-3.5 text-ink-mute" /> Códigos, severidade e status dos defeitos
          </li>
          <li className="flex items-center gap-2">
            <ListChecks className="size-3.5 text-ink-mute" /> Passos e validações de cada coleção
          </li>
          <li className="flex items-center gap-2">
            <FileText className="size-3.5 text-ink-mute" /> Vínculos de rastreabilidade
          </li>
        </ul>
      </div>
    </aside>
  );
}
