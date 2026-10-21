import { useMemo, useState } from "react";
import type { NodeChange } from "@xyflow/react";
import { Graph, assertGraphData, type GraphData } from "../graph/Graph";
import type { Vertex } from "../graph/Vertex";
import { analyzeNetwork, type Analysis } from "../services/analyzeNetwork";
import {
  readHistory,
  saveHistory,
  type HistoryEntry,
} from "../services/history";
import { scenarios, emptyGraph } from "../data/scenarios";
import { usePlayback } from "./usePlayback";
import type { FlowInstance } from "../components/GraphCanvas";
import type { NetworkNode } from "../components/GraphNode";
import { resultLabels } from "../data/analysisLabels";
export function useNetworkWorkspace() {
  const [graph, setGraph] = useState<GraphData>(emptyGraph);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [mode, setMode] = useState("select");
  const [selected, setSelected] = useState<{
    type: "node" | "edge";
    id: string;
  } | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);
  const [nodeDraft, setNodeDraft] = useState<{
    vertex?: Vertex;
    position: { x: number; y: number };
  } | null>(null);
  const [showDegrees, setShowDegrees] = useState(false);
  const [instance, setInstance] = useState<FlowInstance | null>(null);
  const [graphKey, setGraphKey] = useState(0);
  const [toast, setToast] = useState<{ message: string; id: number } | null>(
    null,
  );
  const [history, setHistory] = useState<HistoryEntry[]>(readHistory);
  const [busy, setBusy] = useState(false);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const playback = usePlayback(analysis?.route?.edges.length ?? 0);
  const degrees = useMemo(
    () =>
      new Graph({ ...graph, name: graph.name.trim() || "Minha rede" }).degrees,
    [graph],
  );
  const notify = (message: string) => {
    const id = Date.now();
    setToast({ message, id });
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 4500);
  };
  const invalidate = () => {
    setAnalysis(null);
    playback.reset();
  };
  const replace = (next: GraphData) => {
    setGraph(structuredClone(next));
    setAnalysis(null);
    playback.reset();
    setSelected(null);
    setConnectFrom(null);
    setMode("select");
    setDialog(null);
    setGraphKey((k) => k + 1);
  };
  const loadScenario = (id: string) => {
    const s = scenarios.find((x) => x.id === id)!;
    replace(s.graph);
    notify(`${s.title} carregada.`);
  };
  const update = (next: GraphData) => {
    try {
      assertGraphData({ ...next, name: next.name.trim() || "Minha rede" });
      setGraph(next);
      invalidate();
      return true;
    } catch (err) {
      notify((err as Error).message);
      return false;
    }
  };
  const connect = (a: string, b: string) => {
    if (
      update({
        ...graph,
        edges: [...graph.edges, { id: crypto.randomUUID(), a, b }],
      })
    ) {
      notify("Conexão criada.");
      setConnectFrom(null);
      setMode("select");
    }
  };
  const remove = (nodeIds: string[], edgeIds: string[]) => {
    setGraph((g) => ({
      ...g,
      vertices: g.vertices.filter((v) => !nodeIds.includes(v.id)),
      edges: g.edges.filter(
        (e) =>
          !edgeIds.includes(e.id) &&
          !nodeIds.includes(e.a) &&
          !nodeIds.includes(e.b),
      ),
    }));
    invalidate();
    setSelected(null);
    setConnectFrom(null);
  };
  const addDialog = () => {
    setNodeDraft({
      position: instance?.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }) ?? { x: 200, y: 200 },
    });
  };
  const action = (id: string) => {
    if (id === "select" || id === "overview") {
      setMode("select");
      setConnectFrom(null);
      setDialog(null);
      if (id === "overview") instance?.fitView({ duration: 200, padding: 0.2 });
    } else if (id === "add") {
      setMode(mode === "add" ? "select" : "add");
      setConnectFrom(null);
      if (!graph.vertices.length) addDialog();
      else notify("Clique no canvas para posicionar o novo ponto.");
    } else if (id === "connect") {
      if (graph.vertices.length < 2) {
        notify("Adicione pelo menos dois pontos para conectar.");
        return;
      }
      setMode(mode === "connect" ? "select" : "connect");
      setConnectFrom(null);
      setSelected(null);
    } else if (id === "new" && !graph.vertices.length) replace(emptyGraph());
    else setDialog(id);
  };
  const analyze = () => {
    setBusy(true);
    playback.reset();
    requestAnimationFrame(() => {
      try {
        const data = { ...graph, name: graph.name.trim() || "Minha rede" };
        const result = analyzeNetwork(data);
        setAnalysis(result);
        setAnalyzedAt(new Date().toISOString());
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          graph: structuredClone(data),
          kind: result.kind,
          time: result.timing.total,
        };
        const next = [entry, ...history].slice(0, 5);
        setHistory(next);
        if (!saveHistory(next))
          notify("Análise concluída; armazenamento local indisponível.");
        else notify(resultLabels[result.kind]);
      } catch (err) {
        notify((err as Error).message);
      } finally {
        setBusy(false);
      }
    });
  };
  const changes = (changes: NodeChange<NetworkNode>[]) => {
    const selection = changes.find((c) => c.type === "select" && c.selected);
    if (selection?.type === "select" && mode === "select")
      setSelected({ type: "node", id: selection.id });
    const positions = changes.filter((c) => c.type === "position");
    if (positions.length)
      setGraph((g) => ({
        ...g,
        vertices: g.vertices.map((v) => {
          const c = positions.find((p) => p.id === v.id);
          return c?.position ? { ...v, x: c.position.x, y: c.position.y } : v;
        }),
      }));
  };
  const selectedNode =
    selected?.type === "node"
      ? graph.vertices.find((v) => v.id === selected.id)
      : undefined;
  const selectedEdge =
    selected?.type === "edge"
      ? graph.edges.find((e) => e.id === selected.id)
      : undefined;
  const selectElement = (type: "node" | "edge", id: string) => {
    setSelected({ type, id });
    setMode("select");
    setConnectFrom(null);
    const edge = graph.edges.find((e) => e.id === id);
    const ids = type === "node" ? [id] : edge ? [edge.a, edge.b] : [];
    instance?.fitView({
      nodes: ids.map((id) => ({ id })),
      duration: 200,
      padding: 0.4,
      maxZoom: 1.2,
    });
  };
  return {
    graph,
    setGraph,
    analysis,
    mode,
    setMode,
    selected,
    setSelected,
    connectFrom,
    setConnectFrom,
    dialog,
    setDialog,
    nodeDraft,
    setNodeDraft,
    showDegrees,
    setShowDegrees,
    instance,
    setInstance,
    graphKey,
    toast,
    setToast,
    history,
    busy,
    playback,
    degrees,
    notify,
    replace,
    loadScenario,
    update,
    connect,
    remove,
    addDialog,
    action,
    analyze,
    changes,
    selectedNode,
    selectedEdge,
    analyzedAt,
    selectElement,
  };
}
export type NetworkWorkspace = ReturnType<typeof useNetworkWorkspace>;
