import { useSyncExternalStore } from "react";
import { API_URL } from "@/lib/env";

export interface ConnectedRepo {
  owner: string;
  repo: string;
}

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  via: "email" | "github";
  /** Repositório salvo no servidor para este login. */
  repo?: ConnectedRepo | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  repo: ConnectedRepo | null;
}

interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

const KEY = "qa-copilot:auth";
const listeners = new Set<() => void>();
let state: AuthState = load();

function load(): AuthState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthState>;
      return { user: parsed.user ?? null, token: parsed.token ?? null, repo: parsed.repo ?? null };
    }
  } catch {
    /* ignore */
  }
  return { user: null, token: null, repo: null };
}

function commit(next: AuthState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

async function postAuth(path: "login" | "register", body: Record<string, string>): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data?.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join("; ")
          : "Falha na autenticação";
    throw new Error(msg);
  }
  return data as AuthResponse;
}

/** Chamadas autenticadas locais — `api.ts` importa este módulo, então não podemos usá-lo aqui. */
async function comToken<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (state.token) headers.set("Authorization", `Bearer ${state.token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    commit({ user: null, token: null, repo: null });
    throw new Error("Sessão expirada. Entre novamente.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data?.detail;
    throw new Error(typeof detail === "string" ? detail : "Não foi possível salvar o repositório");
  }
  return data as T;
}

function putRepo(repo: ConnectedRepo | null): Promise<AuthUser> {
  return comToken<AuthUser>("/api/auth/repo", {
    method: "PUT",
    body: JSON.stringify({ owner: repo?.owner ?? null, repo: repo?.repo ?? null }),
  });
}

function getMe(): Promise<{ repo: ConnectedRepo | null }> {
  return comToken<{ repo: ConnectedRepo | null }>("/api/auth/me");
}

export const auth = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  snapshot() {
    return state;
  },
  async login(email: string, senha: string) {
    const r = await postAuth("login", { email, senha });
    commit({ user: r.user, token: r.accessToken, repo: r.user.repo ?? null });
  },
  async register(name: string, email: string, senha: string) {
    const r = await postAuth("register", { name, email, senha });
    commit({ user: r.user, token: r.accessToken, repo: r.user.repo ?? null });
  },

  /** Salva o repositório no usuário (servidor) — persiste entre sessões e máquinas. */
  async connectRepo(repo: ConnectedRepo) {
    const atualizado = await putRepo(repo);
    commit({ ...state, user: atualizado, repo: atualizado.repo ?? null });
  },

  async disconnectRepo() {
    const atualizado = await putRepo(null);
    commit({ ...state, user: atualizado, repo: null });
  },

  /** Revalida o vínculo com o servidor ao abrir o app (outra máquina pode ter mudado). */
  async sync() {
    if (!state.token) return;
    try {
      const me = await getMe();
      commit({ ...state, repo: me.repo ?? null });
    } catch {
      /* offline ou sessão inválida — mantém o que está em cache */
    }
  },
  logout() {
    commit({ user: null, token: null, repo: null });
  },
};

export function useAuth(): AuthState {
  return useSyncExternalStore(auth.subscribe, auth.snapshot, auth.snapshot);
}
