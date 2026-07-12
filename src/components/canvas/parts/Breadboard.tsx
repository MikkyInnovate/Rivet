"use client";
import React, { useMemo } from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges, Instances, Instance, RoundedBox } from "@react-three/drei";

// Everything derives from the hole pitch (2.54mm real-world). Rows sit at
// integer multiples of P from the center so part legs (also built on P) always
// land in holes: banks at ±1P..±3P, power rails at ±4P and ±5P, channel at 0.
export const BOARD_PITCH = 0.35;
const P = BOARD_PITCH;
const COLS = 36;
const START_X = -((COLS - 1) * P) / 2;
const BODY = { w: 14, h: 0.5, d: 4.2 };
const TOP_Y = BODY.h / 2;

const BANK_ROWS = [-3, -2, -1, 1, 2, 3];
const RAIL_ROWS = [-5, -4, 4, 5];

export default function Breadboard({ node }: { node: SceneNode }) {
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const isSelected = selectedNodeId === node.id;

  const holes = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (let c = 0; c < COLS; c++) {
      const x = START_X + c * P;
      for (const r of BANK_ROWS) out.push({ x, z: r * P });
      // Rails skip every 6th column, like the groups-of-five on a real board
      if (c % 6 !== 5) for (const r of RAIL_ROWS) out.push({ x, z: r * P });
    }
    return out;
  }, []);

  return (
    <group
      position={node.position}
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      {/* Body: single white ABS slab with soft corners */}
      <RoundedBox args={[BODY.w, BODY.h, BODY.d]} radius={0.06} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#fafafa" roughness={0.4} metalness={0.02} />
        {isSelected && <Edges color="#2563EB" scale={1.005} />}
      </RoundedBox>

      {/* Center channel groove between the two banks */}
      <mesh position={[0, TOP_Y - 0.03, 0]}>
        <boxGeometry args={[BODY.w - 0.3, 0.07, 0.24]} />
        <meshStandardMaterial color="#d9d9de" roughness={0.5} />
      </mesh>

      {/* Square holes — one instanced mesh, not hundreds of draw calls */}
      <Instances limit={holes.length}>
        <boxGeometry args={[0.12, 0.04, 0.12]} />
        <meshStandardMaterial color="#2b2d31" roughness={0.9} />
        {holes.map((h, i) => (
          <Instance key={i} position={[h.x, TOP_Y + 0.005, h.z]} />
        ))}
      </Instances>

      {/* Power-rail markings: red (+) outside, blue (−) inside, both sides */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[0, TOP_Y + 0.002, s * (5 * P + 0.16)]}>
            <boxGeometry args={[BODY.w - 1.2, 0.004, 0.045]} />
            <meshStandardMaterial color="#e05252" roughness={0.6} />
          </mesh>
          <mesh position={[0, TOP_Y + 0.002, s * (4 * P - 0.16)]}>
            <boxGeometry args={[BODY.w - 1.2, 0.004, 0.045]} />
            <meshStandardMaterial color="#5286e0" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
