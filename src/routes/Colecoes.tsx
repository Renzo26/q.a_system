import { useRef, useState } from "react";
import {
  Workflow,
  UploadCloud,
  Loader2,
  FileJson,
  Trash2,
  AlertCircle,
  ServerCrash,
  Layers,
  FolderClosed,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ColecaoDetalheModal } from "@/components/colecoes/ColecaoDetalheModal";
import { useColecoes, useImportarColecao, useRemoverColecao } from "@/hooks/colecoes";
import { cn } from "@/lib/utils";
import type { ColecaoResumo } from "@/lib/colecoes";

function ImportZone() {
  const importar = useImportarColecao();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function enviar(files: FileList | File[]) {
    const file = Array.from(files).find((f) => f.name.endsWith(".json")) ?? Array.from(files)[0];
    if (file) importar.mutate(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          enviar(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-card border border-dashed bg-surface px-6 py-8 text-center transition-colors",
          dragging ? "border-brand-deep bg-brand-soft/30" : "border-line hover:border-ink/25",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) enviar(e.target.files);
            e.target.value = "";
          }}
        />
        {importar.isPending ? (
          <Loader2 className="mx-auto size-7 animate-spin text-brand-deep" />
        ) : (
          <UploadCloud className="mx-auto size-7 text-ink-mute" strokeWidth={1.8} />
        )}
        <p className="mt-2 text-[14px] font-semibold text-ink">
          {importar.isPending ? "Importando coleção…" : "Importar coleção do Postman"}
        </p>
        <p className="mt-1 text-[12.5px] text-ink-soft">
          Arraste o arquivo exportado (<span className="font-mono">Collection v2.1 .json</span>) ou clique para selecionar
        </p>
      </div>
      {importar.isError && (
        <p className="mt-2 flex items-center gap-1.5 rounded-tile bg-risk-high-soft px-3 py-2 text-[12.5px] font-medium text-risk-high">
          <AlertCircle className="size-4" />
          {importar.error instanceof Error ? importar.error.message : "Falha ao importar"}
        </p>
      )}
    </div>
  );
}

function ColecaoCard({
  colecao,
  onOpen,
  onRemove,
  removendo,
}: {
  colecao: ColecaoResumo;
  onOpen: () => void;
  onRemove: () => void;
  removendo: boolean;
}) {
  const [confirmar, setConfirmar] = useState(false);
  return (
    <Card interactive onClick={onOpen} className="animate-rise cursor-pointer p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-deep">
          <Workflow className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-ink">{colecao.nome}</h3>
          {colecao.descricao && (
            <p className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-soft">{colecao.descricao}</p>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          {confirmar ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg bg-risk-high px-2 py-1 text-[11px] font-semibold text-white hover:bg-risk-high/90"
              >
                {removendo ? "…" : "Excluir"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmar(false)}
                className="rounded-lg px-2 py-1 text-[11px] font-semibold text-ink-mute hover:text-ink"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmar(true)}
              className="grid size-8 place-items-center rounded-lg text-ink-mute transition-colors hover:bg-risk-high-soft hover:text-risk-high"
              aria-label="Excluir coleção"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line-soft pt-3 font-mono text-[11.5px] text-ink-mute">
        <span className="flex items-center gap-1">
          <FileJson className="size-3.5" />
          {colecao.totalRequests} requisições
        </span>
        <span className="flex items-center gap-1">
          <FolderClosed className="size-3.5" />
          {colecao.totalPastas} pastas
        </span>
        <span className="ml-auto flex items-center gap-1 font-semibold text-brand-deep">
          Ver fluxo
          <ChevronRight className="size-3.5" />
        </span>
      </div>
    </Card>
  );
}

export function Colecoes() {
  const { data: colecoes = [], isLoading, isError, error } = useColecoes();
  const remover = useRemoverColecao();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 sm:py-7">
      <div className="animate-rise">
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Coleções (Postman)</h1>
        <p className="mt-1 max-w-2xl text-[14px] text-ink-soft">
          Importe a coleção exportada do Postman e veja o fluxo mapeado numa linha do tempo legível —
          cada passo, o que ele faz e o que valida — fácil de entender até para quem é de fora do QA.
        </p>
      </div>

      <ImportZone />

      {isError ? (
        <Card className="grid place-items-center px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-risk-high-soft text-risk-high">
            <ServerCrash className="size-7" strokeWidth={1.7} />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">Não foi possível carregar as coleções</p>
          <p className="mt-1 text-[13px] text-ink-soft">
            {error instanceof Error ? error.message : "Erro desconhecido"} — verifique o backend em localhost:8080.
          </p>
        </Card>
      ) : isLoading ? (
        <div className="grid place-items-center py-20 text-ink-mute">
          <Loader2 className="size-7 animate-spin" />
          <p className="mt-3 text-[13px]">Carregando coleções…</p>
        </div>
      ) : colecoes.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {colecoes.map((c) => (
            <ColecaoCard
              key={c.id}
              colecao={c}
              onOpen={() => setSelectedId(c.id)}
              onRemove={() => remover.mutate(c.id)}
              removendo={remover.isPending && remover.variables === c.id}
            />
          ))}
        </div>
      ) : (
        <Card className="grid place-items-center px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-ink-mute">
            <Layers className="size-7" strokeWidth={1.7} />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">Nenhuma coleção importada</p>
          <p className="mt-1 text-[13px] text-ink-soft">
            Exporte uma coleção no Postman (Collection v2.1) e solte no campo acima.
          </p>
        </Card>
      )}

      <ColecaoDetalheModal colecaoId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
