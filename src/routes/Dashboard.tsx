import { Link, useNavigate } from "@tanstack/react-router";
import {
  Github,
  ArrowRight,
  Gauge,
  ShieldCheck,
  GitPullRequest,
  ShieldAlert,
  GitBranch,
  CircleDot,
  Sparkles,
  Plug,
  TrendingUp,
  TrendingDown,
  Bug,
  FlaskConical,
  Clock,
  Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScoreRing, RiskBadge } from "@/components/ui/Risk";
import { CoverageBar, Progress } from "@/components/ui/Progress";
import { useAuth } from "@/lib/auth";
import { useRepoInfo } from "@/hooks/github";
import { riskFromScore, type RiskLevel } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
 *  Dados de demonstração (mock) — substituídos pela análise real
 *  do Hunter na próxima etapa.
 * ────────────────────────────────────────────────────────────── */

const RISK_SCORE = 72;

interface Kpi {
  label: string;
  icon: LucideIcon;
  value: string;
  accent: string;
  hint: string;
  delta: string;
  deltaGood: boolean;
}

const kpis: Kpi[] = [
  { label: "Score de risco", icon: Gauge, value: "72", accent: "text-risk-med", hint: "Risco médio", delta: "-6 na semana", deltaGood: true },
  { label: "Cobertura de testes", icon: ShieldCheck, value: "84%", accent: "text-risk-low", hint: "Meta: 90%", delta: "+3% na semana", deltaGood: true },
  { label: "Pull requests abertos", icon: GitPullRequest, value: "5", accent: "text-info", hint: "2 aguardando review", delta: "+2 hoje", deltaGood: false },
  { label: "Problemas críticos", icon: ShieldAlert, value: "3", accent: "text-risk-high", hint: "1 novo hoje", delta: "+1 hoje", deltaGood: false },
];

const severidades: { label: string; valor: number; cor: string }[] = [
  { label: "Crítica", valor: 3, cor: "var(--color-risk-high)" },
  { label: "Alta", valor: 7, cor: "var(--color-risk-high)" },
  { label: "Média", valor: 12, cor: "var(--color-risk-med)" },
  { label: "Baixa", valor: 9, cor: "var(--color-risk-low)" },
];
const totalDefeitos = severidades.reduce((s, d) => s + d.valor, 0);

const modulos: { nome: string; cobertura: number }[] = [
  { nome: "Autenticação", cobertura: 92 },
  { nome: "Contratos", cobertura: 78 },
  { nome: "Fornecedores", cobertura: 85 },
  { nome: "Cálculo de Ponto de Função", cobertura: 88 },
  { nome: "Relatórios", cobertura: 61 },
];

interface PrMock {
  numero: number;
  titulo: string;
  autor: string;
  quando: string;
  risco: RiskLevel;
}

const pullRequests: PrMock[] = [
  { numero: 142, titulo: "Corrige cálculo de PF na auditoria SEFAZ", autor: "renzo", quando: "há 2h", risco: "high" },
  { numero: 139, titulo: "Adiciona filtro por fornecedor no portal", autor: "bia.qa", quando: "há 6h", risco: "med" },
  { numero: 137, titulo: "Ajusta layout do modal de contratos", autor: "renzo", quando: "ontem", risco: "low" },
  { numero: 134, titulo: "Refatora serviço de importação de planilhas", autor: "dev.arthur", quando: "há 2 dias", risco: "med" },
];

const sugestoes: string[] = [
  "Cobrir o cenário de planilha SFP incompleta na importação de PF.",
  "Adicionar teste de regressão para o desconto de cupom no fluxo de contratos.",
  "Validar o retorno da API de fornecedores quando o CNPJ é inválido.",
];

/* ────────────────────────────────────────────────────────────── */

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="animate-rise max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-shell text-brand shadow-card">
          <Plug className="size-8" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 font-display text-[24px] font-bold tracking-tight text-ink">
          Nenhum repositório conectado
        </h1>
        <p className="mt-2 text-[14.5px] text-ink-soft">
          Conecte um repositório do GitHub para o Hunter Q.A começar a analisar riscos, sugerir testes e avaliar releases.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="brand" size="lg" onClick={() => navigate({ to: "/conectar" })}>
            <Github className="size-[18px]" />
            Conectar repositório
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { repo } = useAuth();
  const { data: info } = useRepoInfo(repo?.owner, repo?.repo);

  if (!repo) return <EmptyState />;

  const nivelRisco = riskFromScore(RISK_SCORE);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 sm:py-7">
      <div className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Dashboard de qualidade</h1>
          <p className="mt-1 text-[14px] text-ink-soft">
            Visão geral do repositório conectado e da análise do Hunter Q.A.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 font-mono text-[11px] text-ink-mute">
          <Sparkles className="size-3.5 text-brand-deep" />
          dados de demonstração
        </span>
      </div>

      {/* Banner do repositório */}
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-brand">
          <Github className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[15px] font-semibold text-ink">
            {repo.owner}/{repo.repo}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11.5px] text-ink-mute">
            <span className="flex items-center gap-1">
              <GitBranch className="size-3.5" />
              {info?.defaultBranch ?? "—"}
            </span>
            {info?.linguagens?.length ? (
              <span className="flex items-center gap-1.5">
                {info.linguagens.slice(0, 4).map((l) => (
                  <span key={l} className="inline-flex items-center gap-1">
                    <CircleDot className="size-3 text-brand-deep" />
                    {l}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        </div>
        <Link
          to="/conectar"
          className="rounded-lg border border-line px-3 py-2 text-[12.5px] font-semibold text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
        >
          Trocar
        </Link>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <Card key={k.label} className="animate-rise p-5" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-ink-soft">{k.label}</span>
              <k.icon className={`size-[18px] ${k.accent}`} />
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-[34px] font-bold leading-none text-ink">{k.value}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[10.5px] text-ink-mute">
                {k.hint}
              </span>
              <span
                className={`inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold ${
                  k.deltaGood ? "text-risk-low" : "text-risk-high"
                }`}
              >
                {k.deltaGood ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                {k.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Score de risco */}
        <Card className="animate-rise flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="text-[13px] font-semibold text-ink-soft">Score de risco do repositório</span>
          <ScoreRing score={RISK_SCORE} level={nivelRisco} size={120} />
          <RiskBadge level={nivelRisco} />
          <p className="text-[12px] leading-relaxed text-ink-mute">
            Combinação de complexidade, cobertura de testes e histórico de defeitos.
          </p>
        </Card>

        {/* Defeitos por severidade */}
        <Card className="animate-rise p-5 lg:col-span-2" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
              <Bug className="size-4 text-risk-high" />
              Defeitos por severidade
            </h2>
            <span className="font-mono text-[12px] text-ink-mute">{totalDefeitos} no total</span>
          </div>
          <div className="mt-5 space-y-4">
            {severidades.map((s) => (
              <div key={s.label}>
                <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-ink-soft">{s.label}</span>
                  <span className="font-mono text-ink-mute">{s.valor}</span>
                </div>
                <Progress value={(s.valor / totalDefeitos) * 100} color={s.cor} height={8} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Cobertura por módulo */}
        <Card className="animate-rise p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
            <FlaskConical className="size-4 text-info" />
            Cobertura de testes por módulo
          </h2>
          <div className="mt-5 space-y-4">
            {modulos.map((m) => (
              <div key={m.nome}>
                <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-ink-soft">{m.nome}</span>
                  <span className="font-mono text-ink-mute">{m.cobertura}%</span>
                </div>
                <CoverageBar value={m.cobertura} />
              </div>
            ))}
          </div>
        </Card>

        {/* Pull requests recentes */}
        <Card className="animate-rise p-5" style={{ animationDelay: "80ms" }}>
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
            <GitPullRequest className="size-4 text-brand-deep" />
            Pull requests recentes
          </h2>
          <ul className="mt-4 divide-y divide-line-soft">
            {pullRequests.map((pr) => (
              <li key={pr.numero} className="flex items-center gap-3 py-3">
                <span className="font-mono text-[12px] text-ink-mute">#{pr.numero}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink">{pr.titulo}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-ink-mute">
                    <span>@{pr.autor}</span>
                    <span>·</span>
                    <Clock className="size-3" />
                    <span>{pr.quando}</span>
                  </div>
                </div>
                <RiskBadge level={pr.risco} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Testes sugeridos pelo Hunter */}
      <Card className="grain relative animate-rise overflow-hidden bg-shell p-6 text-shell-ink">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(320px 220px at 94% -10%, rgba(228,242,74,0.14), transparent 66%)" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand/15 text-brand">
              <Lightbulb className="size-5" />
            </span>
            <div>
              <div className="font-display text-[15px] font-bold text-shell-ink">Testes sugeridos pelo Hunter Q.A</div>
              <p className="text-[12px] text-shell-soft">Cenários prioritários com base no risco e na cobertura atual.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {sugestoes.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-[13px] text-shell-soft">
                <CircleDot className="mt-0.5 size-3.5 shrink-0 text-brand" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
