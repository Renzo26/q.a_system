import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atualizarStatusDefeito,
  criarDefeito,
  enviarEvidencias,
  listarCasosDeTeste,
  listarDefeitos,
  listarExecucoes,
  removerDefeito,
  type EvidenciaDraft,
  type NovoDefeitoPayload,
  type StatusDefeito,
} from "@/lib/defeitos";

const DEFEITOS_KEY = ["defeitos"] as const;

export function useDefeitos() {
  return useQuery({ queryKey: DEFEITOS_KEY, queryFn: () => listarDefeitos() });
}

export function useCasosDeTeste() {
  return useQuery({ queryKey: ["casos-de-teste"], queryFn: listarCasosDeTeste, staleTime: 5 * 60_000 });
}

export function useExecucoes() {
  return useQuery({ queryKey: ["execucoes"], queryFn: listarExecucoes, staleTime: 5 * 60_000 });
}

export function useCriarDefeito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { payload: NovoDefeitoPayload; evidencias: EvidenciaDraft[] }) => {
      const novo = await criarDefeito(vars.payload);
      if (vars.evidencias.length) return enviarEvidencias(novo.id, vars.evidencias);
      return novo;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: DEFEITOS_KEY });
    },
  });
}

export function useAtualizarStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: StatusDefeito }) =>
      atualizarStatusDefeito(vars.id, vars.status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: DEFEITOS_KEY });
    },
  });
}

export function useRemoverDefeito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removerDefeito(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: DEFEITOS_KEY });
    },
  });
}
