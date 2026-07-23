import { Link } from "@tanstack/react-router";
import { Github, Bell, RefreshCw, GitBranch, Plus, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { detectRepo } from "@/lib/repoMeta";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { repo } = useAuth();
  const meta = repo ? detectRepo(repo.owner, repo.repo) : null;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-canvas/85 px-3 backdrop-blur-xl sm:gap-4 sm:px-6">
      {/* Menu (mobile) */}
      <button
        type="button"
        onClick={onMenu}
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:text-ink lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-[18px]" />
      </button>

      {repo && meta ? (
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-2 sm:gap-3 sm:px-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-brand">
            <Github className="size-4" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-mono text-[12.5px] font-semibold text-ink">
              {repo.owner}/{repo.repo}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-ink-mute">
              <GitBranch className="size-3" />
              {meta.defaultBranch}
            </span>
          </span>
        </div>
      ) : (
        <Link
          to="/conectar"
          className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-dashed border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
        >
          <Plus className="size-4 shrink-0" />
          <span className="truncate">Conectar repositório</span>
        </Link>
      )}

      {repo && (
        <span className="hidden items-center gap-1.5 rounded-full bg-risk-low-soft px-2.5 py-1 text-[11px] font-semibold text-risk-low md:inline-flex">
          <RefreshCw className="size-3" />
          Sincronizado
        </span>
      )}

      <div className="flex-1" />

      <ThemeToggle />

      <button
        type="button"
        className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:text-ink"
        aria-label="Notificações"
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-risk-high ring-2 ring-surface" />
      </button>
    </header>
  );
}
