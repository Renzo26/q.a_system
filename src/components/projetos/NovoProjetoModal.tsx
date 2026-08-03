import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, FolderKanban, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAtualizarProjeto, useCriarProjeto } from "@/hooks/projetos";
import { statusProjetoMeta, statusProjetoOrdem, sugerirChave, type Projeto } from "@/lib/projetos";

const schema = z.object({
  nome: z.string().min(2, "Dê um nome ao projeto"),
  chave: z
    .string()
    .min(2, "A chave precisa de ao menos 2 caracteres")
    .max(20, "No máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Use apenas letras, números, hífen ou underline"),
  descricao: z.string().optional(),
  repoOwner: z.string().optional(),
  repoName: z.string().optional(),
  responsavel: z.string().optional(),
  status: z.enum(["ativo", "pausado", "arquivado"]),
});

type FormValues = z.infer<typeof schema>;

const inputCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[14px] text-ink outline-none transition-all placeholder:text-ink-mute focus:border-ink/30 focus:ring-4 focus:ring-brand/25";
const taCls =
  "w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-all placeholder:text-ink-mute focus:border-ink/30 focus:ring-4 focus:ring-brand/25";
const selCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-[14px] text-ink outline-none transition-all focus:border-ink/30 focus:ring-4 focus:ring-brand/25";

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
  /** Quando informado, o modal edita esse projeto em vez de criar um novo. */
  projeto?: Projeto | null;
}

export function NovoProjetoModal({ open, onClose, projeto }: Props) {
  const [erroApi, setErroApi] = useState<string | null>(null);
  const criar = useCriarProjeto();
  const atualizar = useAtualizarProjeto();
  const editando = !!projeto;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "ativo" },
  });

  const nome = watch("nome");
  const chave = watch("chave");

  useEffect(() => {
    if (!open) return;
    setErroApi(null);
    reset(
      projeto
        ? {
            nome: projeto.nome,
            chave: projeto.chave,
            descricao: projeto.descricao,
            repoOwner: projeto.repo?.owner ?? "",
            repoName: projeto.repo?.repo ?? "",
            responsavel: projeto.responsavel,
            status: projeto.status,
          }
        : { nome: "", chave: "", descricao: "", repoOwner: "", repoName: "", responsavel: "", status: "ativo" },
    );
  }, [open, projeto, reset]);

  // Sugere a chave enquanto o usuário digita o nome (só na criação e se não editou a chave).
  useEffect(() => {
    if (editando || !nome || chave) return;
    const sugestao = sugerirChave(nome);
    if (sugestao) setValue("chave", sugestao);
  }, [nome, chave, editando, setValue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(values: FormValues) {
    setErroApi(null);
    const payload = {
      nome: values.nome,
      descricao: values.descricao?.trim() || "",
      repoOwner: values.repoOwner?.trim() || null,
      repoName: values.repoName?.trim() || null,
      responsavel: values.responsavel?.trim() || null,
      status: values.status,
    };
    try {
      if (projeto) {
        await atualizar.mutateAsync({ id: projeto.id, payload });
      } else {
        await criar.mutateAsync({ ...payload, chave: values.chave });
      }
      onClose();
    } catch (e) {
      setErroApi(e instanceof Error ? e.message : "Falha ao salvar o projeto");
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="animate-rise flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-card border border-line bg-surface shadow-pop"
        noValidate
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-deep">
            <FolderKanban className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-ink">{editando ? "Editar projeto" : "Novo projeto"}</h2>
            <p className="text-[12.5px] text-ink-soft">
              Projetos agrupam defeitos e coleções de teste do mesmo produto.
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

        <div className="scroll-slim min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <input className={inputCls} placeholder="Portal do Fornecedor" autoFocus {...register("nome")} />
              <ErrorText msg={errors.nome?.message} />
            </div>
            <div className="space-y-1.5 sm:w-[150px]">
              <Label>Chave</Label>
              <input
                className={`${inputCls} font-mono uppercase`}
                placeholder="PORTAL"
                disabled={editando}
                {...register("chave")}
              />
              <ErrorText msg={errors.chave?.message} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <textarea className={taCls} rows={2} placeholder="O que esse projeto cobre" {...register("descricao")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Repositório — dono</Label>
              <input className={`${inputCls} font-mono`} placeholder="braesp" {...register("repoOwner")} />
            </div>
            <div className="space-y-1.5">
              <Label>Repositório — nome</Label>
              <input className={`${inputCls} font-mono`} placeholder="portal-fornecedor" {...register("repoName")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <input className={inputCls} placeholder="Quem lidera o QA" {...register("responsavel")} />
            </div>
            <div className="space-y-1.5">
              <Label>Situação</Label>
              <select className={selCls} {...register("status")}>
                {statusProjetoOrdem.map((s) => (
                  <option key={s} value={s}>
                    {statusProjetoMeta[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {erroApi && (
            <p className="flex items-center gap-2 rounded-xl bg-risk-high-soft px-3 py-2.5 text-[13px] font-medium text-risk-high">
              <AlertCircle className="size-4 shrink-0" />
              {erroApi}
            </p>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="brand" loading={isSubmitting}>
            {editando ? "Salvar alterações" : "Criar projeto"}
          </Button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}
