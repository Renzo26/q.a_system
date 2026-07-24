import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Sparkles, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { navItems } from "@/config/nav";
import { auth, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const navigate = useNavigate();
  const { user, repo } = useAuth();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[264px] max-w-[82vw] flex-col bg-shell transition-transform duration-300 ease-[var(--ease-out-quart)]",
        "lg:static lg:z-auto lg:w-[248px] lg:max-w-none lg:translate-x-0",
        open ? "translate-x-0 shadow-pop" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-6">
        <Logo variant="dark" size="md" />
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-lg text-shell-mute transition-colors hover:bg-shell-2 hover:text-shell-ink lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="px-3 pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-shell-mute">
        Módulos
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClose}
            className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-shell-soft transition-colors duration-200 hover:bg-shell-2 hover:text-shell-ink"
            activeProps={{ className: "!bg-shell-2 !text-shell-ink" }}
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand transition-opacity duration-200",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
                <item.icon
                  className={cn(
                    "size-[18px] shrink-0 transition-colors",
                    isActive ? "text-brand" : "text-shell-mute group-hover:text-shell-soft",
                  )}
                  strokeWidth={2}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.to === "/conectar" && (
                  <span
                    className={cn("size-2 rounded-full", repo ? "bg-risk-low" : "bg-shell-3 ring-1 ring-shell-line")}
                    title={repo ? "Repositório conectado" : "Nenhum repositório"}
                  />
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Copilot status */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-3 rounded-xl bg-shell-2 px-3 py-2.5">
          <span className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-brand/15">
            <Sparkles className="size-4 text-brand" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 animate-pulse-ring rounded-full bg-risk-low ring-2 ring-shell-2" />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[12.5px] font-semibold text-shell-ink">Assistente Q.A ativo</div>
            <div className="truncate font-mono text-[10.5px] text-shell-mute">
              {repo ? `${repo.repo}` : "aguardando repo"}
            </div>
          </div>
        </div>
      </div>

      {/* Usuário + logout */}
      <div className="border-t border-shell-line p-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-shell-3 text-[13px] font-semibold text-brand">
            {user?.initials ?? "?"}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13px] font-semibold text-shell-ink">{user?.name ?? "Visitante"}</div>
            <div className="truncate font-mono text-[10.5px] text-shell-mute">
              {user?.via === "github" ? "via GitHub" : user?.email}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose?.();
              auth.logout();
              navigate({ to: "/login" });
            }}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-shell-mute transition-colors hover:bg-shell-2 hover:text-risk-high"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="size-[17px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
