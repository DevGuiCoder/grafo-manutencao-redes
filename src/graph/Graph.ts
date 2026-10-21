import type { Vertex } from "./Vertex";
import { vertexTypes } from "./Vertex";
import type { Edge } from "./Edge";
export interface GraphData {
  name: string;
  vertices: Vertex[];
  edges: Edge[];
}
export interface Neighbor {
  vertex: string;
  edge: string;
}
/** Undirected simple graph: physical links are bidirectional and unweighted. */
export class Graph {
  readonly adjacency = new Map<string, Neighbor[]>();
  readonly degrees = new Map<string, number>();
  constructor(readonly data: GraphData) {
    assertGraphData(data);
    for (const v of data.vertices) this.adjacency.set(v.id, []);
    for (const e of data.edges) {
      this.adjacency.get(e.a)!.push({ vertex: e.b, edge: e.id });
      this.adjacency.get(e.b)!.push({ vertex: e.a, edge: e.id });
    }
    for (const [id, list] of this.adjacency) this.degrees.set(id, list.length);
  }
}
const record = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const label = (x: unknown): x is string =>
  typeof x === "string" && x.trim().length > 0 && x.length <= 100;
export function assertGraphData(value: unknown): asserts value is GraphData {
  if (
    !record(value) ||
    !label(value.name) ||
    !Array.isArray(value.vertices) ||
    !Array.isArray(value.edges)
  )
    throw new Error("Informe name, vertices e edges no JSON.");
  if (value.vertices.length > 1000 || value.edges.length > 5000)
    throw new Error("Limite: 1.000 pontos e 5.000 enlaces por rede.");
  const ids = new Set<string>();
  for (const v of value.vertices) {
    if (
      !record(v) ||
      !label(v.id) ||
      !label(v.name) ||
      !vertexTypes.includes(v.type as Vertex["type"]) ||
      typeof v.x !== "number" ||
      typeof v.y !== "number" ||
      !Number.isFinite(v.x) ||
      !Number.isFinite(v.y) ||
      Math.abs(v.x) > 100000 ||
      Math.abs(v.y) > 100000
    )
      throw new Error(
        "Ponto inválido: confira ID, nome, tipo e coordenadas finitas (±100.000).",
      );
    if (v.metadata !== undefined && !record(v.metadata))
      throw new Error("Metadados devem ser um objeto JSON.");
    if (ids.has(v.id)) throw new Error(`ID de ponto repetido: ${v.id}.`);
    ids.add(v.id);
  }
  const edgeIds = new Set<string>();
  const pairs = new Set<string>();
  for (const e of value.edges) {
    if (
      !record(e) ||
      !label(e.id) ||
      typeof e.a !== "string" ||
      typeof e.b !== "string" ||
      !ids.has(e.a) ||
      !ids.has(e.b)
    )
      throw new Error(
        "Enlace inválido: cada extremidade precisa referenciar um ID existente.",
      );
    if (e.a === e.b)
      throw new Error("Laços não são permitidos neste modelo de rede física.");
    const pair = JSON.stringify([e.a, e.b].sort());
    if (edgeIds.has(e.id) || pairs.has(pair))
      throw new Error(
        "Enlace repetido: o modelo não permite conexões paralelas.",
      );
    edgeIds.add(e.id);
    pairs.add(pair);
  }
}
