"use client";
import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { getPins } from "@/lib/circuit/pins";

/**
 * Clickable electrical terminals for a part. Click one pin, then another on a
 * different part, to create a wire (store.connectPin handles the handshake).
 * Rendered inside the part's group, so offsets are in part-local space.
 */
export default function Pins({ node }: { node: SceneNode }) {
  const connectPin = useSceneStore((s) => s.connectPin);
  const pendingPin = useSceneStore((s) => s.pendingPin);
  const [hovered, setHovered] = useState<string | null>(null);

  const pins = getPins(node.type);
  if (pins.length === 0) return null;

  return (
    <>
      {pins.map((pin) => {
        const isArmed =
          pendingPin?.nodeId === node.id && pendingPin?.pinId === pin.id;
        const isHovered = hovered === pin.id;
        const active = isArmed || isHovered;

        return (
          <group key={pin.id} position={pin.offset}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                connectPin(node.id, pin.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(pin.id);
                document.body.style.cursor = "crosshair";
              }}
              onPointerOut={() => {
                setHovered(null);
                document.body.style.cursor = "auto";
              }}
            >
              <sphereGeometry args={[isArmed ? 0.11 : 0.08, 16, 16]} />
              <meshStandardMaterial
                color={isArmed ? "#2DD4BF" : isHovered ? "#5EEAD4" : "#94a3b8"}
                emissive={active ? "#2DD4BF" : "#000000"}
                emissiveIntensity={isArmed ? 1.2 : isHovered ? 0.6 : 0}
                metalness={0.6}
                roughness={0.3}
              />
            </mesh>
            {/* Label appears on hover / while armed */}
            {active && (
              <Html center distanceFactor={8} position={[0, 0.22, 0]}>
                <div className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono font-bold pointer-events-none whitespace-nowrap">
                  {pin.label}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}
