import type { EulerKind } from "../graph/EulerianAnalyzer";

export const resultLabels = {
  cycle: "Ciclo Euleriano encontrado",
  path: "Semi-Euleriano — caminho aberto",
  none: "Não Euleriano — sem percurso",
  empty: "Sem enlaces para inspecionar",
} satisfies Record<EulerKind, string>;
export const shortResultLabels = {
  cycle: "Ciclo Euleriano",
  path: "Semi-Euleriano",
  none: "Não Euleriano",
  empty: "Sem arestas",
} satisfies Record<EulerKind, string>;
