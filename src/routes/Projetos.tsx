import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bug,
  CheckCircle2,
  Clock,
  FlaskConical,
  FolderKanban,
  FolderPlus,
  Github,
  Inbox,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  ServerCrash,
  ShieldAlert,
  Shuffle,
  Sparkles,
  Trash2,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { ReportarErroModal } from "@/components/defeitos/ReportarErroModal";
import { NovoProjetoModal } from "@/components/projetos/NovoProjetoModal";
import { OrganizarDefeitosModal } from "@/components/projetos/OrganizarDefeitosModal";
import { useProjetos, useRemoverProjeto, useResumoProjetos } from "@/hooks/projetos";
import { severidadeMeta, type Severidade } from "@/lib/defeitos";
import {
  statusProjetoMeta,
  type MetricasProjeto,
  type Projeto,
  type ProjetoComMetricas,
} from "@/lib/projetos";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
 *  Meus projetos — todos os números vêm da API (defeitos e
 *  coleções reais). Nada aqui é dado de demonstração.
 * ────────────────────────────────────────────────────────────── */

const TODOS = "__todos__";

interface Kpi {
  label: string;
  icon: LucideIcon;
  value: number;
  accent: string;
  hint: string;
}

function kpisDe(m: MetricasProjeto): Kpi[] {
  return [
    {
      label: "Defeitos abertos",
      icon: Bug,
      value: m.defeitosAbertos,
      accent: "text-risk-high",
      hint: `${m.defeitosTotal} no total`,
    },
    {
      label: "Severidade alta ou crítica",
      icon: ShieldAlert,
      value: m.defeitosCriticos,
      accent: "text-risk-med",
      hint: "exigem atenção imediata",
    },
    {
      label: "Resolvidos",
      icon: CheckCircle2,
      value: m.defeitosResolvidos,
      accent: "text-risk-low",
      hint: m.defeitosTotal ? `${Math.round((m.defeitosResolvidos / m.defeitosTotal) * 100)}% do total` : "—",
    },
    {
      label: "Coleções de teste",
      icon: Workflow,
      value: m.colecoesTotal,
      accent: "text-info",
      hint: `${m.requestsTotal} requisições`,
    },
  ];
}

function formatQuando(iso: string | null) {
  if (!iso) return "sem defeitos";
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(iso));
}

/* ---------- Ações rápidas ---------- */

interface AcaoRapida {
  label: string;
  descricao: string;
  icon: LucideIcon;
  onClick: () => void;
  destaque?: boolean;
  disabled?: boolean;
}

function AcoesRapidas({ acoes }: { acoes: AcaoRapida[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {acoes.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={a.onClick}
          disabled={a.disabled}
          className={cn(
            "group flex items-start gap-3 rounded-tile border p-4 text-left transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30",
            "disabled:pointer-events-none disabled:opacity-50",
            a.destaque
              ? "border-brand-deep/40 bg-brand-soft/50 hover:border-brand-deep hover:bg-brand-soft"
              : "border-line bg-surface hover:border-ink/20 hover:bg-surface-2",
          )}
        >
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg transition-colors",
              a.destaque ? "bg-brand text-brand-ink" : "bg-surface-2 text-ink-soft group-hover:text-ink",
            )}
          >
            <a.icon className="size-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-semibold text-ink">{a.label}</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-ink-mute">{a.descricao}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Card de projeto ---------- */

function BarraSeveridade({ por }: { por: Partial<Record<Severidade, number>> }) {
  const ordem: Severidade[] = ["critica", "alta", "media", "baixa"];
  const total = ordem.reduce((s, k) => s + (por[k] ?? 0), 0);
  if (!total) return <p className="text-[12px] text-ink-mute">Nenhum defeito registrado.</p>;

  const cores: Record<Severidade, string> = {
    critica: "var(--color-risk-high)",
    alta: "var(--color-risk-high)",
    media: "var(--color-risk-med)",
    baixa: "var(--color-risk-low)",
  };

  return (
    <div className="space-y-2">
      {ordem
        .filter((k) => por[k])
        .map((k) => (
          <div key={k}>
            <div className="mb-1 flex items-center justify-between text-[11.5px]">
              <span className="text-ink-soft">{severidadeMeta[k].label}</span>
              <span className="font-mono text-ink-mute">{por[k]}</span>
            </div>
            <Progress value={((por[k] ?? 0) / total) * 100} color={cores[k]} height={6} />
          </div>
        ))}
    </div>
  );
}

interface CardProps {
  projeto: ProjetoComMetricas;
  selecionado: boolean;
  onSelecionar: () => void;
  onEditar: () => void;
  onRemover: () => void;
  onReportar: () => void;
}

function ProjetoCard({ projeto, selecionado, onSelecionar, onEditar, onRemover, onReportar }: CardProps) {
  const [menu, setMenu] = useState(false);
  const st = statusProjetoMeta[projeto.status];
  const m = projeto.metricas;

  return (
    <Card
      className={cn(
        "animate-rise flex flex-col p-5 transition-all duration-200",
        selecionado ? "border-brand-deep/60 ring-4 ring-brand/20" : "hover:border-ink/15",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink font-mono text-[12px] font-bold text-brand">
          {projeto.chave.slice(0, 3)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-bold text-ink">{projeto.nome}</h3>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold", st.badge)}>
              <span className={cn("size-1.5 rounded-full", st.dot)} />
              {st.label}
            </span>
          </div>
          <p className="mt-0.5 truncate font-mono text-[11.5px] text-ink-mute">
            {projeto.repo ? `${projeto.repo.owner}/${projeto.repo.repo}` : "sem repositório vinculado"}
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            onBlur={() => window.setTimeout(() => setMenu(false), 120)}
            className="grid size-8 place-items-center rounded-lg text-ink-mute transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Ações do projeto"
          >
            <MoreHorizontal className="size-[18px]" />
          </button>
          {menu && (
            <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-pop">
              <button
                type="button"
                onClick={onEditar}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Pencil className="size-3.5" />
                Editar projeto
              </button>
              <button
                type="button"
                onClick={onRemover}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-risk-high transition-colors hover:bg-risk-high-soft"
              >
                <Trash2 className="size-3.5" />
                Excluir projeto
              </button>
            </div>
          )}
        </div>
      </div>

      {projeto.descricao && (
        <p className="mt-3 line-clamp-2 text-[13px] text-ink-soft">{projeto.descricao}</p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "abertos", valor: m.defeitosAbertos, cor: "text-risk-high" },
          { label: "críticos", valor: m.defeitosCriticos, cor: "text-risk-med" },
          { label: "coleções", valor: m.colecoesTotal, cor: "text-info" },
        ].map((x) => (
          <div key={x.label} className="rounded-lg bg-surface-2 px-2 py-2 text-center">
            <div className={cn("font-display text-[20px] font-bold leading-none", x.cor)}>{x.valor}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-mute">{x.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex-1">
        <BarraSeveridade por={m.porSeveridade} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-mute">
          <Clock className="size-3" />
          {formatQuando(m.ultimoDefeitoEm)}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onReportar}
            className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Reportar defeito
          </button>
          <button
            type="button"
            onClick={onSelecionar}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors",
              selecionado ? "bg-brand text-brand-ink" : "bg-surface-2 text-ink-soft hover:text-ink",
            )}
          >
            {selecionado ? "Filtrando" : "Filtrar"}
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Tela ---------- */

export function Projetos() {
  const navigate = useNavigate();
  const projetos = useProjetos();
  const [filtro, setFiltro] = useState<string>(TODOS);
  const [modalProjeto, setModalProjeto] = useState<{ open: boolean; projeto: Projeto | null }>({
    open: false,
    projeto: null,
  });
  const [modalDefeito, setModalDefeito] = useState<{ open: boolean; projetoId: string | null }>({
    open: false,
    projetoId: null,
  });
  const [organizando, setOrganizando] = useState(false);

  const projetoId = filtro === TODOS ? null : filtro;
  const resumo = useResumoProjetos(projetoId);
  const remover = useRemoverProjeto();

  const lista = useMemo(() => projetos.data ?? [], [projetos.data]);
  const selecionado = lista.find((p) => p.id === projetoId) ?? null;

  const acoes: AcaoRapida[] = [
    {
      label: "Reportar defeito",
      descricao: selecionado ? `Já vinculado a ${selecionado.chave}` : "Escolha um projeto ao registrar",
      icon: Bug,
      destaque: true,
      onClick: () => setModalDefeito({ open: true, projetoId }),
    },
    {
      label: "Coleções de teste",
      descricao: "Importar e revisar fluxos do Postman",
      icon: Workflow,
      onClick: () => void navigate({ to: "/colecoes" }),
    },
    {
      label: "Ver defeitos",
      descricao: selecionado ? `Do projeto ${selecionado.chave}` : "Lista completa",
      icon: FlaskConical,
      onClick: () => void navigate({ to: "/defeitos" }),
    },
    {
      label: "Perguntar ao Hunter",
      descricao: "Análise de risco e sugestões de teste",
      icon: Sparkles,
      onClick: () => void navigate({ to: "/hunter" }),
    },
  ];

  async function excluir(p: ProjetoComMetricas) {
    const aviso =
      p.metricas.defeitosTotal > 0 || p.metricas.colecoesTotal > 0
        ? `\n\n${p.metricas.defeitosTotal} defeito(s) e ${p.metricas.colecoesTotal} coleção(ões) serão mantidos, mas ficarão sem projeto.`
        : "";
    if (!window.confirm(`Excluir o projeto "${p.nome}"?${aviso}`)) return;
    if (projetoId === p.id) setFiltro(TODOS);
    await remover.mutateAsync(p.id);
  }

  if (projetos.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-ink-mute">
        <Loader2 className="size-7 animate-spin" />
      </div>
    );
  }

  if (projetos.isError) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6">
        <div className="max-w-sm text-center text-ink-mute">
          <ServerCrash className="mx-auto size-9" />
          <p className="mt-3 text-[14px]">Não consegui carregar os projetos.</p>
          <Button className="mt-4" variant="outline" onClick={() => void projetos.refetch()}>
            Tentar de novo
          </Button>
        </div>
      </div>
    );
  }

  const metricas = resumo.data?.metricas;
  const semProjeto = resumo.data?.semProjeto ?? 0;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 sm:py-7">
      <div className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Meus projetos</h1>
          <p className="mt-1 text-[14px] text-ink-soft">
            {selecionado
              ? `Visão de qualidade do projeto ${selecionado.nome}.`
              : "Visão consolidada de todos os projetos de QA."}
          </p>
        </div>
        <Button variant="brand" onClick={() => setModalProjeto({ open: true, projeto: null })}>
          <Plus className="size-[18px]" />
          Novo projeto
        </Button>
      </div>

      {lista.length === 0 ? (
        <Card className="animate-rise grid place-items-center gap-3 px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-shell text-brand shadow-card">
            <FolderPlus className="size-8" strokeWidth={1.8} />
          </span>
          <h2 className="font-display text-[20px] font-bold text-ink">Nenhum projeto ainda</h2>
          <p className="max-w-sm text-[14px] text-ink-soft">
            Crie um projeto para agrupar os defeitos e as coleções de teste de cada produto que você acompanha.
          </p>
          <Button variant="brand" size="lg" onClick={() => setModalProjeto({ open: true, projeto: null })}>
            <Plus className="size-[18px]" />
            Criar o primeiro projeto
          </Button>
          {semProjeto > 0 && (
            <p className="text-[12.5px] text-ink-mute">
              Há {semProjeto} defeito(s) esperando para serem organizados.
            </p>
          )}
        </Card>
      ) : (
        <>
          {/* Filtro por projeto */}
          <div className="animate-rise flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-mute">
              Filtrar
            </span>
            <button
              type="button"
              onClick={() => setFiltro(TODOS)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                filtro === TODOS
                  ? "bg-ink text-surface"
                  : "border border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink",
              )}
            >
              Todos os projetos
            </button>
            {lista.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFiltro(p.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                  filtro === p.id
                    ? "bg-ink text-surface"
                    : "border border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink",
                )}
                title={p.nome}
              >
                <span className="font-mono text-[11px] opacity-70">{p.chave}</span>
                <span className="max-w-[140px] truncate">{p.nome}</span>
              </button>
            ))}
          </div>

          {/* KPIs do escopo filtrado */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(metricas ? kpisDe(metricas) : []).map((k, i) => (
              <Card key={k.label} className="animate-rise p-5" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink-soft">{k.label}</span>
                  <k.icon className={cn("size-[18px]", k.accent)} />
                </div>
                <div className="mt-4 font-display text-[34px] font-bold leading-none text-ink">
                  {resumo.isFetching ? "—" : k.value}
                </div>
                <span className="mt-3 inline-block rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[10.5px] text-ink-mute">
                  {k.hint}
                </span>
              </Card>
            ))}
          </div>

          {/* Ações rápidas */}
          <div className="animate-rise space-y-3">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
              <Sparkles className="size-4 text-brand-deep" />
              Ações rápidas
              {selecionado && (
                <span className="font-mono text-[11px] font-normal text-ink-mute">· {selecionado.chave}</span>
              )}
            </h2>
            <AcoesRapidas acoes={acoes} />
          </div>

          {/* Defeitos órfãos */}
          {semProjeto > 0 && (
            <Card className="animate-rise flex flex-wrap items-center gap-3 border-info/30 bg-info-soft/40 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-info/15 text-info">
                <Inbox className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-ink">
                  {semProjeto} defeito(s) sem projeto
                </div>
                <p className="text-[12.5px] text-ink-soft">
                  Registrados antes deste módulo — atribua a um projeto para entrarem nos filtros.
                </p>
              </div>
              <Button variant="outline" onClick={() => setOrganizando(true)}>
                <Shuffle className="size-4" />
                Organizar
              </Button>
            </Card>
          )}

          {/* Lista de projetos */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
              <FolderKanban className="size-4 text-ink-soft" />
              Projetos
              <span className="font-mono text-[11px] font-normal text-ink-mute">
                {lista.length} cadastrado(s)
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {lista.map((p) => (
                <ProjetoCard
                  key={p.id}
                  projeto={p}
                  selecionado={projetoId === p.id}
                  onSelecionar={() => setFiltro(projetoId === p.id ? TODOS : p.id)}
                  onEditar={() => setModalProjeto({ open: true, projeto: p })}
                  onRemover={() => void excluir(p)}
                  onReportar={() => setModalDefeito({ open: true, projetoId: p.id })}
                />
              ))}
            </div>
          </div>

          {/* Atalho para o repositório do projeto filtrado */}
          {selecionado?.repo && (
            <Card className="animate-rise flex flex-wrap items-center gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-brand">
                <Github className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[13.5px] font-semibold text-ink">
                  {selecionado.repo.owner}/{selecionado.repo.repo}
                </div>
                <p className="text-[12px] text-ink-mute">Repositório vinculado a {selecionado.chave}</p>
              </div>
              <a
                href={`https://github.com/${selecionado.repo.owner}/${selecionado.repo.repo}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-line px-3 py-2 text-[12.5px] font-semibold text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
              >
                Abrir no GitHub
              </a>
            </Card>
          )}
        </>
      )}

      <NovoProjetoModal
        open={modalProjeto.open}
        projeto={modalProjeto.projeto}
        onClose={() => setModalProjeto({ open: false, projeto: null })}
      />
      <ReportarErroModal
        open={modalDefeito.open}
        projetoId={modalDefeito.projetoId}
        onClose={() => setModalDefeito({ open: false, projetoId: null })}
      />
      <OrganizarDefeitosModal
        open={organizando}
        projetoIdPadrao={projetoId}
        onClose={() => setOrganizando(false)}
      />
    </div>
  );
}
