/** URL base da API. Configurável via VITE_API_URL; default para o backend local. */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";
