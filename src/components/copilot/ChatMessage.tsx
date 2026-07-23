import { Sparkles } from "lucide-react";
import { MessageBlock } from "./MessageBlocks";
import { useAuth } from "@/lib/auth";
import type { ChatMessage as Msg } from "@/hooks/useCopilotChat";

function AgentAvatar() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-shell text-brand shadow-card">
      <Sparkles className="size-4" />
    </span>
  );
}

export function ChatMessage({ message }: { message: Msg }) {
  const { user } = useAuth();

  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-4 py-2.5 text-[14px] leading-relaxed text-surface">
          {message.text}
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-shell-3 text-[12px] font-semibold text-brand">
          {user?.initials ?? "EU"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 sm:gap-3">
      <AgentAvatar />
      <div className="min-w-0 flex-1 space-y-3 lg:max-w-[85%]">
        {message.blocks.map((block, i) => (
          <MessageBlock key={i} block={block} />
        ))}
        {message.streaming && message.blocks.length === 0 && (
          <div className="flex items-center gap-1.5 py-1 text-[13px] text-ink-mute">
            <span className="size-1.5 animate-bounce rounded-full bg-ink-mute [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-ink-mute [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-ink-mute" />
          </div>
        )}
      </div>
    </div>
  );
}
