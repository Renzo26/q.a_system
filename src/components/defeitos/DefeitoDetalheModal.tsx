import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Bug,
  FlaskConical,
  Play,
  GitPullRequest,
  User,
  CalendarClock,
  Clock,
  Trash2,
  FileText,
  Braces,
  Paperclip,
  Maximize2,
  AlertCircle,
  ListChecks,
  Target,
  CircleDot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/Risk";
import { useAtualizarStatus, useRemoverDefeito } from "@/hooks/defeitos";
import { cn } from "@/lib/utils";
import {
  formatBytes,
  formatData,
  prioridadeMeta,
  severidadeMeta,
  statusMeta,
  statusOrdem,
  type Defeito,
  type Evidencia,
  type StatusDefeito,
} from "@/lib/defeitos";

const tipoIcon: Record<Exclude<Evidencia["tipo"], "imagem" | "video">, LucideIcon> = {
  log: FileText,
  request_response: Braces,
  arquivo: Paperclip,
};

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
        <Icon className="size-3.5" />
        {title}
      </div>
      {children}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-soft ring-1 ring-line">
      {children}
    </span>
  );
}

function VinculoChip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11.5px] text-ink-soft ring-1 ring-line">
      <Icon className="size-3" />
      {children}
    </span>
  );
}

function EvidenceView({ ev }: { ev: Evidencia }) {
  if (ev.tipo === "imagem") {
    return (
      <a
        href={ev.url}
        target="_blank"
        rel="noreferrer"
        title={`Abrir ${ev.nome}`}
        className="group relative block overflow-hidden rounded-tile border border-line bg-surface-2"
      >
        <img src={ev.url} alt={ev.nome} className="h-32 w-full object-cover" />
        <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-lg bg-ink/70 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3.5" />
        </span>
        <span className="block truncate px-2 py-1.5 font-mono text-[10.5px] text-ink-soft">{ev.nome}</span>
      </a>
    );
  }
  if (ev.tipo === "video") {
    return (
      <div className="overflow-hidden rounded-tile border border-line bg-surface-2">
        <video src={ev.url} controls className="h-32 w-full bg-black object-contain" />
        <span className="block truncate px-2 py-1.5 font-mono text-[10.5px] text-ink-soft">{ev.nome}</span>
      </div>
    );
  }
  const Icon = tipoIcon[ev.tipo];
  return (
    <a
      href={ev.url}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center justify-center gap-2 rounded-tile border border-line bg-surface-2 p-4 text-ink-mute transition-colors hover:border-ink/25 hover:text-ink"
    >
      <Icon className="size-7" strokeWidth={1.6} />
      <span className="w-full truncate text-center font-mono text-[10.5px]">{ev.nome}</span>
      <span className="font-mono text-[10px]">{formatBytes(ev.tamanhoBytes)}</span>
    </a>
  );
}

interface Props {
  defeito: Defeito | null;
  onClose: () => void;
}

export function DefeitoDetalheModal({ defeito, onClose }: Props) {
  const atualizar = useAtualizarStatus();
  const remover = useRemoverDefeito();
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    if (!defeito) return;
    setConfirmar(false);
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
  }, [defeito, onClose]);

  if (!defeito || typeof document === "undefined") return null;

  const sev = severidadeMeta[defeito.severidade];
  const st = statusMeta[defeito.status];
  const { vinculo } = defeito;
  const temVinculo = vinculo.casoDeTesteId || vinculo.execucaoId || vinculo.pullRequest;

  async function excluir() {
    if (!defeito) return;
    await remover.mutateAsync(defeito.id);
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-rise flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-line bg-surface shadow-pop">
        {/* Cabeçalho */}
        <header className="flex shrink-0 items-start gap-3 border-b border-line px-5 py-4">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-risk-high-soft text-risk-high">
            <Bug className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] font-semibold text-ink-mute">{defeito.codigo}</span>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold", st.badge)}>
                <span className={cn("size-1.5 rounded-full", st.dot)} />
                {st.label}
              </span>
            </div>
            <h2 className="mt-1 text-[17px] font-bold leading-tight text-ink">{defeito.titulo}</h2>
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

        {/* Corpo */}
        <div className="scroll-slim min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge level={sev.level} label={`Severidade: ${sev.label}`} />
            <Chip>Prioridade: {prioridadeMeta[defeito.prioridade].label}</Chip>
            <Chip>
              <CircleDot className="size-3" />
              {defeito.ambiente}
            </Chip>
          </div>

          <Section icon={AlertCircle} title="Descrição">
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{defeito.descricao}</p>
          </Section>

          <Section icon={ListChecks} title="Passos para reprodução">
            <p className="whitespace-pre-line rounded-tile border border-line bg-surface-2/50 p-3 text-[13.5px] leading-relaxed text-ink">
              {defeito.passosReproducao}
            </p>
          </Section>

          <div className="grid gap-4 sm:grid-cols-2">
            <Section icon={Target} title="Resultado esperado">
              <p className="whitespace-pre-line rounded-tile border border-risk-low/25 bg-risk-low-soft/60 p-3 text-[13.5px] leading-relaxed text-ink">
                {defeito.resultadoEsperado}
              </p>
            </Section>
            <Section icon={AlertCircle} title="Resultado obtido">
              <p className="whitespace-pre-line rounded-tile border border-risk-high/25 bg-risk-high-soft/60 p-3 text-[13.5px] leading-relaxed text-ink">
                {defeito.resultadoObtido}
              </p>
            </Section>
          </div>

          {temVinculo && (
            <Section icon={FlaskConical} title="Rastreabilidade">
              <div className="flex flex-wrap items-center gap-1.5">
                {vinculo.casoDeTesteId && <VinculoChip icon={FlaskConical}>{vinculo.casoDeTesteId}</VinculoChip>}
                {vinculo.execucaoId && <VinculoChip icon={Play}>{vinculo.execucaoId}</VinculoChip>}
                {vinculo.pullRequest && <VinculoChip icon={GitPullRequest}>{vinculo.pullRequest}</VinculoChip>}
              </div>
            </Section>
          )}

          {defeito.evidencias.length > 0 && (
            <Section icon={Paperclip} title={`Evidências (${defeito.evidencias.length})`}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {defeito.evidencias.map((ev) => (
                  <EvidenceView key={ev.id} ev={ev} />
                ))}
              </div>
            </Section>
          )}

          {/* Metadados */}
          <div className="grid grid-cols-1 gap-2 border-t border-line-soft pt-4 text-[12.5px] text-ink-soft sm:grid-cols-2">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-ink-mute" />
              Responsável: <span className="font-medium text-ink">{defeito.responsavel}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-ink-mute" />
              Reportado por: <span className="font-medium text-ink">{defeito.criadoPor}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-3.5 text-ink-mute" />
              Criado: <span className="font-medium text-ink">{formatData(defeito.criadoEm)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-ink-mute" />
              Atualizado: <span className="font-medium text-ink">{formatData(defeito.atualizadoEm)}</span>
            </span>
          </div>
        </div>

        {/* Rodapé: status + excluir */}
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2/60 px-5 py-3.5">
          <label className="flex items-center gap-2 text-[12.5px] text-ink-soft">
            Status
            <select
              value={defeito.status}
              disabled={atualizar.isPending}
              onChange={(e) => atualizar.mutate({ id: defeito.id, status: e.target.value as StatusDefeito })}
              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] font-medium text-ink outline-none transition-colors focus:border-ink/30 disabled:opacity-60"
            >
              {statusOrdem.map((s) => (
                <option key={s} value={s}>
                  {statusMeta[s].label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2">
            {confirmar ? (
              <>
                <span className="text-[12.5px] text-ink-soft">Excluir mesmo?</span>
                <Button variant="outline" onClick={() => setConfirmar(false)}>
                  Não
                </Button>
                <Button
                  variant="primary"
                  loading={remover.isPending}
                  onClick={excluir}
                  className="!bg-risk-high hover:!bg-risk-high/90"
                >
                  Sim, excluir
                </Button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmar(true)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-ink-mute transition-colors hover:bg-risk-high-soft hover:text-risk-high"
              >
                <Trash2 className="size-4" />
                Excluir
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
