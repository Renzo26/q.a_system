import { Sun, Moon } from "lucide-react";
import { theme, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTheme();
  const dark = t === "dark";
  return (
    <button
      type="button"
      onClick={() => theme.toggle()}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:text-ink",
        className,
      )}
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
    >
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}
