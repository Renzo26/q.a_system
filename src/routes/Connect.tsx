import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { Github, ArrowRight, GitBranch, Star, Lock, Globe, FlaskConical, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { auth, useAuth } from "@/lib/auth";
import { parseGithubUrl } from "@/lib/utils";
import { detectRepo } from "@/lib/repoMeta";

const schema = z.object({
  url: z
    .string()
    .min(1, "Cole a URL do repositório")
    .refine((v) => parseGithubUrl(v) !== null, "Formato inválido — use github.com/owner/repositório"),
});

type FormValues = z.infer<typeof schema>;

const examples = ["vercel/next.js", "tiangolo/fastapi", "facebook/react"];

export function Connect() {
  const navigate = useNavigate();
  const { repo: current } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { url: "" },
  });

  const value = watch("url");
  const parsed = useMemo(() => parseGithubUrl(value ?? ""), [value]);
  const detected = useMemo(() => (parsed ? detectRepo(parsed.owner, parsed.repo) : null), [parsed]);

  async function onSubmit(values: FormValues) {
    const repo = parseGithubUrl(values.url);
    if (!repo) return;
    await new Promise((r) => setTimeout(r, 800));
    auth.connectRepo(repo);
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-7 sm:px-6 sm:py-9">
      <div className="animate-rise">
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">Conectar repositório</h1>
        <p className="mt-1.5 text-[14px] text-ink-soft">
          Cole a URL do repositório GitHub que o Argus vai monitorar e analisar.
        </p>

        {current && (
          <div className="mt-5 flex items-center gap-3 rounded-tile border border-risk-low/30 bg-risk-low-soft px-4 py-3">
            <CheckCircle2 className="size-5 shrink-0 text-risk-low" />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium text-risk-low">Repositório conectado</div>
              <div className="truncate font-mono text-[13.5px] font-semibold text-ink">
                {current.owner}/{current.repo}
              </div>
            </div>
            <span className="font-mono text-[11px] text-ink-soft">trocar abaixo ↓</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <TextField
            label="Repositório GitHub"
            placeholder="owner/repositório"
            addon="github.com/"
            icon={<Github className="size-[18px]" />}
            error={errors.url?.message}
            autoComplete="off"
            spellCheck={false}
            {...register("url")}
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] text-ink-mute">Experimente:</span>
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setValue("url", ex, { shouldValidate: true })}
                className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[12px] text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
              >
                {ex}
              </button>
            ))}
          </div>

          {detected && (
            <div className="animate-rise overflow-hidden rounded-tile border border-line bg-surface shadow-card">
              <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2 px-4 py-2.5">
                <Sparkles className="size-3.5 text-brand-deep" />
                <span className="text-[12px] font-semibold text-ink">Detectado</span>
                <span className="font-mono text-[11px] text-ink-mute">· pré-análise simulada</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[14px] text-ink">
                    <span className="font-semibold">{detected.owner}</span>
                    <span className="text-ink-mute">/</span>
                    <span className="font-semibold">{detected.repo}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                    {detected.visibility === "Privado" ? <Lock className="size-3" /> : <Globe className="size-3" />}
                    {detected.visibility}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {detected.languages.map((l) => (
                    <span
                      key={l.name}
                      className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink-soft ring-1 ring-line"
                    >
                      <span className="size-2 rounded-full" style={{ background: l.color }} />
                      {l.name}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-ink-mute">
                  <span className="flex items-center gap-1">
                    <GitBranch className="size-3.5" />
                    {detected.defaultBranch}
                  </span>
                  <span className="flex items-center gap-1">
                    <FlaskConical className="size-3.5" />
                    {detected.testFramework}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5" />
                    {detected.stars}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" variant="brand" size="lg" block loading={isSubmitting} disabled={!parsed}>
            {!isSubmitting && <Github className="size-[18px]" />}
            {current ? "Trocar e analisar" : "Conectar e analisar"}
            {!isSubmitting && <ArrowRight className="size-4" />}
          </Button>
        </form>

        <p className="mt-5 text-center font-mono text-[11px] text-ink-mute">
          Conexão simulada · nenhum dado é enviado ao GitHub nesta fase
        </p>
      </div>
    </div>
  );
}
