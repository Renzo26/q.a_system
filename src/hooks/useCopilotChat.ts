import { useCallback, useRef, useState } from "react";
import { buildTurn, type Block } from "@/lib/copilotEngine";
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

export function useCopilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

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

      const agentId = uid("agent");
      setMessages((prev) => [
        ...prev,
        { id: uid("user"), role: "user", text },
        { id: agentId, role: "agent", blocks: [], streaming: true },
      ]);

      const blocks = buildTurn(text);

      for (const block of blocks) {
        if (block.kind === "steps") {
          appendBlock(agentId, { ...block, revealed: 0, done: false });
          for (let i = 1; i <= block.steps.length; i++) {
            await sleep(400);
            updateLastBlock(agentId, (b) => (b.kind === "steps" ? { ...b, revealed: i } : b));
          }
          updateLastBlock(agentId, (b) => (b.kind === "steps" ? { ...b, done: true } : b));
          await sleep(280);
        } else if (block.kind === "text") {
          appendBlock(agentId, { kind: "text", text: "" });
          const words = block.text.split(" ");
          let acc = "";
          for (const w of words) {
            acc += (acc ? " " : "") + w;
            await sleep(16);
            updateLastBlock(agentId, (b) => (b.kind === "text" ? { ...b, text: acc } : b));
          }
          await sleep(200);
        } else {
          await sleep(440);
          appendBlock(agentId, block);
        }
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
