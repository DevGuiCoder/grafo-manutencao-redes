import { assertGraphData, type GraphData } from "../graph/Graph";
import type { EulerKind } from "../graph/EulerianAnalyzer";
export interface HistoryEntry {
  id: string;
  date: string;
  graph: GraphData;
  kind: EulerKind;
  time: number;
}
const KEY = "elora:history:v1";
export function readHistory(): HistoryEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => {
        try {
          assertGraphData(item.graph);
          return (
            typeof item.id === "string" &&
            typeof item.date === "string" &&
            Number.isFinite(item.time) &&
            ["cycle", "path", "none", "empty"].includes(item.kind)
          );
        } catch {
          return false;
        }
      })
      .slice(0, 5);
  } catch {
    return [];
  }
}
export function saveHistory(entries: HistoryEntry[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 5)));
    return true;
  } catch {
    return false;
  }
}
