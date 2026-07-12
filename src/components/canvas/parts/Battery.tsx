"use client";
import React from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges, Html, RoundedBox } from "@react-three/drei";

// PP3-style 9V battery: dark jacket with a copper band, steel top plate, and
// the two snap terminals — small male post (+) and wider female ring (−).
export default function Battery({ node }: { node: SceneNode }) {
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const showLabels = useSceneStore((s) => s.showLabels);
  const isSelected = selectedNodeId === node.id;

  const voltage = (node.properties.voltage as number) || 9;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      {/* Jacket */}
      <RoundedBox args={[1.35, 2.1, 0.85]} radius={0.09} smoothness={3} position={[0, 1.05, 0]} castShadow>
        <meshStandardMaterial color="#1c1917" roughness={0.45} metalness={0.1} />
        {isSelected && <Edges color="#2563EB" scale={1.03} />}
      </RoundedBox>

      {/* Copper label band */}
      <RoundedBox args={[1.37, 0.8, 0.87]} radius={0.09} smoothness={3} position={[0, 0.95, 0]}>
        <meshStandardMaterial color="#b45309" roughness={0.5} metalness={0.3} />
      </RoundedBox>

      {/* Steel top plate */}
      <mesh position={[0, 2.16, 0]}>
        <boxGeometry args={[1.3, 0.1, 0.8]} />
        <meshStandardMaterial color="#c8ccd2" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* + terminal: small male post (left) */}
      <mesh position={[-0.35, 2.3, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.18, 16]} />
        <meshStandardMaterial color="#d6dade" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* − terminal: wider female snap ring (right) */}
      <mesh position={[0.35, 2.28, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.14, 18]} />
        <meshStandardMaterial color="#c2c7cd" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.35, 2.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.028, 10, 24]} />
        <meshStandardMaterial color="#aab0b8" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Voltage on the label band */}
      <Html position={[0, 0.95, 0.46]} transform distanceFactor={2.5} scale={[0.5, 0.5, 0.5]}>
        <div className="text-white font-sans font-bold text-[16px] select-none pointer-events-none opacity-90 whitespace-nowrap">
          {voltage}V
        </div>
      </Html>

      {/* Terminal labels */}
      {showLabels && (
        <>
          <Html position={[-0.35, 2.6, 0]} center distanceFactor={10}>
            <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1 py-0.5 rounded">+</div>
          </Html>
          <Html position={[0.35, 2.6, 0]} center distanceFactor={10}>
            <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1 py-0.5 rounded">−</div>
          </Html>
        </>
      )}

      {/* Hitbox */}
      <mesh visible={false} position={[0, 1.15, 0]}>
        <boxGeometry args={[1.5, 2.5, 1.0]} />
      </mesh>
    </group>
  );
}
