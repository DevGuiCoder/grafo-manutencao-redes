import { assertGraphData, type GraphData } from "../graph/Graph";
import type { Vertex } from "../graph/Vertex";
/** RFC 4180-style parser supporting commas, escaped quotes and line breaks in fields. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closed = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else field += c;
    } else if (c === '"') {
      if (field || closed)
        throw new Error("CSV: aspas fora do início de um campo.");
      quoted = true;
    } else if (c === "," || c === "\n" || c === "\r") {
      row.push(field);
      field = "";
      closed = false;
      if (c !== ",") {
        if (row.some((v) => v.length)) rows.push(row);
        row = [];
        if (c === "\r" && text[i + 1] === "\n") i++;
      }
    } else {
      if (closed) throw new Error("CSV: caractere inesperado após aspas.");
      field += c;
    }
  }
  if (quoted) throw new Error("CSV: campo com aspas não fechado.");
  if (field || row.length || closed) {
    row.push(field);
    if (row.some((v) => v.length)) rows.push(row);
  }
  return rows;
}
export function importNetwork(text: string, filename: string): GraphData {
  if (text.length > 2_000_000)
    throw new Error("O arquivo excede o limite de 2 MB.");
  if (filename.toLowerCase().endsWith(".json")) {
    let value: unknown;
    try {
      value = JSON.parse(text.replace(/^\uFEFF/, ""));
    } catch {
      throw new Error("JSON inválido. Confira vírgulas, aspas e chaves.");
    }
    assertGraphData(value);
    return value;
  }
  if (!filename.toLowerCase().endsWith(".csv"))
    throw new Error("Selecione um arquivo .json ou .csv.");
  const rows = parseCsv(text);
  const header = rows.shift()?.map((v) => v.trim().toLowerCase());
  if (!header) throw new Error("O arquivo está vazio.");
  const data: GraphData = {
    name: filename.replace(/\.csv$/i, "").slice(0, 100) || "Rede importada",
    vertices: [],
    edges: [],
  };
  if (header.join(",") === "origem,destino") {
    const ids = new Map<string, string>();
    const point = (name: string) => {
      if (!ids.has(name)) {
        const id = `v${ids.size}`;
        const i = ids.size;
        ids.set(name, id);
        data.vertices.push({
          id,
          name,
          type: "Ponto técnico",
          x: (i % 6) * 210,
          y: Math.floor(i / 6) * 160,
        });
      }
      return ids.get(name)!;
    };
    rows.forEach((row, index) => {
      if (row.length !== 2 || row.some((v) => !v.trim()))
        throw new Error(`Linha ${index + 2}: informe origem e destino.`);
      data.edges.push({
        id: `e${index}`,
        a: point(row[0].trim()),
        b: point(row[1].trim()),
      });
    });
  } else if (
    header.join(",") === "registro,id,nome,tipo,x,y,origem,destino,metadados"
  ) {
    rows.forEach((row, index) => {
      if (row.length !== 9)
        throw new Error(`Linha ${index + 2}: esperadas 9 colunas.`);
      const [kind, id, name, type, x, y, a, b, metadata] = row;
      if (kind === "rede") data.name = name;
      else if (kind === "ponto") {
        if (!x.trim() || !y.trim())
          throw new Error(`Linha ${index + 2}: coordenadas ausentes.`);
        let meta: Record<string, unknown> | undefined;
        try {
          meta = metadata ? JSON.parse(metadata) : undefined;
        } catch {
          throw new Error(`Linha ${index + 2}: metadados JSON inválidos.`);
        }
        data.vertices.push({
          id,
          name,
          type: type as Vertex["type"],
          x: Number(x),
          y: Number(y),
          ...(metadata ? { metadata: meta } : {}),
        });
      } else if (kind === "enlace") data.edges.push({ id, a, b });
      else
        throw new Error(
          `Linha ${index + 2}: registro deve ser rede, ponto ou enlace.`,
        );
    });
  } else
    throw new Error(
      "Cabeçalho inválido. Use origem,destino ou o formato completo exportado pela aplicação.",
    );
  assertGraphData(data);
  return data;
}
export function exportNetwork(data: GraphData, format: "json" | "csv") {
  if (format === "json") return JSON.stringify(data, null, 2);
  const rows: unknown[][] = [
    [
      "registro",
      "id",
      "nome",
      "tipo",
      "x",
      "y",
      "origem",
      "destino",
      "metadados",
    ],
    ["rede", "", data.name, "", "", "", "", "", ""],
  ];
  for (const v of data.vertices)
    rows.push([
      "ponto",
      v.id,
      v.name,
      v.type,
      v.x,
      v.y,
      "",
      "",
      v.metadata ? JSON.stringify(v.metadata) : "",
    ]);
  for (const e of data.edges)
    rows.push(["enlace", e.id, "", "", "", "", e.a, e.b, ""]);
  return rows
    .map((row) =>
      row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
}
export function downloadNetwork(data: GraphData, format: "json" | "csv") {
  const blob = new Blob([exportNetwork(data, format)], {
    type:
      format === "json"
        ? "application/json;charset=utf-8"
        : "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `grafo-manutencao-redes.${format}`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
