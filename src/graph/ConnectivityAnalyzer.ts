import type { Graph } from "./Graph";
/** Iterative BFS, O(V + E). Isolated points are reported separately. */
export function analyzeConnectivity(graph: Graph) {
  const visited = new Set<string>();
  const components: string[][] = [];
  const isolated: string[] = [];
  for (const [id, neighbors] of graph.adjacency) {
    if (neighbors.length === 0) {
      isolated.push(id);
      continue;
    }
    if (visited.has(id)) continue;
    const queue = [id];
    visited.add(id);
    for (let head = 0; head < queue.length; head++) {
      for (const n of graph.adjacency.get(queue[head])!)
        if (!visited.has(n.vertex)) {
          visited.add(n.vertex);
          queue.push(n.vertex);
        }
    }
    components.push(queue);
  }
  return { connected: components.length <= 1, components, isolated };
}
