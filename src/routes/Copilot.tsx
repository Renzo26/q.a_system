import { useEffect, useRef } from "react";
import { Sparkles, Plus } from "lucide-react";
import { useCopilotChat } from "@/hooks/useCopilotChat";
import { ChatMessage } from "@/components/copilot/ChatMessage";
import { Composer } from "@/components/copilot/Composer";
import { PromptStarters } from "@/components/copilot/PromptStarters";
import { ContextPanel } from "@/components/copilot/ContextPanel";

export function Copilot() {
  const { messages, busy, send, reset } = useCopilotChat();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const empty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0">
      {/* Coluna do chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-shell text-brand">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight text-ink">Argus</span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[10px] font-bold text-brand-deep">
              IA · OpenAI
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={busy || empty}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft transition-colors hover:border-ink/20 hover:text-ink disabled:opacity-40"
          >
            <Plus className="size-3.5" />
            Nova conversa
          </button>
        </header>

        <div className="scroll-slim flex-1 overflow-y-auto">
          {empty ? (
            <PromptStarters onPick={send} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-5 sm:px-5 sm:py-6">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <Composer onSend={send} busy={busy} />
      </div>

      {/* Painel de contexto */}
      <ContextPanel onAction={send} />
    </div>
  );
}
