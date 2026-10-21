import type { GraphData } from "./Graph";
import type { Route } from "./Hierholzer";
/** Independent certificate checker: does not use adjacency, degrees or Hierholzer internals. */
export function validateRoute(graph: GraphData, route: Route) {
  const known = new Map(graph.edges.map((e) => [e.id, e]));
  const vertexIds = new Set(graph.vertices.map((v) => v.id));
  const unique = new Set(route.edges);
  const noRepeats = unique.size === route.edges.length;
  const allEdges =
    unique.size === known.size && [...unique].every((id) => known.has(id));
  const correctLength =
    route.edges.length === graph.edges.length &&
    (route.vertices.length === route.edges.length + 1 ||
      (!graph.vertices.length &&
        !route.vertices.length &&
        !route.edges.length));
  const validConnections =
    route.vertices.every((id) => vertexIds.has(id)) &&
    route.edges.every((id, i) => {
      const e = known.get(id);
      const a = route.vertices[i];
      const b = route.vertices[i + 1];
      return !!e && ((e.a === a && e.b === b) || (e.b === a && e.a === b));
    });
  return {
    valid: noRepeats && allEdges && correctLength && validConnections,
    noRepeats,
    allEdges,
    correctLength,
    validConnections,
    used: [...unique].filter((id) => known.has(id)).length,
    total: known.size,
  };
}
