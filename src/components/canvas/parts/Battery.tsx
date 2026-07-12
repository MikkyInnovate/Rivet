"use client";
import React from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges, Html, RoundedBox } from "@react-three/drei";

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
      {/* Main body - 9V battery shaped RoundedBox */}
      <RoundedBox 
        args={[2.2, 2.4, 1.4]} 
        radius={0.15} 
        smoothness={4} 
        position={[0, 1.2, 0]} 
        castShadow
      >
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
        {isSelected && <Edges color="#2563EB" scale={1.03} />}
      </RoundedBox>

      {/* Gray strap / label area */}
      <mesh position={[0, 1.2, 0]}>
        <RoundedBox args={[2.22, 1.0, 1.42]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#333333" roughness={0.7} />
        </RoundedBox>
      </mesh>

      {/* "9.0 Volts" text label */}
      <Html
        position={[0, 0.8, 0.72]}
        transform
        distanceFactor={2.5}
        rotation={[0, 0, 0]}
        scale={[0.5, 0.5, 0.5]}
      >
        <div className="text-white font-sans font-bold text-[18px] select-none pointer-events-none opacity-80 whitespace-nowrap">
          9.0 Volts
        </div>
      </Html>

      {/* "+" and "-" symbols on top beside terminals */}
      <Html
        position={[-0.5, 2.5, 0.5]}
        transform
        distanceFactor={2.5}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <div className="text-white font-bold text-[14px] select-none pointer-events-none opacity-60">
          +
        </div>
      </Html>
      <Html
        position={[0.5, 2.5, 0.5]}
        transform
        distanceFactor={2.5}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <div className="text-white font-bold text-[14px] select-none pointer-events-none opacity-60">
          -
        </div>
      </Html>

      {/* Terminal connector block on top */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
      </mesh>

      {/* + Terminal (left from front) */}
      <mesh position={[-0.25, 2.7, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.25]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.1} />
      </mesh>

      {/* - Terminal (right from front) */}
      <mesh position={[0.25, 2.7, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.25]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.1} />
      </mesh>

      {/* Tooltip voltage label */}
      {showLabels && (
        <Html position={[0, 3.6, 0]} center distanceFactor={12}>
          <div className="bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap shadow-md">
            {voltage}V
          </div>
        </Html>
      )}

      {/* Invisible hitbox */}
      <mesh visible={false}>
        <boxGeometry args={[2.8, 4, 2]} />
      </mesh>
    </group>
  );
}
