import {
  Building2,
  UtilityPole,
  Box,
  Network,
  Server,
  Wrench,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { VertexType } from "../graph/Vertex";

/** Presentation only: the symbol never changes the vertex type or graph. */
export const equipmentIcon: Record<VertexType, LucideIcon> = {
  Genérico: MapPin,
  Central: Building2,
  Poste: UtilityPole,
  Caixa: Box,
  Switch: Network,
  Armário: Server,
  "Ponto técnico": Wrench,
};
