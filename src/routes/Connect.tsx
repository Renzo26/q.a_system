import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import {
  Github,
  ArrowRight,
  GitBranch,
  Star,
  Lock,
  Globe,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { auth, useAuth } from "@/lib/auth";
import { parseGithubUrl } from "@/lib/utils";
import { useRepoInfo } from "@/hooks/github";

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
  const info = useRepoInfo(parsed?.owner, parsed?.repo);

  async function onSubmit(values: FormValues) {
    const repo = parseGithubUrl(values.url);
    if (!repo) return;
    auth.connectRepo(repo);
    navigate({ to: "/dashboard" });
  }

  const podeConectar = !!parsed && !info.isLoading && !info.isError;

  return (
    <div className="mx-auto max-w-xl px-4 py-7 sm:px-6 sm:py-9">
      <div className="animate-rise">
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">Conectar repositório</h1>
        <p className="mt-1.5 text-[14px] text-ink-soft">
          Cole a URL do repositório GitHub que o Assistente Q.A vai monitorar e analisar.
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

          {/* Estados da consulta ao GitHub */}
          {parsed && info.isLoading && (
            <div className="flex items-center gap-2 rounded-tile border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft">
              <Loader2 className="size-4 animate-spin text-brand-deep" />
              Buscando <span className="font-mono">{parsed.owner}/{parsed.repo}</span> no GitHub…
            </div>
          )}

          {parsed && info.isError && (
            <div className="flex items-center gap-2 rounded-tile border border-risk-high/30 bg-risk-high-soft px-4 py-3 text-[13px] font-medium text-risk-high">
              <AlertCircle className="size-4 shrink-0" />
              {info.error instanceof Error ? info.error.message : "Repositório não encontrado no GitHub."}
            </div>
          )}

          {info.data && (
            <div className="animate-rise overflow-hidden rounded-tile border border-line bg-surface shadow-card">
              <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2 px-4 py-2.5">
                <Sparkles className="size-3.5 text-brand-deep" />
                <span className="text-[12px] font-semibold text-ink">Encontrado no GitHub</span>
                <span className="font-mono text-[11px] text-ink-mute">· dados reais</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-[14px] text-ink">
                    <span className="font-semibold">{info.data.owner}</span>
                    <span className="text-ink-mute">/</span>
                    <span className="font-semibold">{info.data.repo}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                    {info.data.visibilidade === "Privado" ? <Lock className="size-3" /> : <Globe className="size-3" />}
                    {info.data.visibilidade}
                  </span>
                </div>

                {info.data.descricao && (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{info.data.descricao}</p>
                )}

                {info.data.linguagens.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {info.data.linguagens.map((l) => (
                      <span
                        key={l}
                        className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink-soft ring-1 ring-line"
                      >
                        <CircleDot className="size-3 text-brand-deep" />
                        {l}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-ink-mute">
                  <span className="flex items-center gap-1">
                    <GitBranch className="size-3.5" />
                    {info.data.defaultBranch}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5" />
                    {info.data.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <CircleDot className="size-3.5" />
                    {info.data.issuesAbertas} issues abertas
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" variant="brand" size="lg" block loading={isSubmitting} disabled={!podeConectar}>
            {!isSubmitting && <Github className="size-[18px]" />}
            {current ? "Trocar e analisar" : "Conectar e analisar"}
            {!isSubmitting && <ArrowRight className="size-4" />}
          </Button>
        </form>

        <p className="mt-5 text-center font-mono text-[11px] text-ink-mute">
          Dados reais da API pública do GitHub · o Assistente Q.A vai analisar este repositório
        </p>
      </div>
    </div>
  );
}
