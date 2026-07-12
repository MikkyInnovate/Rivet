import type { SceneNode } from "@/store/useSceneStore";
import { getPins, pinWorldPosition } from "./pins";

/**
 * Electrical connectivity of the breadboard itself.
 *
 * Like real hardware: within a bank, the holes of one COLUMN (rows ±1..±3 on
 * each side of the channel) are a single metal strip; each power-rail row
 * (±4, ±5) is a single strip running the board's length. Any part leg seated
 * in a hole joins that strip's net — no wire needed.
 *
 * Returns groups of pin keys ("nodeId:pinId") that the solver must union.
 */
const P = 0.35;
const SEAT_Y = 0.44;
const COL_MAX = 6.125;
const EPS = 0.05;

export function boardJunctions(nodes: SceneNode[]): string[][] {
  const board = nodes.find((n) => n.type === "Breadboard");
  if (!board) return [];
  const [bx, , bz] = board.position;

  const groups = new Map<string, string[]>();

  for (const node of nodes) {
    // Only parts actually seated in the board participate.
    if (Math.abs(node.position[1] - SEAT_Y) > 0.02) continue;

    for (const pin of getPins(node.type)) {
      const wp = pinWorldPosition(node, pin.id);
      if (!wp) continue;
      const dx = wp[0] - bx;
      const dz = wp[2] - bz;
      const col = Math.round(dx / P);
      const row = Math.round(dz / P);

      // The leg must land ON a hole: on-grid, inside the field, not in the
      // channel (row 0).
      if (Math.abs(dx - col * P) > EPS || Math.abs(dz - row * P) > EPS) continue;
      if (row === 0 || Math.abs(row) > 5 || Math.abs(col * P) > COL_MAX + EPS) continue;

      const key =
        Math.abs(row) >= 4
          ? `rail:${row}` // whole row is one strip
          : `col:${col}:${row > 0 ? "A" : "B"}`; // column strip per bank

      const list = groups.get(key) ?? [];
      list.push(`${node.id}:${pin.id}`);
      groups.set(key, list);
    }
  }

  return [...groups.values()].filter((g) => g.length >= 2);
}
