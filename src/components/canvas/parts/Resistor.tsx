"use client";
import React from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges, Html } from "@react-three/drei";

// Axial resistor body with color bands
export default function Resistor({ node }: { node: SceneNode }) {
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const showLabels = useSceneStore((s) => s.showLabels);
  const isSelected = selectedNodeId === node.id;

  const resistance = (node.properties.resistance as number) || 220;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      {/* Body - ceramic cylinder */}
      <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.0, 12]} />
        <meshStandardMaterial color="#deb887" roughness={0.8} />
        {isSelected && <Edges color="#2563EB" scale={1.05} />}
      </mesh>

      {/* Color bands */}
      {[-0.3, -0.15, 0, 0.25].map((offset, i) => (
        <mesh
          key={i}
          position={[offset, 1, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.16, 0.16, 0.06, 12]} />
          <meshStandardMaterial
            color={
              i === 0
                ? "#ef4444"
                : i === 1
                ? "#ef4444"
                : i === 2
                ? "#92400e"
                : "#d4a017"
            }
          />
        </mesh>
      ))}

      {/* Legs */}
      <mesh position={[-0.7, 0.55, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.7, 0.55, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Label */}
      {showLabels && (
        <Html position={[0, 1.8, 0]} center distanceFactor={10}>
          <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
            {resistance}Ω
          </div>
        </Html>
      )}

      {/* Hitbox */}
      <mesh visible={false}>
        <boxGeometry args={[1.8, 1.5, 0.6]} />
      </mesh>
    </group>
  );
}
