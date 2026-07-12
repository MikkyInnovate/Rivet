"use client";
import React from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges, Html } from "@react-three/drei";

// Standard resistor color code, digit 0-9.
const CODE = [
  "#1c1917", // 0 black
  "#7c4a03", // 1 brown
  "#dc2626", // 2 red
  "#ea580c", // 3 orange
  "#facc15", // 4 yellow
  "#16a34a", // 5 green
  "#2563eb", // 6 blue
  "#7c3aed", // 7 violet
  "#6b7280", // 8 grey
  "#f8fafc", // 9 white
];
const GOLD = "#d4a017";
const SILVER = "#c0c4cc";

/** 4-band code (2 digits + multiplier) computed from the actual ohm value. */
function bandsFor(resistance: number): [string, string, string] {
  let v = Math.max(1, Math.round(resistance));
  let mult = 0;
  while (v >= 100) { v = Math.round(v / 10); mult++; }
  while (v < 10) { v *= 10; mult--; }
  const d1 = Math.floor(v / 10) % 10;
  const d2 = v % 10;
  const multColor = mult >= 0 && mult <= 9 ? CODE[mult] : mult === -1 ? GOLD : SILVER;
  return [CODE[d1], CODE[d2], multColor];
}

const LEAD_MAT = <meshStandardMaterial color="#b8bcc4" metalness={0.9} roughness={0.25} />;

// Axial through-hole resistor: tan body low over the board, leads exiting the
// ends horizontally, bending down to the surface.
export default function Resistor({ node }: { node: SceneNode }) {
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const showLabels = useSceneStore((s) => s.showLabels);
  const isSelected = selectedNodeId === node.id;

  const resistance = (node.properties.resistance as number) || 220;
  const [b1, b2, b3] = bandsFor(resistance);
  const BODY_Y = 0.35;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      {/* Body: cylinder with rounded end caps */}
      <mesh position={[0, BODY_Y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.6, 20]} />
        <meshStandardMaterial color="#d9b48a" roughness={0.65} />
        {isSelected && <Edges color="#2563EB" scale={1.06} />}
      </mesh>
      <mesh position={[-0.3, BODY_Y, 0]}>
        <sphereGeometry args={[0.16, 20, 14]} />
        <meshStandardMaterial color="#d9b48a" roughness={0.65} />
      </mesh>
      <mesh position={[0.3, BODY_Y, 0]}>
        <sphereGeometry args={[0.16, 20, 14]} />
        <meshStandardMaterial color="#d9b48a" roughness={0.65} />
      </mesh>

      {/* Value bands (computed from resistance) + gold tolerance band */}
      {[
        { x: -0.19, c: b1 },
        { x: -0.09, c: b2 },
        { x: 0.01, c: b3 },
        { x: 0.21, c: GOLD },
      ].map(({ x, c }, i) => (
        <mesh key={i} position={[x, BODY_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.168, 0.168, 0.05, 20]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      ))}

      {/* Leads: out of the body ends, elbow, then down to the board */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.42, BODY_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.26]} />
            {LEAD_MAT}
          </mesh>
          <mesh position={[side * 0.55, BODY_Y, 0]}>
            <sphereGeometry args={[0.021, 10, 10]} />
            {LEAD_MAT}
          </mesh>
          <mesh position={[side * 0.55, BODY_Y / 2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, BODY_Y]} />
            {LEAD_MAT}
          </mesh>
        </group>
      ))}

      {/* Label */}
      {showLabels && (
        <Html position={[0, 0.95, 0]} center distanceFactor={10}>
          <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
            {resistance >= 1000 ? `${resistance / 1000}kΩ` : `${resistance}Ω`}
          </div>
        </Html>
      )}

      {/* Hitbox */}
      <mesh visible={false} position={[0, 0.35, 0]}>
        <boxGeometry args={[1.3, 0.75, 0.5]} />
      </mesh>
    </group>
  );
}
