import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Bug, X, FlaskConical, Play, GitPullRequest } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EvidenceCapture } from "@/components/defeitos/EvidenceCapture";
import { useCasosDeTeste, useCriarDefeito, useExecucoes } from "@/hooks/defeitos";
import { ambienteOptions, type EvidenciaDraft, type VinculoTeste } from "@/lib/defeitos";

const schema = z.object({
  titulo: z.string().min(4, "Descreva o problema em poucas palavras"),
  descricao: z.string().min(10, "Explique o que aconteceu"),
  severidade: z.enum(["critica", "alta", "media", "baixa"]),
  prioridade: z.enum(["urgente", "alta", "media", "baixa"]),
  ambiente: z.string().min(1, "Selecione o ambiente"),
  passosReproducao: z.string().min(1, "Informe os passos para reproduzir"),
  resultadoEsperado: z.string().min(1, "Informe o resultado esperado"),
  resultadoObtido: z.string().min(1, "Informe o resultado obtido"),
  casoDeTesteId: z.string().optional(),
  execucaoId: z.string().optional(),
  pullRequest: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const taCls =
  "w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-all placeholder:text-ink-mute focus:border-ink/30 focus:ring-4 focus:ring-brand/25";
const selCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-[14px] text-ink outline-none transition-all focus:border-ink/30 focus:ring-4 focus:ring-brand/25";
const inputCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[14px] text-ink outline-none transition-all placeholder:text-ink-mute focus:border-ink/30 focus:ring-4 focus:ring-brand/25";

function Label({ children }: { children: ReactNode }) {
  return <label className="block text-[13px] font-semibold text-ink">{children}</label>;
}

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-[12px] font-medium text-risk-high">
      <AlertCircle className="size-3.5" />
      {msg}
    </p>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialVinculo?: VinculoTeste;
}

export function ReportarErroModal({ open, onClose, initialVinculo }: Props) {
  const [evidencias, setEvidencias] = useState<EvidenciaDraft[]>([]);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const casos = useCasosDeTeste();
  const execs = useExecucoes();
  const criar = useCriarDefeito();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      severidade: "media",
      prioridade: "media",
      ambiente: "Homologação",
      casoDeTesteId: initialVinculo?.casoDeTesteId ?? "",
      execucaoId: initialVinculo?.execucaoId ?? "",
      pullRequest: initialVinculo?.pullRequest ?? "",
    },
  });

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(values: FormValues) {
    setErroApi(null);
    try {
      await criar.mutateAsync({
        payload: {
          titulo: values.titulo,
          descricao: values.descricao,
          severidade: values.severidade,
          prioridade: values.prioridade,
          ambiente: values.ambiente,
          passosReproducao: values.passosReproducao,
          resultadoEsperado: values.resultadoEsperado,
          resultadoObtido: values.resultadoObtido,
          vinculo: {
            casoDeTesteId: values.casoDeTesteId || null,
            execucaoId: values.execucaoId || null,
            pullRequest: values.pullRequest?.trim() || null,
          },
        },
        evidencias,
      });
      reset();
      setEvidencias([]);
      onClose();
    } catch (e) {
      setErroApi(e instanceof Error ? e.message : "Falha ao registrar o defeito");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="animate-rise flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-line bg-surface shadow-pop"
        noValidate
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-risk-high-soft text-risk-high">
            <Bug className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-ink">Reportar erro</h2>
            <p className="text-[12.5px] text-ink-soft">Registre o defeito e vincule ao teste que o revelou.</p>
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

        <div className="scroll-slim min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <input className={inputCls} placeholder="Resumo curto do erro" autoFocus {...register("titulo")} />
            <ErrorText msg={errors.titulo?.message} />
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <textarea rows={3} className={taCls} placeholder="O que aconteceu e onde no sistema" {...register("descricao")} />
            <ErrorText msg={errors.descricao?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Severidade</Label>
              <select className={selCls} {...register("severidade")}>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <select className={selCls} {...register("prioridade")}>
                <option value="urgente">Urgente</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Ambiente</Label>
              <select className={selCls} {...register("ambiente")}>
                {ambienteOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Passos para reprodução</Label>
            <textarea rows={3} className={taCls} placeholder={"1. ...\n2. ...\n3. ..."} {...register("passosReproducao")} />
            <ErrorText msg={errors.passosReproducao?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Resultado esperado</Label>
              <textarea rows={2} className={taCls} {...register("resultadoEsperado")} />
              <ErrorText msg={errors.resultadoEsperado?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Resultado obtido</Label>
              <textarea rows={2} className={taCls} {...register("resultadoObtido")} />
              <ErrorText msg={errors.resultadoObtido?.message} />
            </div>
          </div>

          <div className="rounded-tile border border-line bg-surface-2/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
              <FlaskConical className="size-3.5" />
              Vincular ao teste
              <span className="font-mono text-[10.5px] font-normal normal-case text-ink-mute">· opcional</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Caso de teste</Label>
                <select className={selCls} {...register("casoDeTesteId")}>
                  <option value="">—</option>
                  {(casos.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} · {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Execução</Label>
                <select className={selCls} {...register("execucaoId")}>
                  <option value="">—</option>
                  {(execs.data ?? []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id} · {e.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Pull request</Label>
                <input className={inputCls} placeholder="#128" {...register("pullRequest")} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
              <Play className="size-3.5" />
              Evidências
              <span className="font-mono text-[10.5px] font-normal normal-case text-ink-mute">
                · prints, vídeos e gravação de tela
              </span>
            </div>
            <EvidenceCapture value={evidencias} onChange={setEvidencias} />
          </div>

          {erroApi && (
            <p className="flex items-center gap-1.5 rounded-tile bg-risk-high-soft px-3 py-2 text-[12.5px] font-medium text-risk-high">
              <AlertCircle className="size-4" />
              {erroApi}
            </p>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-surface-2/60 px-5 py-3.5">
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-mute">
            <GitPullRequest className="size-3.5" />
            nasce com status “Aberto”
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" loading={criar.isPending}>
              <Bug className="size-4" />
              Registrar defeito
            </Button>
          </div>
        </footer>
      </form>
    </div>
  );
}
