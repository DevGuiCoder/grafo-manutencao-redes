import { useState } from "react";
import { ChevronDown, Search, X, CircleDot, Link2 } from "lucide-react";
import type { GraphData } from "../graph/Graph";
import type { Analysis } from "../services/analyzeNetwork";
interface Props {
  graph: GraphData;
  analysis: Analysis | null;
  analyzedAt: string | null;
  busy: boolean;
  action: (id: string) => void;
  analyze: () => void;
  select: (type: "node" | "edge", id: string) => void;
}
export function AppHeader({
  graph,
  analysis,
  analyzedAt,
  busy,
  action,
  analyze,
  select,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const term = query.trim().toLocaleLowerCase();
  const results = term
    ? [
        ...graph.vertices
          .filter((v) =>
            `${v.id} ${v.name} ${v.type} ${JSON.stringify(v.metadata ?? {})}`
              .toLocaleLowerCase()
              .includes(term),
          )
          .map((v) => ({
            type: "node" as const,
            id: v.id,
            label: v.name,
            detail: v.id,
          })),
        ...graph.edges
          .filter((e) =>
            `${e.id} ${e.a} ${e.b} ${graph.vertices.find((v) => v.id === e.a)?.name} ${graph.vertices.find((v) => v.id === e.b)?.name}`
              .toLocaleLowerCase()
              .includes(term),
          )
          .map((e) => ({
            type: "edge" as const,
            id: e.id,
            label: `${graph.vertices.find((v) => v.id === e.a)?.name} ↔ ${graph.vertices.find((v) => v.id === e.b)?.name}`,
            detail: e.id,
          })),
      ].slice(0, 8)
    : [];
  const choose = (item: (typeof results)[number]) => {
    select(item.type, item.id);
    setOpen(false);
    setQuery("");
  };
  const connected =
    analysis && graph.edges.length > 0 ? analysis.connected : null;
  return (
    <header className="app-header">
      <button
        className="project-selector"
        aria-label={`Projeto ${graph.name || "Minha rede"}`}
        onClick={() => action("project")}
        title="Gerenciar projeto"
      >
        <span>
          <small>Análise da rede</small>
          <strong>{graph.name || "Minha rede"}</strong>
        </span>
        <ChevronDown size={16} />
      </button>

      <div
        className={`network-status ${connected === true ? "connected" : connected === false ? "disconnected" : ""}`}
      >
        <span className="status-dot" />
        <span>
          <strong>
            {connected === true
              ? "Rede conectada"
              : connected === false
                ? "Rede desconectada"
                : "Análise pendente"}
          </strong>
          <small>
            {analyzedAt && analysis
              ? `Última análise: ${new Date(analyzedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
              : "Execute uma análise da rede"}
          </small>
        </span>
      </div>
      <div
        className="search-container"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
        }}
      >
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Buscar nós, arestas ou atributos"
            placeholder="Buscar nós, arestas ou atributos…"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" && results[0]) {
                e.preventDefault();
                choose(results[0]);
              }
            }}
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Limpar busca"
              onClick={() => setQuery("")}
            >
              <X size={14} />
            </button>
          )}
        </div>
        {open && term && (
          <div className="search-results" aria-label="Resultados da busca">
            {results.length ? (
              results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => choose(item)}
                >
                  {item.type === "node" ? (
                    <CircleDot size={16} />
                  ) : (
                    <Link2 size={16} />
                  )}
                  <span>
                    <strong>{item.label}</strong>
                    <small>
                      {item.type === "node" ? "Vértice" : "Aresta"} ·{" "}
                      {item.detail}
                    </small>
                  </span>
                </button>
              ))
            ) : (
              <p>Nenhum elemento encontrado.</p>
            )}
          </div>
        )}
      </div>

      <button
        className="header-analyze primary"
        aria-label="Analisar rede"
        onClick={analyze}
        disabled={busy}
      >
        {busy ? "Analisando…" : "Analisar rede"}
      </button>
    </header>
  );
}
