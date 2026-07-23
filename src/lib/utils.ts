import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type RiskLevel = "low" | "med" | "high";

export const riskLabel: Record<RiskLevel, string> = {
  low: "Baixo",
  med: "Médio",
  high: "Alto",
};

export function riskFromScore(score: number): RiskLevel {
  if (score >= 66) return "high";
  if (score >= 33) return "med";
  return "low";
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let idCounter = 0;
export const uid = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

/**
 * Extrai owner/repo de uma URL do GitHub em vários formatos:
 * https://github.com/owner/repo(.git), git@github.com:owner/repo.git, owner/repo
 */
export function parseGithubUrl(input: string): { owner: string; repo: string } | null {
  const value = input.trim().replace(/\.git$/, "");
  if (!value) return null;

  const patterns = [
    /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)/i,
    /^git@github\.com:([\w.-]+)\/([\w.-]+)/i,
    /^([\w.-]+)\/([\w.-]+)$/,
  ];

  for (const re of patterns) {
    const m = value.match(re);
    if (m) return { owner: m[1], repo: m[2] };
  }
  return null;
}
