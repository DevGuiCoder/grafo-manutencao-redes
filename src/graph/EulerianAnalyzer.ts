import type { Graph } from "./Graph";
import { analyzeConnectivity } from "./ConnectivityAnalyzer";
export type EulerKind = "cycle" | "path" | "none" | "empty";
export function analyzeEulerian(graph: Graph) {
  const connectivity = analyzeConnectivity(graph);
  const odd = [...graph.degrees]
    .filter(([, degree]) => degree % 2 === 1)
    .map(([id]) => id);
  let kind: EulerKind;
  let explanation: string;
  if (!graph.data.edges.length) {
    kind = "empty";
    explanation =
      "Não há enlaces para inspecionar. Adicione pelo menos uma conexão. A rota vazia é trivial; não há uma inspeção a animar.";
  } else if (!connectivity.connected) {
    kind = "none";
    explanation = `Os enlaces estão distribuídos em ${connectivity.components.length} componentes desconectadas. Uma única rota não consegue alcançar todos eles.`;
  } else if (odd.length === 0) {
    kind = "cycle";
    explanation =
      "Todos os pontos com enlaces estão conectados e possuem grau par. A inspeção começa e termina no mesmo ponto.";
  } else if (odd.length === 2) {
    kind = "path";
    explanation =
      "Grafo semi-Euleriano: os pontos com enlaces estão conectados e há exatamente dois de grau ímpar. Existe caminho Euleriano aberto, mas não ciclo: a rota começa em um desses pontos e termina no outro.";
  } else {
    kind = "none";
    explanation = `Há ${odd.length} pontos de grau ímpar. O grafo é não Euleriano: não existe percurso que use todas as arestas exatamente uma vez. São necessários zero ímpares para um ciclo ou dois para um caminho aberto (semi-Euleriano).`;
  }
  return { ...connectivity, odd, kind, explanation };
}
