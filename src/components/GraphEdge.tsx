import { BaseEdge, Position, type Edge, type EdgeProps } from "@xyflow/react";
export type NetworkEdge = Edge<
  {
    state: "normal" | "visited" | "active";
    reverse: boolean;
    playing: boolean;
    speed: number;
    order?: number;
  },
  "link"
>;
export function GraphEdge({
  id,
  sourceX: handleSourceX,
  sourceY: handleSourceY,
  targetX: handleTargetX,
  targetY: handleTargetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<NetworkEdge>) {
  // Lines meet the circular node centers; connector hit areas stay on its rim.
  const centerOffset = (position: Position) => ({
    x: position === Position.Left ? 22 : position === Position.Right ? -22 : 0,
    y: position === Position.Top ? 22 : position === Position.Bottom ? -22 : 0,
  });
  const sourceX = handleSourceX + centerOffset(sourcePosition).x;
  const sourceY = handleSourceY + centerOffset(sourcePosition).y;
  const targetX = handleTargetX + centerOffset(targetPosition).x;
  const targetY = handleTargetY + centerOffset(targetPosition).y;
  const path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  const active = data?.state === "active";
  const visited = data?.state === "visited";
  const movingPath = data?.reverse
    ? `M ${targetX},${targetY} L ${sourceX},${sourceY}`
    : path;
  return (
    <g
      className={`network-edge ${active ? "active-edge" : visited ? "visited-edge" : "idle-edge"} ${data?.playing ? "playing" : ""}`}
    >
      <BaseEdge
        id={id}
        path={path}
        interactionWidth={22}
        style={{
          stroke: selected
            ? "var(--secondary)"
            : active
              ? "var(--primary)"
              : visited
                ? "var(--success)"
                : "var(--edge-idle)",
          strokeWidth: active ? 2.8 : visited || selected ? 2 : 1.2,
          strokeDasharray: active ? "8 5" : undefined,
        }}
      />
      {active && data?.playing && (
        <circle r="5" fill="#ecfcff" className="flow-particle">
          <animateMotion
            key={`${id}-${data.reverse}-${data.speed}`}
            dur={`${1.1 / data.speed}s`}
            path={movingPath}
            repeatCount="indefinite"
          />
        </circle>
      )}
      {selected && (
        <g
          transform={`translate(${(sourceX + targetX) / 2},${(sourceY + targetY) / 2})`}
        >
          <circle r="12" fill="#182119" stroke="var(--primary)" />
          <text textAnchor="middle" dy="4" fill="#effbdc" fontSize="10">
            {data?.order ?? "•"}
          </text>
        </g>
      )}
      {(visited || active) && (
        <g
          transform={`translate(${sourceX + (targetX - sourceX) * 0.65},${sourceY + (targetY - sourceY) * 0.65}) rotate(${(Math.atan2(targetY - sourceY, targetX - sourceX) * 180) / Math.PI + (data?.reverse ? 180 : 0)})`}
        >
          <path d="M -6 -5 L 3 0 L -6 5 Z" fill="var(--primary)" />
        </g>
      )}
    </g>
  );
}
