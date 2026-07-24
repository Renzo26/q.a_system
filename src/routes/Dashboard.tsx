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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { useRepoInfo } from "@/hooks/github";

const kpiPlaceholders: { label: string; icon: LucideIcon; accent: string }[] = [
  { label: "Score de risco", icon: Gauge, accent: "text-risk-med" },
  { label: "Cobertura de testes", icon: ShieldCheck, accent: "text-risk-low" },
  { label: "Pull requests", icon: GitPullRequest, accent: "text-info" },
  { label: "Problemas críticos", icon: ShieldAlert, accent: "text-risk-high" },
];

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
          Conecte um repositório do GitHub para o Argus começar a analisar riscos, sugerir testes e avaliar releases.
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

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 sm:py-7">
      <div className="animate-rise">
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Dashboard de qualidade</h1>
        <p className="mt-1 text-[14px] text-ink-soft">
          Visão geral do repositório conectado e da análise do Argus.
        </p>
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

      {/* KPIs placeholder */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiPlaceholders.map((k, i) => (
          <Card key={k.label} className="animate-rise p-5" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-ink-soft">{k.label}</span>
              <k.icon className={`size-[18px] ${k.accent}`} />
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-[34px] font-bold leading-none text-ink-mute/40">—</span>
            </div>
            <span className="mt-3 inline-block rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[10.5px] text-ink-mute">
              aguardando análise
            </span>
          </Card>
        ))}
      </div>

      {/* Aviso próxima etapa */}
      <Card className="grain relative overflow-hidden bg-shell p-6 text-shell-ink">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(320px 220px at 94% -10%, rgba(228,242,74,0.14), transparent 66%)" }}
        />
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <span className="grid size-11 place-items-center rounded-xl bg-brand/15 text-brand">
            <Sparkles className="size-5" />
          </span>
          <div className="flex-1">
            <div className="font-display text-[16px] font-bold text-shell-ink">
              Motor de análise em construção
            </div>
            <p className="mt-1 max-w-2xl text-[13px] text-shell-soft">
              O Argus vai ler os pull requests deste repositório e preencher o dashboard com score de risco,
              cobertura, testes sugeridos e recomendação de release. Essa é a próxima etapa que vamos construir.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
