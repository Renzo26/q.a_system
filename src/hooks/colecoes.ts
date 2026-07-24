import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  importarColecao,
  listarColecoes,
  obterColecao,
  removerColecao,
} from "@/lib/colecoes";

const COLECOES_KEY = ["colecoes"] as const;

export function useColecoes() {
  return useQuery({ queryKey: COLECOES_KEY, queryFn: listarColecoes });
}

export function useColecao(id: string | null) {
  return useQuery({
    queryKey: ["colecao", id],
    queryFn: () => obterColecao(id as string),
    enabled: !!id,
  });
}

export function useImportarColecao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importarColecao(file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: COLECOES_KEY });
    },
  });
}

export function useRemoverColecao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removerColecao(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: COLECOES_KEY });
    },
  });
}
