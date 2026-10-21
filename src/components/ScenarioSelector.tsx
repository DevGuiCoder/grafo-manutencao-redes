import { CircleDot, ArrowUpRight } from "lucide-react";
import { scenarios } from "../data/scenarios";
import { genericScenario } from "../data/genericScenario";
import { Modal } from "./Modal";
import type { GraphData } from "../graph/Graph";
export function ScenarioSelector({
  close,
  load,
  loadGeneric,
}: {
  close: () => void;
  load: (id: string) => void;
  loadGeneric: (graph: GraphData) => void;
}) {
  return (
    <Modal title="Cenários" close={close} wide>
      <p className="muted">
        Explore grafos diferentes. Carregar um cenário substitui a rede do
        editor; exporte sua rede para guardá-la.
      </p>
      <div className="scenario-grid">
        <button onClick={() => loadGeneric(genericScenario)}>
          <CircleDot size={24} />
          <strong>Rede Principal</strong>
          <small>12 pontos · 15 enlaces</small>
          <p>Grafo genérico com ciclo Euleriano. Nós N1 a N12.</p>
          <ArrowUpRight size={16} />
        </button>
        {scenarios.map((s) => (
          <button key={s.id} onClick={() => load(s.id)}>
            <CircleDot size={24} />
            <strong>{s.title}</strong>
            <small>
              {s.graph.vertices.length} pontos · {s.graph.edges.length} enlaces
            </small>
            <p>{s.description}</p>
            <ArrowUpRight size={16} />
          </button>
        ))}
      </div>
    </Modal>
  );
}
