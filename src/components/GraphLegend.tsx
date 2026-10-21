import { Circle, Square, CircleDot, Minus, MoveRight } from "lucide-react";
import { vertexTypes } from "../graph/Vertex";
import { equipmentIcon } from "./equipmentAppearance";
export function GraphLegend() {
  return (
    <details className="graph-legend">
      <summary>Legenda</summary>
      <div aria-label="Legenda do grafo">
        <b>Equipamentos</b>
        {vertexTypes.map((type) => {
          const EquipmentIcon = equipmentIcon[type];
          return (
            <span key={type}>
              <EquipmentIcon size={17} strokeWidth={1.6} aria-hidden="true" />
              {type}
            </span>
          );
        })}
        <b>Contornos e percurso</b>
        <span>
          <Circle size={14} /> Não visitado
        </span>
        <span className="legend-route">
          <Circle size={14} /> Visitado
        </span>
        <span className="legend-route">
          <Square size={13} /> Atual
        </span>
        <span className="legend-odd">
          <CircleDot size={14} /> Grau ímpar
        </span>
        <span>
          <Minus size={14} /> Aresta
        </span>
        <span className="legend-route">
          <MoveRight size={14} /> Percurso
        </span>
      </div>
    </details>
  );
}
