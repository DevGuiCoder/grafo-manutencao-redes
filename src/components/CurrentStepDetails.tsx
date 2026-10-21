import { ArrowRightCircle, CheckCircle2 } from "lucide-react";
import type { GraphData } from "../graph/Graph";
import type { Route } from "../graph/Hierholzer";
export function CurrentStepDetails({
  graph,
  route,
  step,
  playing,
}: {
  graph: GraphData;
  route: Route;
  step: number;
  playing: boolean;
}) {
  const index = playing
    ? Math.min(step, route.edges.length - 1)
    : Math.max(0, step - 1);
  const name = (id: string) =>
    graph.vertices.find((v) => v.id === id)?.name ?? id;
  const from = name(route.vertices[index]);
  const to = name(route.vertices[index + 1]);
  return (
    <div className="current-step">
      <h3>
        Detalhes do passo atual{" "}
        <span>
          {step === route.edges.length
            ? "Concluído"
            : playing
              ? "Em reprodução"
              : step === 0
                ? "Pronto para iniciar"
                : "Pausado"}
        </span>
      </h3>
      <div className="step-detail-grid">
        <p>
          {step === route.edges.length ? (
            <CheckCircle2 size={22} />
          ) : (
            <ArrowRightCircle size={22} />
          )}
          <span>
            De <strong>{from}</strong> para <strong>{to}</strong>
          </span>
        </p>
        <dl>
          <dt>Aresta {index + 1}</dt>
          <dd title={route.edges[index]}>
            ({from}, {to})
          </dd>
        </dl>
      </div>
    </div>
  );
}
