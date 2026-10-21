import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { VertexType } from "../graph/Vertex";
import { equipmentIcon } from "./equipmentAppearance";
export type NetworkNode = Node<
  {
    name: string;
    kind: VertexType;
    degree: number;
    showDegrees: boolean;
    current: boolean;
    start: boolean;
    end: boolean;
    connecting: boolean;
    visited?: boolean;
  },
  "infra"
>;
export const GraphNode = memo(function GraphNode({
  data,
  selected,
}: NodeProps<NetworkNode>) {
  const EquipmentIcon = equipmentIcon[data.kind];
  return (
    <div
      className={`infra-node ${data.name.length > 5 ? "long-label" : ""} ${selected ? "selected" : ""} ${data.current ? "current" : ""} ${data.connecting ? "connecting" : ""} ${data.visited ? "visited" : ""} ${data.degree % 2 ? "odd-node" : ""}`}
    >
      {[
        [Position.Left, "left"],
        [Position.Right, "right"],
        [Position.Top, "top"],
        [Position.Bottom, "bottom"],
      ].map(([position, id]) => (
        <Handle
          key={id}
          type="source"
          position={position as Position}
          id={id}
          aria-label={`Conectar ${id}`}
        />
      ))}
      <span className="node-orb" title={data.kind}>
        <EquipmentIcon
          className="equipment-icon"
          size={24}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </span>
      <strong title={`${data.name} · ${data.kind}`}>{data.name}</strong>
      {(data.showDegrees || data.current) && (
        <span className={data.showDegrees ? "degree" : "current-degree"}>
          Grau {data.degree}
        </span>
      )}
      {(data.start || data.end) && (
        <span className="endpoint">
          {data.start && data.end
            ? "Início / fim"
            : data.start
              ? "Início"
              : "Fim"}
        </span>
      )}
    </div>
  );
});
