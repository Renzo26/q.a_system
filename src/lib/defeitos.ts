import { apiFetch, apiUpload } from "@/lib/api";
import type { RiskLevel } from "@/lib/utils";

/* ============================================================
   Gestão de defeitos (#13) + Evidências (#17) + Rastreabilidade (#18)
   Agora conectado ao backend (FastAPI + Supabase) via /api.
   ============================================================ */

export type Severidade = "critica" | "alta" | "media" | "baixa";
export type Prioridade = "urgente" | "alta" | "media" | "baixa";
export type StatusDefeito =
  | "aberto"
  | "em_analise"
  | "em_correcao"
  | "pronto_reteste"
  | "resolvido"
  | "reaberto"
  | "cancelado";
export type TipoEvidencia = "imagem" | "video" | "log" | "request_response" | "arquivo";

export interface Evidencia {
  id: string;
  tipo: TipoEvidencia;
  nome: string;
  url: string;
  tamanhoBytes: number;
  criadoEm: string;
}

/** Rascunho local no formulário — carrega o arquivo bruto para upload. */
export interface EvidenciaDraft {
  id: string;
  tipo: TipoEvidencia;
  nome: string;
  previewUrl: string;
  tamanhoBytes: number;
  file: Blob;
}

export interface VinculoTeste {
  casoDeTesteId?: string | null;
  execucaoId?: string | null;
  pullRequest?: string | null;
}

export interface Defeito {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  severidade: Severidade;
  prioridade: Prioridade;
  ambiente: string;
  passosReproducao: string;
  resultadoEsperado: string;
  resultadoObtido: string;
  status: StatusDefeito;
  responsavel: string;
  criadoPor: string;
  projetoId: string | null;
  criadoEm: string;
  atualizadoEm: string;
  vinculo: VinculoTeste;
  evidencias: Evidencia[];
}

export interface NovoDefeitoPayload {
  titulo: string;
  descricao: string;
  severidade: Severidade;
  prioridade: Prioridade;
  ambiente: string;
  passosReproducao: string;
  resultadoEsperado: string;
  resultadoObtido: string;
  responsavel?: string;
  projetoId?: string | null;
  vinculo: VinculoTeste;
}

export interface CasoDeTesteRef {
  id: string;
  nome: string;
  tipo: string;
}
export interface ExecucaoRef {
  id: string;
  nome: string;
  resultado: string;
}

/* ---------- Metadados de apresentação ---------- */

export const severidadeMeta: Record<Severidade, { label: string; level: RiskLevel }> = {
  critica: { label: "Crítica", level: "high" },
  alta: { label: "Alta", level: "high" },
  media: { label: "Média", level: "med" },
  baixa: { label: "Baixa", level: "low" },
};

export const prioridadeMeta: Record<Prioridade, { label: string }> = {
  urgente: { label: "Urgente" },
  alta: { label: "Alta" },
  media: { label: "Média" },
  baixa: { label: "Baixa" },
};

export const statusMeta: Record<StatusDefeito, { label: string; badge: string; dot: string }> = {
  aberto: { label: "Aberto", badge: "bg-risk-high-soft text-risk-high", dot: "bg-risk-high" },
  em_analise: { label: "Em análise", badge: "bg-info-soft text-info", dot: "bg-info" },
  em_correcao: { label: "Em correção", badge: "bg-risk-med-soft text-risk-med", dot: "bg-risk-med" },
  pronto_reteste: { label: "Pronto p/ reteste", badge: "bg-brand-soft text-brand-deep", dot: "bg-brand-deep" },
  resolvido: { label: "Resolvido", badge: "bg-risk-low-soft text-risk-low", dot: "bg-risk-low" },
  reaberto: { label: "Reaberto", badge: "bg-risk-high-soft text-risk-high", dot: "bg-risk-high" },
  cancelado: { label: "Cancelado", badge: "bg-surface-2 text-ink-mute", dot: "bg-ink-mute" },
};

export const statusOrdem: StatusDefeito[] = [
  "aberto",
  "em_analise",
  "em_correcao",
  "pronto_reteste",
  "resolvido",
  "reaberto",
  "cancelado",
];

export const ambienteOptions = ["Produção", "Homologação", "Staging", "Desenvolvimento"];

/* ---------- Helpers ---------- */

export function formatData(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatBytes(n: number) {
  if (n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/* ---------- API ---------- */

export function listarDefeitos(status?: StatusDefeito, projetoId?: string | null): Promise<Defeito[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (projetoId) params.set("projetoId", projetoId);
  const qs = params.size ? `?${params}` : "";
  return apiFetch<Defeito[]>(`/api/defeitos${qs}`);
}

export function criarDefeito(payload: NovoDefeitoPayload): Promise<Defeito> {
  return apiFetch<Defeito>("/api/defeitos", { method: "POST", body: JSON.stringify(payload) });
}

export function atualizarStatusDefeito(id: string, status: StatusDefeito): Promise<Defeito> {
  return apiFetch<Defeito>(`/api/defeitos/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function removerDefeito(id: string): Promise<void> {
  return apiFetch<void>(`/api/defeitos/${id}`, { method: "DELETE" });
}

export function enviarEvidencias(id: string, drafts: EvidenciaDraft[]): Promise<Defeito> {
  const fd = new FormData();
  for (const d of drafts) fd.append("files", d.file, d.nome);
  return apiUpload<Defeito>(`/api/defeitos/${id}/evidencias`, fd);
}

export function listarCasosDeTeste(): Promise<CasoDeTesteRef[]> {
  return apiFetch<CasoDeTesteRef[]>("/api/casos-de-teste");
}

export function listarExecucoes(): Promise<ExecucaoRef[]> {
  return apiFetch<ExecucaoRef[]>("/api/execucoes");
}
