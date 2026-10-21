import { useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ConnectionMode,
  type ReactFlowInstance,
  type NodeChange,
  type Connection,
} from "@xyflow/react";
import {
  MousePointer2,
  Plus,
  Network,
  ArrowLeft,
  ArrowRight,
  List,
} from "lucide-react";
import { GraphNode, type NetworkNode } from "./GraphNode";
import { GraphEdge, type NetworkEdge } from "./GraphEdge";
import type { GraphData } from "../graph/Graph";
import type { Analysis } from "../services/analyzeNetwork";
import type { Playback } from "../hooks/usePlayback";
import { GraphToolbar } from "./GraphToolbar";
import { GraphLegend } from "./GraphLegend";
const nodeTypes = { infra: GraphNode };
const edgeTypes = { link: GraphEdge };
export type FlowInstance = ReactFlowInstance<NetworkNode, NetworkEdge>;
interface Props {
  graph: GraphData;
  degrees: Map<string, number>;
  analysis: Analysis | null;
  playback: Playback;
  showDegrees: boolean;
  toggleDegrees: () => void;
  selected: { type: "node" | "edge"; id: string } | null;
  mode: string;
  connectFrom: string | null;
  onNodeClick: (id: string) => void;
  onEdgeClick: (id: string) => void;
  onPaneClick: (position: { x: number; y: number }) => void;
  onChanges: (changes: NodeChange<NetworkNode>[]) => void;
  onConnect: (connection: Connection) => void;
  onInit: (instance: FlowInstance) => void;
  instance: FlowInstance | null;
  onDelete: (nodeIds: string[], edgeIds: string[]) => void;
  add: () => void;
  example: () => void;
  action: (id: string) => void;
}
export function GraphCanvas(p: Props) {
  const [panning, setPanning] = useState(false);
  const [focused, setFocused] = useState(false);
  // Keep React Flow's measurements when rebuilding presentation data. Dropping
  // them hides every node and clears its handle bounds on each drag update.
  const [measurements, setMeasurements] = useState(
    () => new Map<string, { width: number; height: number }>(),
  );
  const onNodesChange = (changes: NodeChange<NetworkNode>[]) => {
    const dimensions = changes.filter((change) => change.type === "dimensions");
    if (dimensions.length) {
      setMeasurements((previous) => {
        const next = new Map(previous);
        for (const change of dimensions) {
          if (change.dimensions) next.set(change.id, change.dimensions);
        }
        return next;
      });
    }
    p.onChanges(changes);
  };
  useEffect(() => {
    if (p.mode !== "select") setPanning(false);
  }, [p.mode]);
  const areaRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const area = areaRef.current!;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!p.instance || !size.width) return;
    const timer = window.setTimeout(
      () => p.instance?.fitView({ padding: 0.16, duration: 200, maxZoom: 1.3 }),
      80,
    );
    return () => clearTimeout(timer);
  }, [size.width, size.height, p.instance]);
  const route = p.analysis?.route;
  const step = p.playback.step;
  const nodes = useMemo<NetworkNode[]>(
    () =>
      p.graph.vertices.map((v) => ({
        id: v.id,
        position: { x: v.x, y: v.y },
        measured: measurements.get(v.id),
        type: "infra",
        selected: p.selected?.type === "node" && p.selected.id === v.id,
        ariaLabel: `${v.name}, ${v.type}, grau ${p.degrees.get(v.id) ?? 0}`,
        data: {
          name: v.name,
          kind: v.type,
          degree: p.degrees.get(v.id) ?? 0,
          showDegrees: p.showDegrees,
          current: route?.vertices[step] === v.id,
          visited: route?.vertices.slice(0, step).includes(v.id),
          start: route?.vertices[0] === v.id,
          end: route?.vertices.at(-1) === v.id,
          connecting: p.connectFrom === v.id,
        },
      })),
    [
      p.graph.vertices,
      p.selected,
      p.degrees,
      p.showDegrees,
      route,
      step,
      p.connectFrom,
      measurements,
    ],
  );
  const edges = useMemo<NetworkEdge[]>(() => {
    const order = new Map(route?.edges.map((id, i) => [id, i]));
    const positions = new Map(p.graph.vertices.map((v) => [v.id, v]));
    return p.graph.edges.map((e) => {
      const a = positions.get(e.a)!;
      const b = positions.get(e.b)!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      const index = order.get(e.id);
      const activeIndex = p.playback.playing ? step : step - 1;
      return {
        id: e.id,
        source: e.a,
        target: e.b,
        sourceHandle: horizontal
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
            ? "bottom"
            : "top",
        targetHandle: horizontal
          ? dx > 0
            ? "left"
            : "right"
          : dy > 0
            ? "top"
            : "bottom",
        type: "link",
        selected: p.selected?.type === "edge" && p.selected.id === e.id,
        ariaLabel: `Enlace ${e.id}`,
        data: {
          state:
            index === activeIndex
              ? "active"
              : index !== undefined && index < step
                ? "visited"
                : "normal",
          reverse: index !== undefined && route?.vertices[index] !== e.a,
          playing: p.playback.playing,
          speed: p.playback.speed,
          order: index !== undefined ? index + 1 : undefined,
        },
      };
    });
  }, [
    p.graph.edges,
    p.graph.vertices,
    p.selected,
    route,
    step,
    p.playback.playing,
    p.playback.speed,
  ]);
  return (
    <section
      className={`canvas-shell mode-${p.mode} ${focused && route ? "focus-route" : ""} ${panning ? "panning" : ""}`}
      aria-label="Editor visual da rede"
    >
      <div className="canvas-heading">
        <div>
          <h1 aria-label="Mapa da Rede">Grafo de Manutenção de Redes</h1>
        </div>
      </div>
      <GraphToolbar
        instance={p.instance}
        mode={p.mode}
        action={(id) => {
          if (id === "select") setPanning(false);
          p.action(id);
        }}
        panning={panning}
        togglePanning={() => {
          p.action("select");
          setPanning(!panning);
        }}
        focused={focused}
        toggleFocus={() => setFocused(!focused)}
        canFocus={!!p.analysis?.validation?.valid}
        showDegrees={p.showDegrees}
        toggleDegrees={p.toggleDegrees}
      />
      <div className="flow-area" ref={areaRef}>
        {size.width > 0 && (
          <ReactFlow<NetworkNode, NetworkEdge>
            width={size.width}
            height={size.height}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={p.onInit}
            onNodesChange={onNodesChange}
            onConnect={p.onConnect}
            connectionMode={ConnectionMode.Loose}
            onNodeClick={(_, n) => p.onNodeClick(n.id)}
            onEdgeClick={(_, e) => p.onEdgeClick(e.id)}
            onPaneClick={(e) => {
              if (p.instance)
                p.onPaneClick(
                  p.instance.screenToFlowPosition({
                    x: e.clientX,
                    y: e.clientY,
                  }),
                );
            }}
            onNodesDelete={(ns) =>
              p.onDelete(
                ns.map((n) => n.id),
                [],
              )
            }
            onEdgesDelete={(es) =>
              p.onDelete(
                [],
                es.map((e) => e.id),
              )
            }
            deleteKeyCode={["Backspace", "Delete"]}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.08}
            maxZoom={2}
            colorMode="dark"
            nodesDraggable={p.mode === "select" && !panning}
            autoPanOnNodeDrag={false}
          />
        )}
        {!nodes.length && (
          <div className="empty-state">
            <div className="empty-icon">
              <Network size={38} />
            </div>
            <h3>Explore as conexões da sua rede.</h3>
            <p>
              Crie um grafo com os seus dados
              <br />
              ou explore um cenário de exemplo.
            </p>
            <button className="primary" onClick={p.add}>
              <Plus size={17} /> Criar rede
            </button>
            <button className="text-button" onClick={p.example}>
              Carregar exemplo →
            </button>
          </div>
        )}
        {nodes.length > 0 && (
          <div className="canvas-hint">
            <MousePointer2 size={12} />
            {p.mode === "add"
              ? "Clique no canvas para posicionar o novo ponto"
              : p.mode === "connect"
                ? p.connectFrom
                  ? "Agora selecione o ponto de destino"
                  : "Selecione o primeiro ponto da conexão"
                : "Arraste para organizar · Selecione para editar"}
          </div>
        )}
      </div>
      <div className="canvas-bottom">
        <GraphLegend />
        {route && p.analysis?.validation?.valid ? (
          <div className="canvas-step-controls">
            <button
              aria-label="Etapa anterior no mapa"
              disabled={step === 0}
              onClick={() => p.playback.seek(step - 1)}
            >
              <ArrowLeft size={14} />
              <span>Anterior</span>
            </button>
            <span>
              Passo <b>{String(step).padStart(2, "0")}</b> /{" "}
              {route.edges.length}
            </span>
            <button
              aria-label="Próxima etapa no mapa"
              disabled={step === route.edges.length}
              onClick={() => p.playback.seek(step + 1)}
            >
              <span>Próximo</span>
              <ArrowRight size={14} />
            </button>
            <button
              aria-label="Abrir lista do percurso"
              title="Lista do percurso"
              onClick={() => p.action("reports")}
            >
              <List size={15} />
            </button>
          </div>
        ) : (
          <span className="canvas-bottom-note">
            Grafo não direcionado · Não ponderado
          </span>
        )}
      </div>
    </section>
  );
}
