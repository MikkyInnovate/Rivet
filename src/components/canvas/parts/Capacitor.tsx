"use client";
import React from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges, Html } from "@react-three/drei";

const LEAD_MAT = <meshStandardMaterial color="#b8bcc4" metalness={0.9} roughness={0.25} />;

// Radial electrolytic capacitor: dark blue can with a crimp ring near the
// base, a light stripe marking the negative side, scored aluminium top, and
// two legs one hole-pitch apart (negative leg under the stripe).
export default function Capacitor({ node }: { node: SceneNode }) {
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const showLabels = useSceneStore((s) => s.showLabels);
  const isSelected = selectedNodeId === node.id;

  const capacitance = (node.properties.capacitance as number) || 100;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      {/* Legs (one pitch apart; + is longer, like real hardware) */}
      <mesh position={[-0.175, 0.25, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.5]} />
        {LEAD_MAT}
      </mesh>
      <mesh position={[0.175, 0.22, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.44]} />
        {LEAD_MAT}
      </mesh>

      {/* Can */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.62, 24]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.35} metalness={0.15} />
        {isSelected && <Edges color="#2563EB" scale={1.06} />}
      </mesh>

      {/* Crimp ring near the base */}
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.235, 0.02, 10, 28]} />
        <meshStandardMaterial color="#172d6e" roughness={0.4} />
      </mesh>

      {/* Negative-side stripe (over the cathode leg, +x side) */}
      <mesh position={[0, 0.78, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.242, 0.242, 0.58, 24, 1, true, -0.22, 0.44]} />
        <meshStandardMaterial color="#dbe3ee" roughness={0.5} side={2} />
      </mesh>

      {/* Aluminium top with score cross */}
      <mesh position={[0, 1.095, 0]}>
        <cylinderGeometry args={[0.235, 0.235, 0.035, 24]} />
        <meshStandardMaterial color="#cdd3da" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.115, 0]}>
        <boxGeometry args={[0.4, 0.006, 0.03]} />
        <meshStandardMaterial color="#9aa1a9" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.115, 0]}>
        <boxGeometry args={[0.03, 0.006, 0.4]} />
        <meshStandardMaterial color="#9aa1a9" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Label */}
      {showLabels && (
        <Html position={[0, 1.5, 0]} center distanceFactor={10}>
          <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
            {capacitance}µF
          </div>
        </Html>
      )}

      {/* Hitbox */}
      <mesh visible={false} position={[0, 0.6, 0]}>
        <boxGeometry args={[0.6, 1.3, 0.6]} />
      </mesh>
    </group>
  );
}
