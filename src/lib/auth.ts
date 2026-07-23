import { useSyncExternalStore } from "react";
import { API_URL } from "@/lib/env";

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  via: "email" | "github";
}

export interface ConnectedRepo {
  owner: string;
  repo: string;
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
    commit({ ...state, user: r.user, token: r.accessToken });
  },
  async register(name: string, email: string, senha: string) {
    const r = await postAuth("register", { name, email, senha });
    commit({ ...state, user: r.user, token: r.accessToken });
  },
  connectRepo(repo: ConnectedRepo) {
    commit({ ...state, repo });
  },
  logout() {
    commit({ user: null, token: null, repo: null });
  },
};

export function useAuth(): AuthState {
  return useSyncExternalStore(auth.subscribe, auth.snapshot, auth.snapshot);
}
