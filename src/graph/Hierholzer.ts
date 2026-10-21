import type { Graph } from "./Graph";
export interface Route {
  vertices: string[];
  edges: string[];
}
/** Stack-based Hierholzer. Each adjacency entry is examined at most once: O(V + E). */
export function hierholzer(graph: Graph, start: string): Route {
  if (!graph.adjacency.has(start))
    throw new Error("Ponto inicial inexistente.");
  const cursor = new Map<string, number>();
  const used = new Set<string>();
  const stack: { vertex: string; incoming?: string }[] = [{ vertex: start }];
  const vertices: string[] = [];
  const edges: string[] = [];
  while (stack.length) {
    const top = stack[stack.length - 1];
    const neighbors = graph.adjacency.get(top.vertex)!;
    let index = cursor.get(top.vertex) ?? 0;
    while (index < neighbors.length && used.has(neighbors[index].edge)) index++;
    cursor.set(top.vertex, index + 1);
    if (index < neighbors.length) {
      const next = neighbors[index];
      used.add(next.edge);
      stack.push({ vertex: next.vertex, incoming: next.edge });
    } else {
      const finished = stack.pop()!;
      vertices.push(finished.vertex);
      if (finished.incoming) edges.push(finished.incoming);
    }
  }
  return { vertices: vertices.reverse(), edges: edges.reverse() };
}
