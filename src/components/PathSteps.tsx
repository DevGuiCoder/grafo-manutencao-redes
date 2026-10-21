import { useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import type { GraphData } from "../graph/Graph";
import type { Route } from "../graph/Hierholzer";
export function PathSteps({
  route,
  graph,
  step,
  seek,
}: {
  route: Route;
  graph: GraphData;
  step: number;
  seek: (step: number) => void;
}) {
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const parent = strip.current;
    const active = parent?.querySelector<HTMLElement>('[aria-current="step"]');
    if (parent && active)
      parent.scrollTo({
        left:
          active.offsetLeft - parent.clientWidth / 2 + active.clientWidth / 2,
        behavior: "smooth",
      });
  }, [step]);
  return (
    <div className="path-steps" ref={strip} aria-label="Sequência do percurso">
      {route.vertices.map((id, i) => (
        <span key={`${id}-${i}`}>
          <button
            title={`${i === 0 ? "Início" : `Após aresta ${i}`}: ${graph.vertices.find((v) => v.id === id)?.name}`}
            aria-label={`Ir para etapa ${i}: ${graph.vertices.find((v) => v.id === id)?.name}`}
            aria-current={i === step ? "step" : undefined}
            onClick={() => seek(i)}
          >
            {graph.vertices.find((v) => v.id === id)?.name ?? id}
          </button>
          {i < route.vertices.length - 1 && <ChevronRight size={12} />}
        </span>
      ))}
    </div>
  );
}
