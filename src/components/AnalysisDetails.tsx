import { Clock3 } from "lucide-react";
import type { GraphData } from "../graph/Graph";
import type { Analysis } from "../services/analyzeNetwork";
export function AnalysisDetails({
  analysis: a,
  graph,
  selectPoint,
}: {
  analysis: Analysis;
  graph: GraphData;
  selectPoint: (id: string) => void;
}) {
  const name = (id: string) =>
    graph.vertices.find((v) => v.id === id)?.name ?? id;
  return (
    <details className="analysis-details">
      <summary>
        Entenda o resultado{" "}
        <span>
          <Clock3 size={12} /> {a.timing.total.toFixed(3)} ms
        </span>
      </summary>
      <div className="details-content">
        <div>
          <h3>Conectividade e graus</h3>
          <p>
            BFS:{" "}
            {a.connected
              ? "todos os enlaces na mesma componente"
              : `${a.components.length} componentes separadas`}
            . {a.odd.length} pontos ímpares.
          </p>
          {a.odd.length > 0 && (
            <div className="odd-list">
              {a.odd.map((id) => (
                <button key={id} onClick={() => selectPoint(id)}>
                  {name(id)} · grau {a.degrees.get(id)}
                </button>
              ))}
            </div>
          )}
          <p>
            {a.isolated.length
              ? `${a.isolated.length} ponto(s) isolado(s), fora da rota: ${a.isolated.map(name).join(", ")}. Não possuem enlaces a inspecionar.`
              : "Nenhum ponto isolado."}
          </p>
        </div>
        <div>
          <h3>Tempo real de execução</h3>
          <dl>
            <dt>Análise (modelo + BFS + graus)</dt>
            <dd>{a.timing.analysis.toFixed(3)} ms</dd>
            <dt>Construção (Hierholzer)</dt>
            <dd>{a.timing.construction.toFixed(3)} ms</dd>
            <dt>Validação independente</dt>
            <dd>{a.timing.validation.toFixed(3)} ms</dd>
            <dt>Total</dt>
            <dd>{a.timing.total.toFixed(3)} ms</dd>
          </dl>
        </div>
      </div>
      {a.route && (
        <div className="route-sequence">
          <h3>Percurso completo · {a.route.edges.length} enlaces</h3>
          <p>{a.route.vertices.map(name).join(" → ")}</p>
          <small>
            Hierholzer usa uma pilha para explorar e combinar percursos. A
            reprodução abaixo apresenta a rota final validada.
          </small>
        </div>
      )}
    </details>
  );
}
