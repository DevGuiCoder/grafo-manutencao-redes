import { useState } from "react";
import { vertexTypes, type Vertex } from "../graph/Vertex";
import { Modal } from "./Modal";
import { equipmentIcon } from "./equipmentAppearance";

export function NodeDialog({
  vertex,
  position,
  save,
  close,
}: {
  vertex?: Vertex;
  position: { x: number; y: number };
  save: (v: Vertex) => void;
  close: () => void;
}) {
  const [name, setName] = useState(vertex?.name ?? "");
  const [type, setType] = useState<Vertex["type"]>(vertex?.type ?? "Genérico");
  const [metadata, setMetadata] = useState(
    vertex?.metadata ? JSON.stringify(vertex.metadata, null, 2) : "",
  );
  const [error, setError] = useState("");
  return (
    <Modal title={vertex ? "Editar ponto" : "Novo ponto da rede"} close={close}>
      <p className="muted">
        Represente uma entidade, local ou ponto da sua rede.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          let attributes: Record<string, unknown> | undefined;
          try {
            attributes = metadata.trim() ? JSON.parse(metadata) : undefined;
            if (
              attributes !== undefined &&
              (attributes === null ||
                Array.isArray(attributes) ||
                typeof attributes !== "object")
            )
              throw new Error();
          } catch {
            setError("Informe um objeto JSON válido para os atributos.");
            return;
          }
          if (name.trim())
            save({
              ...vertex,
              id: vertex?.id ?? crypto.randomUUID(),
              name: name.trim(),
              type,
              metadata: attributes,
              ...position,
            });
        }}
      >
        <label>
          Nome do ponto
          <input
            autoFocus
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: N1, Estação A, Pessoa 01"
          />
        </label>
        <fieldset className="equipment-picker">
          <legend>Tipo do nó</legend>
          <div className="equipment-options">
            {vertexTypes.map((t) => {
              const EquipmentIcon = equipmentIcon[t];
              return (
                <label className="equipment-option" key={t}>
                  <input
                    type="radio"
                    name="equipment-type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                  />
                  <EquipmentIcon
                    size={21}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <span>{t}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <details className="metadata-fields">
          <summary>Atributos opcionais</summary>
          <label>
            Metadados em JSON
            <textarea
              aria-label="Metadados em JSON"
              value={metadata}
              onChange={(e) => {
                setMetadata(e.target.value);
                setError("");
              }}
              placeholder={'{"categoria": "estação"}'}
              rows={4}
            />
          </label>
          <small>
            Os atributos são preservados na exportação e podem ser pesquisados.
          </small>
        </details>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" onClick={close}>
            Cancelar
          </button>
          <button className="primary" disabled={!name.trim()}>
            {vertex ? "Salvar alterações" : "Adicionar ponto"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
