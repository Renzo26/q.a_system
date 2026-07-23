import { API_URL } from "@/lib/env";
import { auth } from "@/lib/auth";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function extrairErro(res: Response): Promise<string> {
  try {
    const data = await res.json();
    const detail = data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join("; ") || `Erro ${res.status}`;
    }
  } catch {
    /* corpo não-JSON */
  }
  return `Erro ${res.status}`;
}

/** Fetch central: injeta o JWT, trata JSON e erros, e desloga em 401. */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isForm = options.body instanceof FormData;
  if (!isForm && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = auth.snapshot().token;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    auth.logout();
    throw new ApiError(401, "Sessão expirada. Entre novamente.");
  }
  if (!res.ok) throw new ApiError(res.status, await extrairErro(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: formData });
}
