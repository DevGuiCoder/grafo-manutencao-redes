import { useState } from "react";
import { Upload, FileJson } from "lucide-react";
import { Modal } from "./Modal";
import { importNetwork } from "../services/networkFiles";
import type { GraphData } from "../graph/Graph";
export function ImportDialog({
  load,
  close,
}: {
  load: (data: GraphData) => void;
  close: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Importar rede" close={close}>
      <p className="muted">
        O arquivo será validado antes de substituir a rede atual. Exporte sua
        rede se quiser guardá-la.
      </p>
      <label className="file-drop">
        <Upload size={30} />
        <strong>
          {busy ? "Lendo arquivo…" : "Selecionar arquivo JSON ou CSV"}
        </strong>
        <span>Até 2 MB · 1.000 pontos · 5.000 enlaces</span>
        <input
          aria-label="Arquivo da rede"
          type="file"
          accept=".json,.csv"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError("");
            try {
              if (file.size > 2_000_000)
                throw new Error("O arquivo excede o limite de 2 MB.");
              load(importNetwork(await file.text(), file.name));
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
      <h3>
        <FileJson size={17} /> CSV simplificado
      </h3>
      <pre>
        origem,destino{"\n"}N1,N2{"\n"}N2,N3
      </pre>
      <p className="muted small">
        Nesse formato, os pontos são criados automaticamente. O CSV completo
        exportado preserva tipos, posições e pontos isolados, assim como o JSON.
      </p>
    </Modal>
  );
}
