import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, AtSign, Slash } from "lucide-react";
import { cn } from "@/lib/utils";

export function Composer({ onSend, busy }: { onSend: (text: string) => void; busy: boolean }) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const t = value.trim();
    if (!t || busy) return;
    onSend(t);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function autoGrow() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="border-t border-line bg-canvas/80 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-surface p-2 pl-4 transition-all",
            busy ? "border-line" : "border-line focus-within:border-ink/30 focus-within:ring-4 focus-within:ring-brand/25",
          )}
        >
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autoGrow();
            }}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Pergunte ao Argus sobre um PR, risco, cobertura ou release…"
            className="max-h-40 flex-1 resize-none self-center bg-transparent py-2 text-[14px] text-ink outline-none placeholder:text-ink-mute"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !value.trim()}
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-ink transition-all hover:bg-brand-bright disabled:opacity-40"
            aria-label="Enviar"
          >
            <ArrowUp className="size-[18px]" strokeWidth={2.5} />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[10.5px] text-ink-mute">
          <span className="flex items-center gap-1">
            <Slash className="size-3" />
            /plano /risco /release
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <AtSign className="size-3" />
            @PR @módulo @release
          </span>
          <span className="hidden sm:inline">Enter envia · Shift+Enter quebra linha</span>
        </div>
      </div>
    </div>
  );
}
