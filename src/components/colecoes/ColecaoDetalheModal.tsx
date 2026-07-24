import { useEffect } from "react";
import {
  X,
  Workflow,
  FolderClosed,
  CheckCircle2,
  Loader2,
  Braces,
  ServerCrash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { metodoBadge, type Passo } from "@/lib/colecoes";
import { useColecao } from "@/hooks/colecoes";

function PassoItem({ passo, ultimo }: { passo: Passo; ultimo: boolean }) {
  return (
    <div className="relative flex gap-3">
      {/* Trilho: número + linha */}
      <div className="flex flex-col items-center">
        <span className="nums grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-bold text-surface">
          {passo.ordem}
        </span>
        {!ultimo && <span className="my-1 w-px flex-1 bg-line" />}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold uppercase",
              metodoBadge(passo.metodo),
            )}
          >
            {passo.metodo}
          </span>
          <span className="text-[14.5px] font-semibold text-ink">{passo.nome}</span>
        </div>

        {passo.url && (
          <div className="mt-1 break-all font-mono text-[12px] text-ink-mute">{passo.url}</div>
        )}

        {passo.descricao && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{passo.descricao}</p>
        )}

        {passo.checks.length > 0 && (
          <div className="mt-2.5 rounded-tile border border-line bg-surface-2/50 p-2.5">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
              Verifica
            </div>
            <ul className="space-y-1">
              {passo.checks.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[13px] text-ink">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-risk-low" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {passo.bodyResumo && (
          <pre className="scroll-slim mt-2 max-h-32 overflow-auto rounded-tile border border-line bg-surface-2/50 p-2.5 font-mono text-[11.5px] leading-relaxed text-ink-soft">
            {passo.bodyResumo}
          </pre>
        )}
      </div>
    </div>
  );
}

interface Props {
  colecaoId: string | null;
  onClose: () => void;
}

export function ColecaoDetalheModal({ colecaoId, onClose }: Props) {
  const { data, isLoading, isError } = useColecao(colecaoId);

  useEffect(() => {
    if (!colecaoId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [colecaoId, onClose]);

  if (!colecaoId) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-rise flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-line bg-surface shadow-pop">
        <header className="flex shrink-0 items-start gap-3 border-b border-line px-5 py-4">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-deep">
            <Workflow className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold leading-tight text-ink">{data?.nome ?? "Coleção"}</h2>
            {data?.descricao && <p className="mt-0.5 text-[13px] text-ink-soft">{data.descricao}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-mute transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto p-5">
          {isError ? (
            <div className="grid place-items-center py-16 text-center text-ink-mute">
              <ServerCrash className="size-7 text-risk-high" />
              <p className="mt-3 text-[13px]">Não foi possível carregar a coleção.</p>
            </div>
          ) : isLoading || !data ? (
            <div className="grid place-items-center py-16 text-ink-mute">
              <Loader2 className="size-6 animate-spin" />
              <p className="mt-3 text-[13px]">Carregando fluxo…</p>
            </div>
          ) : (
            <>
              {/* Resumo + variáveis */}
              <div className="mb-5 flex flex-wrap items-center gap-2 text-[12px]">
                <span className="rounded-full bg-surface-2 px-2.5 py-1 font-medium text-ink-soft ring-1 ring-line">
                  {data.totalRequests} requisições
                </span>
                <span className="rounded-full bg-surface-2 px-2.5 py-1 font-medium text-ink-soft ring-1 ring-line">
                  {data.totalPastas} pastas
                </span>
                {data.variaveis.map((v) => (
                  <span
                    key={v.chave}
                    className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-ink-mute ring-1 ring-line"
                  >
                    <Braces className="size-3" />
                    {`{{${v.chave}}}`}
                  </span>
                ))}
              </div>

              {/* Fluxo */}
              {data.passos.map((passo, i) => {
                const pastaAnterior = i > 0 ? data.passos[i - 1].pasta : null;
                const mostrarPasta = passo.pasta && passo.pasta !== pastaAnterior;
                return (
                  <div key={passo.ordem}>
                    {mostrarPasta && (
                      <div className="mb-2 mt-1 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-mute">
                        <FolderClosed className="size-3.5" />
                        {passo.pasta}
                      </div>
                    )}
                    <PassoItem passo={passo} ultimo={i === data.passos.length - 1} />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
