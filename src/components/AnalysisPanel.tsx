import {
  Waypoints as Network,
  Link2,
  CircleDot,
  Grid2X2,
  Clock3,
  Route,
  Check,
  Play,
} from "lucide-react";
import type { GraphData } from "../graph/Graph";
import type { Analysis } from "../services/analyzeNetwork";
import type { Playback } from "../hooks/usePlayback";
import { MetricCard } from "./MetricCard";
import { EulerianResult } from "./EulerianResult";
import { AnalysisDetails } from "./AnalysisDetails";
import { PathAnimation } from "./PathAnimation";
import { PathSteps } from "./PathSteps";
import { CurrentStepDetails } from "./CurrentStepDetails";
export function AnalysisPanel({
  analysis: a,
  graph,
  degrees,
  playback,
  selectPoint,
}: {
  analysis: Analysis | null;
  graph: GraphData;
  degrees: Map<string, number>;
  playback: Playback;
  selectPoint: (id: string) => void;
}) {
  const route = a?.validation?.valid ? a.route : null;
  const odd = [...degrees.values()].filter((d) => d % 2).length;
  const name = (id: string) =>
    graph.vertices.find((v) => v.id === id)?.name ?? id;
  return (
    <>
      <section className="analysis-panel" aria-label="Resultado da análise">
        <EulerianResult analysis={a} />
        <h3 className="metrics-heading">Estrutura da rede</h3>
        <div className="metrics-grid">
          <MetricCard
            icon={Network}
            label="Vértices"
            value={graph.vertices.length}
            detail="pontos da rede"
          />
          <MetricCard
            icon={Link2}
            label="Arestas"
            value={graph.edges.length}
            detail="conexões da rede"
          />
          <MetricCard
            icon={Network}
            label="Conectada"
            value={
              a && graph.edges.length ? (a.connected ? "Sim" : "Não") : "—"
            }
            detail={
              a && graph.edges.length
                ? "Entre nós com arestas"
                : "Aguardando análise"
            }
            accent={!!a?.connected && !!graph.edges.length}
          />
          <MetricCard
            icon={CircleDot}
            label="Graus ímpares"
            value={odd}
            detail={odd ? `${odd} vértices ímpares` : "Todos os vértices pares"}
            accent={odd > 0}
          />
          <MetricCard
            icon={Grid2X2}
            label="Densidade"
            value={
              graph.vertices.length > 1
                ? (
                    (2 * graph.edges.length) /
                    (graph.vertices.length * (graph.vertices.length - 1))
                  ).toLocaleString("pt-BR", { maximumFractionDigits: 2 })
                : "0"
            }
            detail="Proporção de conexões possíveis"
          />
          <MetricCard
            icon={Clock3}
            label="Tempo de análise"
            value={a ? `${a.timing.total.toFixed(2)} ms` : "—"}
            detail="Tempo real de execução"
          />
        </div>
        {a && (
          <AnalysisDetails
            analysis={a}
            graph={graph}
            selectPoint={selectPoint}
          />
        )}
      </section>
      <section className="path-panel" aria-label="Percurso Euleriano">
        <div className="panel-heading">
          <Route size={31} />
          <div>
            <h2>Percurso Euleriano</h2>
            <p>Visualize o passo a passo do caminho encontrado.</p>
          </div>
        </div>
        {route ? (
          <>
            <PathAnimation
              playback={playback}
              total={route.edges.length}
              from={name(
                route.vertices[Math.min(playback.step, route.edges.length - 1)],
              )}
              to={name(
                route.vertices[Math.min(playback.step + 1, route.edges.length)],
              )}
            />
            <PathSteps
              route={route}
              graph={graph}
              step={playback.step}
              seek={playback.seek}
            />
            <CurrentStepDetails
              graph={graph}
              route={route}
              step={playback.step}
              playing={playback.playing}
            />
            <p className="route-validation">
              <Check size={14} />
              {a!.validation!.used}/{a!.validation!.total} enlaces · Percurso
              válido
            </p>
          </>
        ) : (
          <div className="path-placeholder">
            <Play size={25} />
            <strong>
              {a ? "Nenhum percurso disponível" : "Seu percurso aparecerá aqui"}
            </strong>
            <p>
              {a?.kind === "none"
                ? "Revise a conectividade e os graus da rede para encontrar uma rota."
                : "Execute a análise para visualizar uma rota validada, aresta por aresta."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
