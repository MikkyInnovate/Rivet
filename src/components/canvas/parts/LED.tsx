"use client";
import React, { useRef } from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLOR_MAP: Record<string, string> = {
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Yellow: "#eab308",
  White: "#f1f5f9",
};

export default function LED({ node }: { node: SceneNode }) {
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const isSimulating = useSceneStore((s) => s.isSimulating);
  const showLabels = useSceneStore((s) => s.showLabels);

  const isSelected = selectedNodeId === node.id;
  const rawColor = (node.properties.color as string) || "Red";
  const colorHex = COLOR_MAP[rawColor] || "#ef4444";

  const bulbRef = useRef<THREE.Mesh>(null);
  const baseRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Animate glow when simulating
  useFrame((_, delta) => {
    if (!bulbRef.current || !baseRef.current) return;
    const mat = bulbRef.current.material as THREE.MeshStandardMaterial;
    const baseMat = baseRef.current.material as THREE.MeshStandardMaterial;
    const targetIntensity = isSimulating ? 3 : 0;
    const current = mat.emissiveIntensity;
    const lerped = THREE.MathUtils.lerp(current, targetIntensity, delta * 5);
    mat.emissiveIntensity = lerped;
    baseMat.emissiveIntensity = lerped;
    if (glowRef.current) {
      glowRef.current.intensity = isSimulating ? 2 : 0;
    }
  });

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      <group position={[0, 1.6, 0]}>
        {/* Bulb base cylinder */}
        <mesh ref={baseRef} position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.3]} />
          <meshStandardMaterial
            color={colorHex}
            transparent
            opacity={0.7}
            emissive={colorHex}
            emissiveIntensity={0}
          />
          {isSelected && <Edges color="#2563EB" scale={1.05} />}
        </mesh>

        {/* Bulb dome */}
        <mesh ref={bulbRef} position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color={colorHex}
            transparent
            opacity={0.7}
            emissive={colorHex}
            emissiveIntensity={0}
          />
        </mesh>

        {/* Point light for glow effect */}
        <pointLight
          ref={glowRef}
          position={[0, 0.1, 0]}
          color={colorHex}
          intensity={0}
          distance={5}
          decay={2}
        />
      </group>

      {/* Legs */}
      <mesh position={[-0.1, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Labels */}
      {showLabels && (
        <>
          <Html position={[-0.1, 2.3, 0]} center distanceFactor={10}>
            <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1 py-0.5 rounded whitespace-nowrap">
              Cathode (-)
            </div>
          </Html>
          <Html position={[0.1, 2.1, 0]} center distanceFactor={10}>
            <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1 py-0.5 rounded whitespace-nowrap">
              Anode (+)
            </div>
          </Html>
        </>
      )}

      {/* Invisible hitbox */}
      <mesh visible={false}>
        <boxGeometry args={[0.8, 2.5, 0.8]} />
      </mesh>
    </group>
  );
}
