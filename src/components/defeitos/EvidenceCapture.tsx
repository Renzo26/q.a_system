import { useCallback, useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  MonitorPlay,
  Square,
  X,
  FileVideo,
  FileText,
  Braces,
  Paperclip,
  Clipboard,
  Dot,
} from "lucide-react";
import { cn, uid } from "@/lib/utils";
import { formatBytes, type EvidenciaDraft, type TipoEvidencia } from "@/lib/defeitos";

function tipoFromMime(mime: string): TipoEvidencia {
  if (mime.startsWith("image/")) return "imagem";
  if (mime.startsWith("video/")) return "video";
  return "arquivo";
}

const tipoIcon: Record<Exclude<TipoEvidencia, "imagem">, typeof FileVideo> = {
  video: FileVideo,
  log: FileText,
  request_response: Braces,
  arquivo: Paperclip,
};

function pickRecordMime() {
  const cands = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
  for (const c of cands) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

const canRecord =
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getDisplayMedia === "function" &&
  typeof MediaRecorder !== "undefined";

function draftFromFile(file: Blob, nome: string, tipo?: TipoEvidencia): EvidenciaDraft {
  return {
    id: uid("ev"),
    tipo: tipo ?? tipoFromMime(file.type),
    nome,
    previewUrl: URL.createObjectURL(file),
    tamanhoBytes: file.size,
    file,
  };
}

interface Props {
  value: EvidenciaDraft[];
  onChange: (next: EvidenciaDraft[]) => void;
}

export function EvidenceCapture({ value, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const valueRef = useRef(value);
  valueRef.current = value;

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const addFiles = useCallback(
    (files: File[]) => {
      const novas = files.map((f) => draftFromFile(f, f.name || `arquivo-${Date.now()}`));
      if (novas.length) onChange([...valueRef.current, ...novas]);
    },
    [onChange],
  );

  const remove = useCallback(
    (id: string) => {
      const alvo = valueRef.current.find((e) => e.id === id);
      if (alvo) URL.revokeObjectURL(alvo.previewUrl);
      onChange(valueRef.current.filter((e) => e.id !== id));
    },
    [onChange],
  );

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const it of items) {
        if (it.kind === "file") {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        addFiles(files);
      }
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [addFiles]);

  function stopTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function startRecording() {
    setErro(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const mimeType = pickRecordMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        stream.getTracks().forEach((t) => t.stop());
        const stamp = new Date().toISOString().slice(11, 19).replace(/:/g, "-");
        onChange([...valueRef.current, draftFromFile(blob, `gravacao-${stamp}.webm`, "video")]);
        setRecording(false);
        stopTimer();
        setElapsed(0);
      };

      const [track] = stream.getVideoTracks();
      track?.addEventListener("ended", () => {
        if (recorder.state !== "inactive") recorder.stop();
      });

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") return;
      setErro("Não foi possível iniciar a gravação de tela neste navegador.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  useEffect(() => () => stopTimer(), []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "rounded-tile border border-dashed bg-surface-2/60 px-4 py-5 text-center transition-colors",
          dragging ? "border-brand-deep bg-brand-soft/40" : "border-line",
        )}
      >
        <UploadCloud className="mx-auto size-6 text-ink-mute" strokeWidth={1.8} />
        <div className="mt-2 text-[13px] text-ink-soft">
          Arraste prints e vídeos aqui, ou{" "}
          <label className="cursor-pointer font-semibold text-ink underline decoration-brand-deep decoration-2 underline-offset-2">
            selecione arquivos
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <div className="mt-1 flex items-center justify-center gap-1 font-mono text-[11px] text-ink-mute">
          <Clipboard className="size-3" />
          Ctrl+V cola um print da área de transferência
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={!canRecord}
            title={canRecord ? undefined : "Gravação de tela indisponível neste navegador"}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-55"
          >
            <MonitorPlay className="size-4 text-brand-deep" />
            Gravar tela
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 rounded-xl bg-risk-high px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-risk-high/90"
          >
            <Square className="size-3.5 fill-current" />
            Parar gravação
            <span className="flex items-center font-mono text-[12px] tabular-nums">
              <Dot className="size-4 animate-pulse text-white" />
              {mm}:{ss}
            </span>
          </button>
        )}
        <span className="text-[11.5px] text-ink-mute">
          {value.length > 0 ? `${value.length} evidência(s) anexada(s)` : "Nenhuma evidência ainda"}
        </span>
      </div>

      {erro && <p className="text-[12px] font-medium text-risk-high">{erro}</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((ev) => {
            const Icon = ev.tipo === "imagem" ? null : tipoIcon[ev.tipo];
            return (
              <div
                key={ev.id}
                className="group relative overflow-hidden rounded-tile border border-line bg-surface-2"
              >
                {ev.tipo === "imagem" ? (
                  <img src={ev.previewUrl} alt={ev.nome} className="h-24 w-full object-cover" />
                ) : ev.tipo === "video" ? (
                  <video src={ev.previewUrl} className="h-24 w-full bg-black object-contain" muted playsInline />
                ) : (
                  <div className="grid h-24 w-full place-items-center text-ink-mute">
                    {Icon && <Icon className="size-7" strokeWidth={1.6} />}
                  </div>
                )}
                <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                  <span className="truncate font-mono text-[10.5px] text-ink-soft" title={ev.nome}>
                    {ev.nome}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-ink-mute">
                    {formatBytes(ev.tamanhoBytes)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(ev.id)}
                  className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-lg bg-ink/70 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-risk-high group-hover:opacity-100"
                  aria-label={`Remover ${ev.nome}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
