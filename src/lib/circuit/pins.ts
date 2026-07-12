import type { SceneNode, PartType } from "@/store/useSceneStore";

export interface PinDef {
  id: string;
  label: string;
  /** Offset from the part's origin, matching each part's lead geometry. */
  offset: [number, number, number];
}

/**
 * Electrical terminals per part type. Parts not listed here (breadboard,
 * decorative wire object, etc.) can't be wired.
 */
export const PART_PINS: Partial<Record<PartType, PinDef[]>> = {
  Battery: [
    { id: "pos", label: "+", offset: [-0.35, 2.44, 0] },
    { id: "neg", label: "−", offset: [0.35, 2.42, 0] },
  ],
  Led: [
    { id: "anode", label: "+", offset: [-0.175, 0.08, 0] },
    { id: "cathode", label: "−", offset: [0.175, 0.08, 0] },
  ],
  Resistor: [
    { id: "a", label: "1", offset: [-0.7, 0.08, 0] },
    { id: "b", label: "2", offset: [0.7, 0.08, 0] },
  ],
  Capacitor: [
    { id: "pos", label: "+", offset: [-0.175, 0.08, 0] },
    { id: "neg", label: "−", offset: [0.175, 0.08, 0] },
  ],
};

export function getPins(type: PartType): PinDef[] {
  return PART_PINS[type] ?? [];
}

export function isWireable(type: PartType): boolean {
  return getPins(type).length > 0;
}

/** World-space position of a pin, honoring the part's yaw (Y rotation). */
export function pinWorldPosition(
  node: SceneNode,
  pinId: string
): [number, number, number] | null {
  const pin = getPins(node.type).find((p) => p.id === pinId);
  if (!pin) return null;
  const yaw = node.rotation?.[1] ?? 0;
  const [ox, oy, oz] = pin.offset;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  return [
    node.position[0] + ox * cos + oz * sin,
    node.position[1] + oy,
    node.position[2] - ox * sin + oz * cos,
  ];
}
