import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atribuirProjetoAoDefeito,
  atualizarProjeto,
  criarProjeto,
  listarProjetos,
  obterResumo,
  removerProjeto,
  type AtualizarProjetoPayload,
  type NovoProjetoPayload,
} from "@/lib/projetos";

const PROJETOS_KEY = ["projetos"] as const;

/** Invalida projetos e tudo que é agregado a partir deles. */
function useInvalidarProjetos() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: PROJETOS_KEY });
    void qc.invalidateQueries({ queryKey: ["projetos-resumo"] });
    void qc.invalidateQueries({ queryKey: ["defeitos"] });
  };
}

export function useProjetos() {
  return useQuery({ queryKey: PROJETOS_KEY, queryFn: () => listarProjetos() });
}

export function useResumoProjetos(projetoId?: string | null) {
  return useQuery({
    queryKey: ["projetos-resumo", projetoId ?? "todos"],
    queryFn: () => obterResumo(projetoId),
  });
}

export function useCriarProjeto() {
  const invalidar = useInvalidarProjetos();
  return useMutation({
    mutationFn: (payload: NovoProjetoPayload) => criarProjeto(payload),
    onSuccess: invalidar,
  });
}

export function useAtualizarProjeto() {
  const invalidar = useInvalidarProjetos();
  return useMutation({
    mutationFn: (vars: { id: string; payload: AtualizarProjetoPayload }) =>
      atualizarProjeto(vars.id, vars.payload),
    onSuccess: invalidar,
  });
}

export function useRemoverProjeto() {
  const invalidar = useInvalidarProjetos();
  return useMutation({
    mutationFn: (id: string) => removerProjeto(id),
    onSuccess: invalidar,
  });
}

export function useAtribuirProjeto() {
  const invalidar = useInvalidarProjetos();
  return useMutation({
    mutationFn: (vars: { defeitoId: string; projetoId: string | null }) =>
      atribuirProjetoAoDefeito(vars.defeitoId, vars.projetoId),
    onSuccess: invalidar,
  });
}
