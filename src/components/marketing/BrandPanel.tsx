import { ShieldAlert, Sparkles, GitPullRequest, TrendingDown } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

function RiskRing({ score = 78 }: { score?: number }) {
  const size = 46;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-shell-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-risk-high)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <span className="nums absolute text-[13px] font-bold text-risk-high">{score}</span>
    </div>
  );
}

const features = [
  { icon: GitPullRequest, text: "Análise de risco a cada pull request" },
  { icon: Sparkles, text: "Testes sugeridos pelo motor de IA" },
  { icon: TrendingDown, text: "Decisão de release rastreável e justificada" },
];

export function BrandPanel() {
  return (
    <div className="grain relative hidden overflow-hidden bg-shell p-10 text-shell-ink lg:flex lg:flex-col">
      {/* brilhos de marca — gradientes radiais (GPU-safe, sem blur) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px 380px at 6% 14%, rgba(228,242,74,0.12), transparent 62%), radial-gradient(600px 520px at 98% 108%, rgba(59,130,246,0.14), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <Logo variant="dark" size="md" />

        {/* Bloco central — distribuído e centralizado no espaço restante (vertical e horizontal) */}
        <div className="flex flex-1 flex-col items-center justify-center gap-12 py-10">
          <div className="w-full max-w-md">
            <h2 className="font-display text-[34px] font-bold leading-[1.1] tracking-tight text-shell-ink">
              Transforme cada commit em uma{" "}
              <span className="text-brand">decisão de qualidade</span>.
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-shell-soft">
              Conecte um repositório do GitHub e deixe o Q.A braesp analisar riscos, sugerir testes e recomendar quando
              liberar — ou bloquear — uma versão.
            </p>
          </div>

          {/* Card de análise flutuante */}
          <div className="relative w-full max-w-sm animate-floaty">
            <div className="rounded-2xl border border-shell-line bg-shell-2 p-5 shadow-pop">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand/12 px-2.5 py-1 text-[11px] font-semibold text-brand">
                  <Sparkles className="size-3" />
                  Recomendação do Q.A braesp
                </div>
                <span className="font-mono text-[11px] text-shell-mute">PR #482</span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <RiskRing score={78} />
                <div>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-risk-high">
                    <ShieldAlert className="size-4" />
                    Alto risco
                  </div>
                  <div className="text-[12px] text-shell-soft">core/auth · cobertura 61%</div>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                {["Testar expiração de refresh token", "Cobrir logout multi-sessão"].map((t) => (
                  <div key={t} className="flex items-center gap-2 rounded-lg bg-shell-3/60 px-2.5 py-2 text-[12px] text-shell-ink">
                    <span className="size-1.5 rounded-full bg-brand" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="w-full max-w-md space-y-3.5">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-shell-2 text-brand">
                  <f.icon className="size-4" />
                </span>
                <span className="text-[13px] text-shell-soft">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
