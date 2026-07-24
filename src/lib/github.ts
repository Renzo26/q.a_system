import { apiFetch } from "@/lib/api";

export interface RepoInfo {
  owner: string;
  repo: string;
  descricao: string;
  defaultBranch: string;
  linguagens: string[];
  stars: number;
  visibilidade: string;
  url: string;
  atualizadoEm: string | null;
  issuesAbertas: number;
}

export function obterRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  return apiFetch<RepoInfo>(
    `/api/github/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
  );
}
