import { Graph, type GraphData } from "../graph/Graph";
import { analyzeEulerian } from "../graph/EulerianAnalyzer";
import { hierholzer, type Route } from "../graph/Hierholzer";
import { validateRoute } from "../graph/GraphValidator";
export function analyzeNetwork(data: GraphData) {
  const begin = performance.now();
  const graph = new Graph(data);
  const classification = analyzeEulerian(graph);
  const classified = performance.now();
  let route: Route | null = null;
  if (classification.kind === "cycle" || classification.kind === "path")
    route = hierholzer(
      graph,
      classification.odd[0] ??
        data.vertices.find((v) => graph.degrees.get(v.id)! > 0)!.id,
    );
  const built = performance.now();
  const validation = route ? validateRoute(data, route) : null;
  const finished = performance.now();
  return {
    ...classification,
    degrees: graph.degrees,
    route,
    validation,
    timing: {
      analysis: classified - begin,
      construction: built - classified,
      validation: finished - built,
      total: finished - begin,
    },
  };
}
export type Analysis = ReturnType<typeof analyzeNetwork>;
