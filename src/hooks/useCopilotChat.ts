import { useCallback, useRef, useState } from "react";
import type { Block } from "@/lib/copilotEngine";
import { enviarArgus, type ArgusMessage } from "@/lib/argus";
import { auth } from "@/lib/auth";
import { sleep, uid } from "@/lib/utils";

export interface UserMessage {
  id: string;
  role: "user";
  text: string;
}

export interface AgentMessage {
  id: string;
  role: "agent";
  blocks: Block[];
  streaming: boolean;
}

export type ChatMessage = UserMessage | AgentMessage;

function textoDoAgente(m: AgentMessage): string {
  return m.blocks
    .filter((b): b is Extract<Block, { kind: "text" }> => b.kind === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

export function useCopilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const patchAgent = useCallback((id: string, fn: (m: AgentMessage) => AgentMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id && m.role === "agent" ? fn(m) : m)));
  }, []);

  const appendBlock = useCallback(
    (id: string, block: Block) => patchAgent(id, (m) => ({ ...m, blocks: [...m.blocks, block] })),
    [patchAgent],
  );

  const updateLastBlock = useCallback(
    (id: string, fn: (b: Block) => Block) =>
      patchAgent(id, (m) => ({
        ...m,
        blocks: m.blocks.map((b, i) => (i === m.blocks.length - 1 ? fn(b) : b)),
      })),
    [patchAgent],
  );

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);

      // Monta o histórico a partir das mensagens atuais + a nova pergunta.
      const history: ArgusMessage[] = [];
      for (const m of messagesRef.current) {
        if (m.role === "user") history.push({ role: "user", content: m.text });
        else {
          const t = textoDoAgente(m);
          if (t) history.push({ role: "assistant", content: t });
        }
      }
      history.push({ role: "user", content: text });

      const agentId = uid("agent");
      setMessages((prev) => [
        ...prev,
        { id: uid("user"), role: "user", text },
        { id: agentId, role: "agent", blocks: [], streaming: true },
      ]);

      // Indicador "pensando".
      appendBlock(agentId, { kind: "steps", steps: ["Consultando os dados do projeto…"], revealed: 1, done: false });

      try {
        const { reply } = await enviarArgus(history, auth.snapshot().repo);
        updateLastBlock(agentId, (b) => (b.kind === "steps" ? { ...b, done: true } : b));

        appendBlock(agentId, { kind: "text", text: "" });
        const words = reply.split(" ");
        let acc = "";
        for (const w of words) {
          acc += (acc ? " " : "") + w;
          await sleep(10);
          updateLastBlock(agentId, (b) => (b.kind === "text" ? { ...b, text: acc } : b));
        }
      } catch (e) {
        updateLastBlock(agentId, (b) => (b.kind === "steps" ? { ...b, done: true } : b));
        appendBlock(agentId, {
          kind: "text",
          text: e instanceof Error ? `⚠️ ${e.message}` : "Não consegui falar com o Argus agora.",
        });
      }

      patchAgent(agentId, (m) => ({ ...m, streaming: false }));
      busyRef.current = false;
      setBusy(false);
    },
    [appendBlock, updateLastBlock, patchAgent],
  );

  const reset = useCallback(() => {
    if (busyRef.current) return;
    setMessages([]);
  }, []);

  return { messages, busy, send, reset };
}
