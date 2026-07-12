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
    { id: "pos", label: "+", offset: [0.5, 2.75, 0.5] },
    { id: "neg", label: "−", offset: [-0.5, 2.75, 0.5] },
  ],
  Led: [
    { id: "anode", label: "+", offset: [-0.14, 0.5, 0] },
    { id: "cathode", label: "−", offset: [0.14, 0.42, 0] },
  ],
  Resistor: [
    { id: "a", label: "1", offset: [-0.78, 0.55, 0] },
    { id: "b", label: "2", offset: [0.78, 0.55, 0] },
  ],
  Capacitor: [
    { id: "pos", label: "+", offset: [-0.14, 0.3, 0] },
    { id: "neg", label: "−", offset: [0.14, 0.27, 0] },
  ],
};

export function getPins(type: PartType): PinDef[] {
  return PART_PINS[type] ?? [];
}

export function isWireable(type: PartType): boolean {
  return getPins(type).length > 0;
}

/** World-space position of a pin (part rotation not yet supported). */
export function pinWorldPosition(
  node: SceneNode,
  pinId: string
): [number, number, number] | null {
  const pin = getPins(node.type).find((p) => p.id === pinId);
  if (!pin) return null;
  return [
    node.position[0] + pin.offset[0],
    node.position[1] + pin.offset[1],
    node.position[2] + pin.offset[2],
  ];
}
