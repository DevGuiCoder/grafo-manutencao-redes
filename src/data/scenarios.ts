import type { GraphData } from "../graph/Graph";
import type { VertexType } from "../graph/Vertex";
const types: VertexType[] = [
  "Central",
  "Switch",
  "Caixa",
  "Poste",
  "Armário",
  "Caixa",
  "Poste",
  "Ponto técnico",
];
function make(name: string, count: number, pairs: number[][]): GraphData {
  return {
    name,
    vertices: Array.from({ length: count }, (_, i) => ({
      id: `v${i}`,
      name:
        i === 0
          ? "Central"
          : `${types[i % types.length]} ${String(i).padStart(2, "0")}`,
      type: types[i % types.length],
      x:
        count > 20
          ? (i % 12) * 190
          : 420 + 360 * Math.cos((i * Math.PI * 2) / count - Math.PI / 2),
      y:
        count > 20
          ? Math.floor(i / 12) * 150
          : 250 +
            (count <= 8 ? 145 : 230) *
              Math.sin((i * Math.PI * 2) / count - Math.PI / 2),
    })),
    edges: pairs.map(([a, b], i) => ({ id: `e${i}`, a: `v${a}`, b: `v${b}` })),
  };
}
const ring = (n: number) =>
  Array.from({ length: n }, (_, i) => [i, (i + 1) % n]);
export const scenarios = [
  {
    id: "cycle",
    title: "Rede com ciclo",
    description: "Anel metropolitano com redundância.",
    graph: make("Rede Metropolitana", 8, [
      ...ring(8),
      [0, 2],
      [2, 4],
      [4, 6],
      [6, 0],
    ]),
  },
  {
    id: "path",
    title: "Rede com caminho",
    description: "Uma inspeção entre duas extremidades.",
    graph: make("Rede de Distribuição", 12, [
      ...ring(12),
      [0, 2],
      [2, 4],
      [4, 6],
      [6, 8],
      [8, 0],
      [1, 7],
    ]),
  },
  {
    id: "none",
    title: "Sem solução",
    description: "Ramificações com excesso de graus ímpares.",
    graph: make("Rede Industrial", 15, [
      ...ring(15),
      [0, 2],
      [2, 4],
      [4, 6],
      [6, 0],
      [1, 7],
      [3, 9],
      [5, 11],
    ]),
  },
  {
    id: "disconnected",
    title: "Rede desconectada",
    description: "Dois setores sem enlace entre eles.",
    graph: make("Setores Independentes", 8, [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
    ]),
  },
  {
    id: "large",
    title: "Grande porte",
    description: "120 pontos e 180 enlaces para testar escala.",
    graph: make("Backbone Regional", 120, [
      ...ring(120),
      ...Array.from({ length: 60 }, (_, i) => [2 * i, (2 * i + 2) % 120]),
    ]),
  },
];
export const emptyGraph = (): GraphData => ({
  name: "Minha rede",
  vertices: [],
  edges: [],
});
