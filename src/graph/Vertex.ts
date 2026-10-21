export const vertexTypes = [
  "Genérico",
  "Central",
  "Poste",
  "Caixa",
  "Switch",
  "Armário",
  "Ponto técnico",
] as const;
export type VertexType = (typeof vertexTypes)[number];
export interface Vertex {
  id: string;
  name: string;
  type: VertexType;
  x: number;
  y: number;
  metadata?: Record<string, unknown>;
}
