import {
  MousePointer2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Plus,
  Link2,
  Upload,
  Download,
  Trash2,
  History,
  Hand,
  Focus,
} from "lucide-react";
import type { FlowInstance } from "./GraphCanvas";
export function GraphToolbar({
  instance,
  mode,
  action,
  showDegrees,
  toggleDegrees,
  panning,
  togglePanning,
  focused,
  toggleFocus,
  canFocus,
}: {
  instance: FlowInstance | null;
  mode: string;
  action: (id: string) => void;
  showDegrees: boolean;
  toggleDegrees: () => void;
  panning: boolean;
  togglePanning: () => void;
  focused: boolean;
  toggleFocus: () => void;
  canFocus: boolean;
}) {
  return (
    <>
      <div className="graph-view-controls">
        <button
          className={
            mode === "select" && !panning ? "active icon-button" : "icon-button"
          }
          title="Selecionar"
          aria-label="Selecionar"
          aria-pressed={mode === "select" && !panning}
          onClick={() => action("select")}
        >
          <MousePointer2 size={19} />
        </button>
        <button
          className={panning ? "active icon-button" : "icon-button"}
          aria-label="Mover canvas"
          title="Mover canvas"
          aria-pressed={panning}
          onClick={togglePanning}
        >
          <Hand size={18} />
        </button>
        <button
          className="icon-button"
          title="Aumentar zoom"
          aria-label="Aumentar zoom"
          onClick={() => instance?.zoomIn({ duration: 200 })}
        >
          <ZoomIn size={20} />
        </button>
        <button
          className="icon-button"
          title="Diminuir zoom"
          aria-label="Diminuir zoom"
          onClick={() => instance?.zoomOut({ duration: 200 })}
        >
          <ZoomOut size={20} />
        </button>
        <button
          className="icon-button"
          title="Ajustar à tela"
          aria-label="Ajustar à tela"
          onClick={() => instance?.fitView({ duration: 200, padding: 0.2 })}
        >
          <Maximize size={19} />
        </button>
        <select
          aria-label="Vista do grafo"
          value={showDegrees ? "degrees" : "standard"}
          onChange={toggleDegrees}
        >
          <option value="standard">Vista padrão</option>
          <option value="degrees">Mostrar graus</option>
        </select>
        <button
          className={focused ? "active icon-button" : "icon-button"}
          aria-label="Destacar apenas o percurso"
          title="Destacar apenas o percurso"
          aria-pressed={focused && canFocus}
          disabled={!canFocus}
          onClick={toggleFocus}
        >
          <Focus size={18} />
        </button>
      </div>
      <div className="graph-edit-tools" aria-label="Ferramentas do editor">
        {[
          {
            id: "add",
            name: "Adicionar ponto",
            label: "Adicionar nó",
            icon: Plus,
          },
          {
            id: "connect",
            name: "Conectar pontos",
            label: "Conectar",
            icon: Link2,
          },
          {
            id: "import",
            name: "Importar rede",
            label: "Importar",
            icon: Upload,
          },
          {
            id: "export",
            name: "Exportar rede",
            label: "Exportar",
            icon: Download,
          },
        ].map(({ id, name, label, icon: Icon }) => (
          <button
            key={id}
            className={mode === id ? "active" : ""}
            aria-label={name}
            title={name}
            onClick={() => action(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
        <span className="tool-divider" />
        <button
          className="icon-button"
          aria-label="Análises recentes"
          title="Análises recentes"
          onClick={() => action("history")}
        >
          <History size={17} />
        </button>
        <button
          className="icon-button"
          aria-label="Limpar rede"
          title="Limpar rede"
          onClick={() => action("clear")}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </>
  );
}
