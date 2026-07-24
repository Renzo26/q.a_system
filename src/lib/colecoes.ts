import { apiFetch, apiUpload } from "@/lib/api";

/* ============================================================
   Coleções do Postman importadas — fluxo legível para leigos.
   ============================================================ */

export interface Variavel {
  chave: string;
  valor: string;
}

export interface Passo {
  ordem: number;
  pasta: string;
  nome: string;
  metodo: string;
  url: string;
  descricao: string;
  checks: string[];
  bodyResumo?: string | null;
}

export interface ColecaoResumo {
  id: string;
  nome: string;
  descricao: string;
  totalRequests: number;
  totalPastas: number;
  criadoPor: string;
  criadoEm: string;
}

export interface ColecaoDetalhe {
  id: string;
  nome: string;
  descricao: string;
  totalRequests: number;
  totalPastas: number;
  variaveis: Variavel[];
  passos: Passo[];
}

const metodoCor: Record<string, string> = {
  GET: "bg-info-soft text-info",
  POST: "bg-risk-low-soft text-risk-low",
  PUT: "bg-risk-med-soft text-risk-med",
  PATCH: "bg-risk-med-soft text-risk-med",
  DELETE: "bg-risk-high-soft text-risk-high",
};

export function metodoBadge(metodo: string): string {
  return metodoCor[metodo.toUpperCase()] ?? "bg-surface-2 text-ink-soft";
}

/* ---------- API ---------- */

export function listarColecoes(): Promise<ColecaoResumo[]> {
  return apiFetch<ColecaoResumo[]>("/api/colecoes");
}

export function obterColecao(id: string): Promise<ColecaoDetalhe> {
  return apiFetch<ColecaoDetalhe>(`/api/colecoes/${id}`);
}

export function importarColecao(file: File): Promise<ColecaoResumo> {
  const fd = new FormData();
  fd.append("file", file, file.name);
  return apiUpload<ColecaoResumo>("/api/colecoes", fd);
}

export function removerColecao(id: string): Promise<void> {
  return apiFetch<void>(`/api/colecoes/${id}`, { method: "DELETE" });
}
