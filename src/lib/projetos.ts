import { apiFetch } from "@/lib/api";
import type { Severidade, StatusDefeito } from "@/lib/defeitos";

/* ============================================================
   Meus projetos — agrupa defeitos e coleções por produto.
   ============================================================ */

export type StatusProjeto = "ativo" | "pausado" | "arquivado";

export interface RepoRef {
  owner: string;
  repo: string;
}

export interface MetricasProjeto {
  defeitosTotal: number;
  defeitosAbertos: number;
  defeitosCriticos: number;
  defeitosResolvidos: number;
  colecoesTotal: number;
  requestsTotal: number;
  porSeveridade: Partial<Record<Severidade, number>>;
  porStatus: Partial<Record<StatusDefeito, number>>;
  ultimoDefeitoEm: string | null;
}

export interface Projeto {
  id: string;
  chave: string;
  nome: string;
  descricao: string;
  status: StatusProjeto;
  responsavel: string;
  criadoPor: string;
  repo: RepoRef | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProjetoComMetricas extends Projeto {
  metricas: MetricasProjeto;
}

export interface ResumoProjetos {
  projetosTotal: number;
  projetosAtivos: number;
  metricas: MetricasProjeto;
  semProjeto: number;
}

export interface NovoProjetoPayload {
  nome: string;
  chave: string;
  descricao?: string;
  repoOwner?: string | null;
  repoName?: string | null;
  responsavel?: string | null;
  status?: StatusProjeto;
}

export type AtualizarProjetoPayload = Partial<Omit<NovoProjetoPayload, "chave">>;

/* ---------- Metadados de apresentação ---------- */

export const statusProjetoMeta: Record<StatusProjeto, { label: string; badge: string; dot: string }> = {
  ativo: { label: "Ativo", badge: "bg-risk-low-soft text-risk-low", dot: "bg-risk-low" },
  pausado: { label: "Pausado", badge: "bg-risk-med-soft text-risk-med", dot: "bg-risk-med" },
  arquivado: { label: "Arquivado", badge: "bg-surface-2 text-ink-mute", dot: "bg-ink-mute" },
};

export const statusProjetoOrdem: StatusProjeto[] = ["ativo", "pausado", "arquivado"];

/** Sugere uma chave a partir do nome: "Portal do Fornecedor" → "PORTAL". */
export function sugerirChave(nome: string): string {
  const palavras = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter((p) => p.length > 2);
  if (!palavras.length) return "";
  return palavras[0].toUpperCase().slice(0, 12);
}

/* ---------- API ---------- */

export function listarProjetos(status?: StatusProjeto): Promise<ProjetoComMetricas[]> {
  const qs = status ? `?status=${status}` : "";
  return apiFetch<ProjetoComMetricas[]>(`/api/projetos${qs}`);
}

export function obterResumo(projetoId?: string | null): Promise<ResumoProjetos> {
  const qs = projetoId ? `?projetoId=${encodeURIComponent(projetoId)}` : "";
  return apiFetch<ResumoProjetos>(`/api/projetos/resumo${qs}`);
}

export function criarProjeto(payload: NovoProjetoPayload): Promise<Projeto> {
  return apiFetch<Projeto>("/api/projetos", { method: "POST", body: JSON.stringify(payload) });
}

export function atualizarProjeto(id: string, payload: AtualizarProjetoPayload): Promise<Projeto> {
  return apiFetch<Projeto>(`/api/projetos/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function removerProjeto(id: string): Promise<void> {
  return apiFetch<void>(`/api/projetos/${id}`, { method: "DELETE" });
}

/** Move um defeito para um projeto — `null` desvincula. */
export function atribuirProjetoAoDefeito(defeitoId: string, projetoId: string | null): Promise<void> {
  return apiFetch<void>(`/api/defeitos/${defeitoId}/projeto`, {
    method: "PATCH",
    body: JSON.stringify({ projetoId }),
  });
}
