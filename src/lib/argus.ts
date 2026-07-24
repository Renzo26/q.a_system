import { apiFetch } from "@/lib/api";

export interface ArgusMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RepoRef {
  owner: string;
  repo: string;
}

/** Envia o histórico da conversa (e o repo conectado) ao agente. */
export function enviarArgus(messages: ArgusMessage[], repo?: RepoRef | null): Promise<{ reply: string }> {
  return apiFetch<{ reply: string }>("/api/argus/chat", {
    method: "POST",
    body: JSON.stringify({ messages, repo: repo ?? null }),
  });
}
