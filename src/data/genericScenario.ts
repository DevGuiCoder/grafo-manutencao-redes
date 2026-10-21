import type { GraphData } from "../graph/Graph";
// An independent synthetic example: 12-cycle plus a triangle of chords.
// Every degree is even; the old five scenarios remain unchanged.
const positions = [
  [170, 70],
  [440, 40],
  [680, 100],
  [230, 220],
  [450, 250],
  [680, 270],
  [90, 360],
  [300, 450],
  [660, 430],
  [440, 570],
  [680, 580],
  [840, 710],
];
const order = [0, 1, 2, 5, 8, 11, 10, 9, 7, 6, 3, 4];
const pairs = [
  ...order.map((v, i) => [v, order[(i + 1) % order.length]]),
  [1, 7],
  [7, 10],
  [10, 1],
];
export const genericScenario: GraphData = {
  name: "Rede Principal",
  vertices: positions.map(([x, y], i) => ({
    id: `N${i + 1}`,
    name: `N${i + 1}`,
    type: "Genérico",
    x,
    y,
  })),
  edges: pairs.map(([a, b], i) => ({
    id: `a${i + 1}`,
    a: `N${a + 1}`,
    b: `N${b + 1}`,
  })),
};
