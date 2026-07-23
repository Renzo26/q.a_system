import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, Plus, Github, ArrowRight } from "lucide-react";
import { useCopilotChat } from "@/hooks/useCopilotChat";
import { ChatMessage } from "@/components/copilot/ChatMessage";
import { Composer } from "@/components/copilot/Composer";
import { PromptStarters } from "@/components/copilot/PromptStarters";
import { ContextPanel } from "@/components/copilot/ContextPanel";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

function NoRepo() {
  const navigate = useNavigate();
  return (
    <div className="grid h-full place-items-center px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-shell text-brand shadow-card">
          <Sparkles className="size-7" />
        </span>
        <h1 className="mt-5 font-display text-[22px] font-bold tracking-tight text-ink">
          Conecte um repositório para falar com o Argus
        </h1>
        <p className="mt-2 text-[14px] text-ink-soft">
          O agente precisa de um repositório para analisar pull requests, riscos e cobertura.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="brand" size="lg" onClick={() => navigate({ to: "/conectar" })}>
            <Github className="size-[18px]" />
            Conectar repositório
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Copilot() {
  const { repo } = useAuth();
  const { messages, busy, send, reset } = useCopilotChat();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (!repo) return <NoRepo />;

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
              IA · mock
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
