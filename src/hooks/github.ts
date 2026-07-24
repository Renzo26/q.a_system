import { useQuery } from "@tanstack/react-query";
import { obterRepoInfo } from "@/lib/github";

export function useRepoInfo(owner?: string, repo?: string) {
  return useQuery({
    queryKey: ["repo-info", owner, repo],
    queryFn: () => obterRepoInfo(owner as string, repo as string),
    enabled: !!owner && !!repo,
    retry: false,
    staleTime: 60_000,
  });
}
