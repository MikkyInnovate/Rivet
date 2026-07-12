"use client";
import React from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges, Html } from "@react-three/drei";

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
      {/* Electrolytic cap body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
        <meshStandardMaterial color="#1e40af" roughness={0.5} metalness={0.2} />
        {isSelected && <Edges color="#2563EB" scale={1.05} />}
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 16]} />
        <meshStandardMaterial color="#93c5fd" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Polarity stripe */}
      <mesh position={[0.31, 1.2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.02, 1.0, 0.3]} />
        <meshStandardMaterial color="#bfdbfe" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.1, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.1, 0.25, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Label */}
      {showLabels && (
        <Html position={[0, 2.2, 0]} center distanceFactor={10}>
          <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
            {capacitance}µF
          </div>
        </Html>
      )}

      {/* Hitbox */}
      <mesh visible={false}>
        <boxGeometry args={[0.8, 2, 0.8]} />
      </mesh>
    </group>
  );
}
