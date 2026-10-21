import { Download } from "lucide-react";
import { Modal } from "./Modal";
import { NodeDialog } from "./NodeDialog";
import { ImportDialog } from "./ImportDialog";
import { ScenarioSelector } from "./ScenarioSelector";
import { AnalysisDetails } from "./AnalysisDetails";
import { resultLabels } from "../data/analysisLabels";
import { downloadNetwork } from "../services/networkFiles";
import { emptyGraph } from "../data/scenarios";
import type { NetworkWorkspace } from "../hooks/useNetworkWorkspace";
export function WorkspaceDialogs({ state: s }: { state: NetworkWorkspace }) {
  const {
    nodeDraft,
    setNodeDraft,
    graph,
    update,
    setMode,
    setSelected,
    notify,
    instance,
    dialog,
    setDialog,
    replace,
    history,
  } = s;
  return (
    <>
      {nodeDraft && (
        <NodeDialog
          vertex={nodeDraft.vertex}
          position={nodeDraft.position}
          close={() => setNodeDraft(null)}
          save={(v) => {
            if (!nodeDraft.vertex) {
              while (
                graph.vertices.some(
                  (point) =>
                    Math.abs(point.x - v.x) < 135 &&
                    Math.abs(point.y - v.y) < 125,
                )
              ) {
                v = { ...v, x: v.x + 155 };
              }
            }
            const next = {
              ...graph,
              vertices: nodeDraft.vertex
                ? graph.vertices.map((n) => (n.id === v.id ? v : n))
                : [...graph.vertices, v],
            };
            if (update(next)) {
              setNodeDraft(null);
              setMode("select");
              setSelected({ type: "node", id: v.id });
              notify(
                nodeDraft.vertex ? "Ponto atualizado." : "Ponto adicionado.",
              );
              window.setTimeout(
                () =>
                  instance?.fitView({
                    duration: 300,
                    padding: 0.2,
                    maxZoom: 1.2,
                  }),
                100,
              );
            }
          }}
        />
      )}
      {dialog === "import" && (
        <ImportDialog
          close={() => setDialog(null)}
          load={(data) => {
            replace(data);
            notify("Rede importada com sucesso.");
          }}
        />
      )}
      {dialog === "export" && (
        <Modal title="Exportar rede" close={() => setDialog(null)}>
          <p className="muted">
            Guarde sua rede completa, incluindo pontos isolados, coordenadas e
            metadados.
          </p>
          <div className="export-options">
            {(["json", "csv"] as const).map((format) => (
              <button
                key={format}
                onClick={() => {
                  downloadNetwork(
                    { ...graph, name: graph.name.trim() || "Minha rede" },
                    format,
                  );
                  notify(`Rede exportada em ${format.toUpperCase()}.`);
                  setDialog(null);
                }}
              >
                <Download size={23} />
                <strong>{format.toUpperCase()}</strong>
                <span>
                  {format === "json"
                    ? "Estrutura completa e legível"
                    : "Tabela com pontos e enlaces"}
                </span>
              </button>
            ))}
          </div>
        </Modal>
      )}
      {(dialog === "clear" || dialog === "new") && (
        <Modal
          title={
            dialog === "new" ? "Criar uma nova rede?" : "Limpar a rede atual?"
          }
          close={() => setDialog(null)}
        >
          <p>
            Os pontos e enlaces atuais serão removidos do editor. Exporte uma
            cópia para guardá-los; análises já salvas continuam no histórico.
          </p>
          <div className="modal-actions">
            <button onClick={() => setDialog(null)}>Cancelar</button>
            <button
              className="danger-button"
              onClick={() => {
                replace(emptyGraph());
                notify("Editor pronto para uma nova rede.");
              }}
            >
              Limpar e continuar
            </button>
          </div>
        </Modal>
      )}
      {dialog === "history" && (
        <Modal title="Análises recentes" close={() => setDialog(null)}>
          <p className="muted">
            As últimas cinco análises ficam neste navegador. Selecione uma para
            restaurar a rede e analisá-la novamente.
          </p>
          {history.length ? (
            <div className="history-list">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    replace(h.graph);
                    notify(
                      "Rede restaurada. Execute a análise para atualizar as métricas.",
                    );
                  }}
                >
                  <strong>{h.graph.name}</strong>
                  <span>{resultLabels[h.kind]}</span>
                  <small>
                    {new Date(h.date).toLocaleString("pt-BR")} ·{" "}
                    {h.time.toFixed(3)} ms
                  </small>
                </button>
              ))}
            </div>
          ) : (
            <div className="note">
              Nenhuma análise salva. Carregue um cenário e clique em Analisar
              rede.
            </div>
          )}
        </Modal>
      )}

      {dialog === "scenarios" && (
        <ScenarioSelector
          close={() => setDialog(null)}
          load={s.loadScenario}
          loadGeneric={(g) => {
            replace(g);
            notify("Rede Principal carregada.");
          }}
        />
      )}
      {dialog === "project" && (
        <Modal title="Projeto" close={() => setDialog(null)}>
          <label className="field-label">
            Nome da rede
            <input
              aria-label="Nome da rede"
              maxLength={100}
              value={graph.name}
              onChange={(e) =>
                s.setGraph((g) => ({ ...g, name: e.target.value }))
              }
            />
          </label>
          <div className="modal-actions">
            <button onClick={() => s.action("new")}>Nova rede</button>
            <button className="primary" onClick={() => setDialog(null)}>
              Concluir
            </button>
          </div>
        </Modal>
      )}
      {dialog === "reports" && (
        <Modal title="Relatório da análise" close={() => setDialog(null)} wide>
          {s.analysis ? (
            <>
              <p className="report-title">
                {graph.name} · {resultLabels[s.analysis.kind]}
              </p>
              <p>{s.analysis.explanation}</p>
              <AnalysisDetails
                analysis={s.analysis}
                graph={graph}
                selectPoint={(id) => {
                  setDialog(null);
                  s.selectElement("node", id);
                }}
              />
              <p className="muted">
                {s.analysis.validation
                  ? `${s.analysis.validation.used}/${s.analysis.validation.total} arestas verificadas · ${s.analysis.validation.valid ? "Percurso válido" : "Percurso inválido"}`
                  : "Não há percurso para validar."}
              </p>
            </>
          ) : (
            <div className="note">
              Execute uma análise para gerar o relatório da rede atual.
            </div>
          )}
          <div className="modal-actions">
            <button onClick={() => setDialog("history")}>
              Análises recentes
            </button>
            <button
              className="primary"
              disabled={!s.analysis}
              onClick={() => {
                const blob = new Blob(
                  [
                    JSON.stringify(
                      {
                        name: graph.name,
                        analyzedAt: s.analyzedAt,
                        analysis: {
                          ...s.analysis,
                          classification: resultLabels[s.analysis!.kind],
                          degrees: Object.fromEntries(s.analysis!.degrees),
                        },
                      },
                      null,
                      2,
                    ),
                  ],
                  { type: "application/json" },
                );
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "grafo-manutencao-analise.json";
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              Exportar relatório
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
