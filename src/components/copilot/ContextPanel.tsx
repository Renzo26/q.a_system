import { Github, GitPullRequest, GitBranch, FlaskConical, ShieldCheck, FileDiff, History, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { detectRepo } from "@/lib/repoMeta";
import { quickActions } from "@/lib/copilotEngine";
import { CoverageBar } from "@/components/ui/Progress";

export function ContextPanel({ onAction }: { onAction: (prompt: string) => void }) {
  const { repo } = useAuth();
  const meta = repo ? detectRepo(repo.owner, repo.repo) : null;

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-surface-2/40 p-4 xl:flex">
      <div>
        <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          Contexto do agente
        </div>
        <div className="rounded-tile border border-line bg-surface p-3">
          <div className="flex items-center gap-2">
            <Github className="size-4 text-ink-soft" />
            <span className="truncate font-mono text-[12.5px] font-semibold text-ink">
              {repo ? `${repo.owner}/${repo.repo}` : "sem repositório"}
            </span>
          </div>
          {meta && (
            <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-ink-mute">
              <GitBranch className="size-3" />
              {meta.defaultBranch}
              <span className="mx-1">·</span>
              <FlaskConical className="size-3" />
              {meta.testFramework}
            </div>
          )}
        </div>
      </div>

      {/* PR em foco */}
      <div className="rounded-tile border border-line bg-surface p-3">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
          <GitPullRequest className="size-3.5" />
          PR em foco
        </div>
        <div className="font-mono text-[12.5px] font-semibold text-ink">#482</div>
        <div className="mt-0.5 text-[12px] text-ink-soft">Refatora fluxo de refresh token</div>
        <div className="mt-2.5">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="text-ink-mute">cobertura core/auth</span>
            <span className="nums font-semibold text-ink">61%</span>
          </div>
          <CoverageBar value={61} />
        </div>
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

      {/* O que o Copilot enxerga */}
      <div className="mt-auto rounded-tile border border-dashed border-line p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">O Argus enxerga</div>
        <ul className="space-y-1.5 text-[12px] text-ink-soft">
          <li className="flex items-center gap-2">
            <FileDiff className="size-3.5 text-ink-mute" /> Diff e arquivos do PR
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-ink-mute" /> Cobertura e suíte de testes
          </li>
          <li className="flex items-center gap-2">
            <History className="size-3.5 text-ink-mute" /> Histórico de incidentes
          </li>
        </ul>
      </div>
    </aside>
  );
}
