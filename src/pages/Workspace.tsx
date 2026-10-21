import { Check, Pencil, Trash2, X, MousePointer2 } from "lucide-react";
import type { Connection } from "@xyflow/react";
import { useNetworkWorkspace } from "../hooks/useNetworkWorkspace";
import { AppHeader } from "../components/AppHeader";
import { AppSidebar } from "../components/AppSidebar";
import { GraphCanvas } from "../components/GraphCanvas";
import { AnalysisPanel } from "../components/AnalysisPanel";
import { WorkspaceDialogs } from "../components/WorkspaceDialogs";
import { genericScenario } from "../data/genericScenario";
export function Workspace() {
  const s = useNetworkWorkspace();
  const {
    graph,
    analysis,
    degrees,
    playback,
    showDegrees,
    setShowDegrees,
    selected,
    mode,
    connectFrom,
    setConnectFrom,
    setSelected,
    setNodeDraft,
    changes,
    connect,
    setInstance,
    instance,
    remove,
    addDialog,
    graphKey,
    selectedNode,
    selectedEdge,
    notify,
    setMode,
    toast,
    setToast,
    action,
    replace,
  } = s;
  return (
    <div className="app-shell">
      <AppSidebar action={action} />
      <main className="workspace-grid">
        <div className="editor-wrap">
          <GraphCanvas
            key={graphKey}
            graph={graph}
            degrees={degrees}
            analysis={analysis}
            playback={playback}
            showDegrees={showDegrees}
            toggleDegrees={() => setShowDegrees((v) => !v)}
            selected={selected}
            mode={mode}
            connectFrom={connectFrom}
            onNodeClick={(id) => {
              if (mode === "connect") {
                if (!connectFrom) setConnectFrom(id);
                else connect(connectFrom, id);
              } else setSelected({ type: "node", id });
            }}
            onEdgeClick={(id) => setSelected({ type: "edge", id })}
            onPaneClick={(position) => {
              if (mode === "add") setNodeDraft({ position });
              else setSelected(null);
            }}
            onChanges={changes}
            onConnect={(c: Connection) => connect(c.source, c.target)}
            onInit={setInstance}
            instance={instance}
            onDelete={remove}
            add={addDialog}
            example={() => replace(genericScenario)}
            action={action}
          />
          {(selectedNode || selectedEdge) && (
            <div className="selection-toolbar">
              <div>
                <strong>{selectedNode?.name ?? "Enlace selecionado"}</strong>
                <small>
                  {selectedNode
                    ? `${selectedNode.type} · Grau ${degrees.get(selectedNode.id)}`
                    : `${graph.vertices.find((v) => v.id === selectedEdge?.a)?.name} ↔ ${graph.vertices.find((v) => v.id === selectedEdge?.b)?.name}`}
                </small>
              </div>
              {selectedNode && (
                <button
                  onClick={() =>
                    setNodeDraft({
                      vertex: selectedNode,
                      position: { x: selectedNode.x, y: selectedNode.y },
                    })
                  }
                >
                  <Pencil size={14} /> Editar
                </button>
              )}
              <button
                className="danger-text"
                onClick={() => {
                  remove(
                    selectedNode ? [selectedNode.id] : [],
                    selectedEdge ? [selectedEdge.id] : [],
                  );
                  notify("Elemento removido.");
                }}
              >
                <Trash2 size={14} /> Remover
              </button>
              <button
                className="icon-button"
                aria-label="Desmarcar seleção"
                onClick={() => setSelected(null)}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {mode !== "select" && (
            <button
              className="cancel-mode"
              onClick={() => {
                setMode("select");
                setConnectFrom(null);
              }}
            >
              <MousePointer2 size={13} /> Voltar à seleção
            </button>
          )}
        </div>
        <aside className="insight-column">
          <AppHeader
            graph={graph}
            analysis={analysis}
            analyzedAt={s.analyzedAt}
            busy={s.busy}
            action={action}
            analyze={s.analyze}
            select={s.selectElement}
          />
          <AnalysisPanel
            analysis={analysis}
            graph={graph}
            degrees={degrees}
            playback={playback}
            selectPoint={(id) => s.selectElement("node", id)}
          />
        </aside>
      </main>
      <footer className="main-footer">
        <span>Grafo de Manutenção de Redes</span>
        <span>Grafo não direcionado · Não ponderado</span>
      </footer>
      <WorkspaceDialogs state={s} />
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast.message}
          <button
            className="icon-button"
            onClick={() => setToast(null)}
            aria-label="Fechar notificação"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
