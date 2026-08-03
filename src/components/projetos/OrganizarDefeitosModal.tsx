import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Inbox, Loader2, ServerCrash, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/Risk";
import { useDefeitos } from "@/hooks/defeitos";
import { useAtribuirProjeto, useProjetos } from "@/hooks/projetos";
import { formatData, severidadeMeta } from "@/lib/defeitos";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Projeto pré-selecionado como destino. */
  projetoIdPadrao?: string | null;
}

/** Atribui em lote os defeitos que ainda não pertencem a nenhum projeto. */
export function OrganizarDefeitosModal({ open, onClose, projetoIdPadrao }: Props) {
  const defeitos = useDefeitos();
  const projetos = useProjetos();
  const atribuir = useAtribuirProjeto();

  const [destino, setDestino] = useState<string>("");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState<string | null>(null);

  const semProjeto = (defeitos.data ?? []).filter((d) => !d.projetoId);

  useEffect(() => {
    if (!open) return;
    setErro(null);
    setSelecionados(new Set());
    setDestino(projetoIdPadrao ?? "");
  }, [open, projetoIdPadrao]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function alternar(id: string) {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  function alternarTodos() {
    setSelecionados((atual) =>
      atual.size === semProjeto.length ? new Set() : new Set(semProjeto.map((d) => d.id)),
    );
  }

  async function mover() {
    if (!destino || !selecionados.size) return;
    setErro(null);
    try {
      for (const defeitoId of selecionados) {
        await atribuir.mutateAsync({ defeitoId, projetoId: destino });
      }
      setSelecionados(new Set());
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao mover os defeitos");
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-rise flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-line bg-surface shadow-pop">
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-info-soft text-info">
            <Shuffle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-ink">Organizar defeitos</h2>
            <p className="text-[12.5px] text-ink-soft">
              Defeitos registrados antes dos projetos ainda não têm dono. Escolha o destino.
            </p>
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

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line bg-surface-2 px-5 py-3">
          <select
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-[13.5px] text-ink outline-none focus:border-ink/30 focus:ring-4 focus:ring-brand/25"
          >
            <option value="">Mover para…</option>
            {(projetos.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.chave} · {p.nome}
              </option>
            ))}
          </select>
          <Button variant="brand" onClick={mover} disabled={!destino || !selecionados.size} loading={atribuir.isPending}>
            Mover {selecionados.size || ""}
          </Button>
          {semProjeto.length > 0 && (
            <button
              type="button"
              onClick={alternarTodos}
              className="ml-auto text-[12.5px] font-semibold text-ink-soft underline-offset-2 hover:text-ink hover:underline"
            >
              {selecionados.size === semProjeto.length ? "Limpar seleção" : "Selecionar todos"}
            </button>
          )}
        </div>

        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto p-5">
          {defeitos.isLoading ? (
            <div className="grid place-items-center py-12 text-ink-mute">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : defeitos.isError ? (
            <div className="grid place-items-center gap-2 py-12 text-center text-ink-mute">
              <ServerCrash className="size-7" />
              <p className="text-[13px]">Não consegui carregar os defeitos.</p>
            </div>
          ) : semProjeto.length === 0 ? (
            <div className="grid place-items-center gap-2 py-12 text-center text-ink-mute">
              <Inbox className="size-7" />
              <p className="text-[13px]">Todos os defeitos já estão em um projeto.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {semProjeto.map((d) => {
                const sev = severidadeMeta[d.severidade];
                const marcado = selecionados.has(d.id);
                return (
                  <li key={d.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                        marcado ? "border-brand-deep/50 bg-brand-soft/40" : "border-line hover:bg-surface-2"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => alternar(d.id)}
                        className="size-4 accent-brand-deep"
                      />
                      <span className="font-mono text-[12px] font-semibold text-ink-mute">{d.codigo}</span>
                      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink">{d.titulo}</span>
                      <RiskBadge level={sev.level} label={sev.label} />
                      <span className="hidden font-mono text-[11px] text-ink-mute sm:inline">
                        {formatData(d.criadoEm)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {erro && (
            <p className="mt-4 rounded-xl bg-risk-high-soft px-3 py-2.5 text-[13px] font-medium text-risk-high">
              {erro}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
