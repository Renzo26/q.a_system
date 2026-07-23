import { useMemo, useState } from "react";
import {
  Bug,
  Plus,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Play,
  GitPullRequest,
  FileVideo,
  FileText,
  Braces,
  Paperclip,
  Inbox,
  Loader2,
  ServerCrash,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/Risk";
import { ReportarErroModal } from "@/components/defeitos/ReportarErroModal";
import { DefeitoDetalheModal } from "@/components/defeitos/DefeitoDetalheModal";
import { useAtualizarStatus, useDefeitos } from "@/hooks/defeitos";
import { cn } from "@/lib/utils";
import {
  formatData,
  severidadeMeta,
  statusMeta,
  statusOrdem,
  type Defeito,
  type Evidencia,
  type StatusDefeito,
} from "@/lib/defeitos";

const evidenciaIcon: Record<Exclude<Evidencia["tipo"], "imagem">, LucideIcon> = {
  video: FileVideo,
  log: FileText,
  request_response: Braces,
  arquivo: Paperclip,
};

function EvidenciaThumb({ ev }: { ev: Evidencia }) {
  if (ev.tipo === "imagem") {
    return (
      <img
        src={ev.url}
        alt={ev.nome}
        title={ev.nome}
        className="size-11 shrink-0 rounded-lg border border-line object-cover"
      />
    );
  }
  const Icon = evidenciaIcon[ev.tipo];
  return (
    <span
      title={ev.nome}
      className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-ink-mute"
    >
      <Icon className="size-5" strokeWidth={1.7} />
    </span>
  );
}

function VinculoChip({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-ink-soft ring-1 ring-line">
      <Icon className="size-3" />
      {children}
    </span>
  );
}

function DefeitoCard({ defeito, onOpen }: { defeito: Defeito; onOpen: () => void }) {
  const sev = severidadeMeta[defeito.severidade];
  const st = statusMeta[defeito.status];
  const { vinculo } = defeito;
  const atualizar = useAtualizarStatus();

  return (
    <Card interactive onClick={onOpen} className="animate-rise cursor-pointer p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] font-semibold text-ink-mute">{defeito.codigo}</span>
        <RiskBadge level={sev.level} label={sev.label} />
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            st.badge,
          )}
        >
          <span className={cn("size-1.5 rounded-full", st.dot)} />
          {st.label}
        </span>
        <span className="ml-auto font-mono text-[11px] text-ink-mute">{formatData(defeito.criadoEm)}</span>
      </div>

      <h3 className="mt-2.5 text-[15px] font-semibold text-ink">{defeito.titulo}</h3>
      <p className="mt-1 line-clamp-2 text-[13px] text-ink-soft">{defeito.descricao}</p>

      {(vinculo.casoDeTesteId || vinculo.execucaoId || vinculo.pullRequest) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {vinculo.casoDeTesteId && <VinculoChip icon={FlaskConical}>{vinculo.casoDeTesteId}</VinculoChip>}
          {vinculo.execucaoId && <VinculoChip icon={Play}>{vinculo.execucaoId}</VinculoChip>}
          {vinculo.pullRequest && <VinculoChip icon={GitPullRequest}>{vinculo.pullRequest}</VinculoChip>}
        </div>
      )}

      {defeito.evidencias.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {defeito.evidencias.map((ev) => (
            <EvidenciaThumb key={ev.id} ev={ev} />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-3">
        <span className="text-[12px] text-ink-mute">
          Responsável: <span className="font-medium text-ink-soft">{defeito.responsavel}</span>
        </span>
        <label
          className="flex items-center gap-1.5 text-[11.5px] text-ink-mute"
          onClick={(e) => e.stopPropagation()}
        >
          {atualizar.isPending && <Loader2 className="size-3.5 animate-spin" />}
          Status
          <select
            value={defeito.status}
            disabled={atualizar.isPending}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => atualizar.mutate({ id: defeito.id, status: e.target.value as StatusDefeito })}
            className="rounded-lg border border-line bg-surface px-2 py-1 text-[12px] font-medium text-ink outline-none transition-colors focus:border-ink/30 disabled:opacity-60"
          >
            {statusOrdem.map((s) => (
              <option key={s} value={s}>
                {statusMeta[s].label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  );
}

const filtros: { key: StatusDefeito | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "aberto", label: "Abertos" },
  { key: "em_analise", label: "Em análise" },
  { key: "em_correcao", label: "Em correção" },
  { key: "pronto_reteste", label: "Reteste" },
  { key: "resolvido", label: "Resolvidos" },
];

export function Defeitos() {
  const { data: defeitos = [], isLoading, isError, error } = useDefeitos();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<StatusDefeito | "todos">("todos");

  const selecionado = defeitos.find((d) => d.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const abertos = defeitos.filter((d) =>
      ["aberto", "em_analise", "em_correcao", "reaberto"].includes(d.status),
    ).length;
    const criticos = defeitos.filter(
      (d) =>
        (d.severidade === "critica" || d.severidade === "alta") &&
        d.status !== "resolvido" &&
        d.status !== "cancelado",
    ).length;
    const resolvidos = defeitos.filter((d) => d.status === "resolvido").length;
    return { total: defeitos.length, abertos, criticos, resolvidos };
  }, [defeitos]);

  const visiveis = useMemo(
    () => (filtro === "todos" ? defeitos : defeitos.filter((d) => d.status === filtro)),
    [defeitos, filtro],
  );

  const kpis: { label: string; valor: number; icon: LucideIcon; accent: string }[] = [
    { label: "Total", valor: stats.total, icon: Bug, accent: "text-ink-soft" },
    { label: "Em aberto", valor: stats.abertos, icon: Inbox, accent: "text-info" },
    { label: "Críticos/altos", valor: stats.criticos, icon: AlertTriangle, accent: "text-risk-high" },
    { label: "Resolvidos", valor: stats.resolvidos, icon: CheckCircle2, accent: "text-risk-low" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 sm:py-7">
      <div className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Defeitos</h1>
          <p className="mt-1 text-[14px] text-ink-soft">
            Registre erros encontrados nos testes, vincule-os aos casos e anexe as evidências.
          </p>
        </div>
        <Button variant="brand" size="lg" onClick={() => setModalOpen(true)}>
          <Plus className="size-[18px]" />
          Reportar erro
        </Button>
      </div>

      {isError ? (
        <Card className="grid place-items-center px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-risk-high-soft text-risk-high">
            <ServerCrash className="size-7" strokeWidth={1.7} />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">Não foi possível carregar os defeitos</p>
          <p className="mt-1 max-w-md text-[13px] text-ink-soft">
            {error instanceof Error ? error.message : "Erro desconhecido"} — verifique se o backend está no ar em
            localhost:8080.
          </p>
        </Card>
      ) : isLoading ? (
        <div className="grid place-items-center py-24 text-ink-mute">
          <Loader2 className="size-7 animate-spin" />
          <p className="mt-3 text-[13px]">Carregando defeitos…</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {kpis.map((k, i) => (
              <Card key={k.label} className="animate-rise p-5" style={{ animationDelay: `${i * 55}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink-soft">{k.label}</span>
                  <k.icon className={cn("size-[18px]", k.accent)} />
                </div>
                <div className="mt-3 font-display text-[32px] font-bold leading-none text-ink nums">{k.valor}</div>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filtros.map((f) => {
              const ativo = filtro === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFiltro(f.key)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                    ativo
                      ? "border-ink bg-ink text-surface"
                      : "border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {visiveis.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {visiveis.map((d) => (
                <DefeitoCard key={d.id} defeito={d} onOpen={() => setSelectedId(d.id)} />
              ))}
            </div>
          ) : (
            <Card className="grid place-items-center px-6 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-ink-mute">
                <Inbox className="size-7" strokeWidth={1.7} />
              </span>
              <p className="mt-4 text-[15px] font-semibold text-ink">Nenhum defeito neste filtro</p>
              <p className="mt-1 text-[13px] text-ink-soft">
                {filtro === "todos"
                  ? "Reporte o primeiro erro encontrado nos testes."
                  : "Troque o filtro ou reporte um novo erro."}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setModalOpen(true)}>
                <Plus className="size-4" />
                Reportar erro
              </Button>
            </Card>
          )}
        </>
      )}

      <ReportarErroModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <DefeitoDetalheModal defeito={selecionado} onClose={() => setSelectedId(null)} />
    </div>
  );
}
