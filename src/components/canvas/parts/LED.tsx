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
  const simulation = useSceneStore((s) => s.simulation);
  const showLabels = useSceneStore((s) => s.showLabels);

  const isSelected = selectedNodeId === node.id;
  const rawColor = (node.properties.color as string) || "Red";
  const colorHex = COLOR_MAP[rawColor] || "#ef4444";

  const bulbRef = useRef<THREE.Mesh>(null);
  const baseRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Glow follows the SOLVED circuit, not the Simulate button: off when the
  // loop is open or the LED is reversed, lit when current actually flows,
  // and a harsh flicker when over-current (no resistor).
  const ledState = simulation?.ledStates[node.id] ?? "off";

  useFrame((state, delta) => {
    if (!bulbRef.current || !baseRef.current) return;
    const mat = bulbRef.current.material as THREE.MeshStandardMaterial;
    const baseMat = baseRef.current.material as THREE.MeshStandardMaterial;

    let targetIntensity = 0;
    if (ledState === "on") targetIntensity = 3;
    if (ledState === "over") {
      // Distressed flicker: something is wrong and it should look wrong.
      targetIntensity = 5 + Math.sin(state.clock.elapsedTime * 40) * 1.5;
    }

    const lerped = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, delta * 5);
    mat.emissiveIntensity = lerped;
    baseMat.emissiveIntensity = lerped;
    if (glowRef.current) {
      glowRef.current.intensity = ledState === "over" ? 4 : ledState === "on" ? 2 : 0;
    }
  });

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      {/* Legs — real 5mm LED: the LONGER leg is the anode (+), on the left */}
      <mesh position={[-0.1, 0.475, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.95]} />
        <meshStandardMaterial color="#b8bcc4" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.8]} />
        <meshStandardMaterial color="#b8bcc4" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Flange (the flat rim at the base of the epoxy package) */}
      <mesh ref={baseRef} position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.06, 24]} />
        <meshPhysicalMaterial
          color={colorHex}
          transparent
          opacity={0.9}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={colorHex}
          emissiveIntensity={0}
        />
        {isSelected && <Edges color="#2563EB" scale={1.08} />}
      </mesh>

      {/* Epoxy body */}
      <mesh position={[0, 1.185, 0]}>
        <cylinderGeometry args={[0.165, 0.165, 0.35, 24]} />
        <meshPhysicalMaterial
          color={colorHex}
          transparent
          opacity={0.85}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.06}
          ior={1.45}
          emissive={colorHex}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Dome cap */}
      <mesh ref={bulbRef} position={[0, 1.36, 0]}>
        <sphereGeometry args={[0.165, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={colorHex}
          transparent
          opacity={0.85}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.06}
          ior={1.45}
          emissive={colorHex}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Internal anvil + post, visible through the epoxy like a real LED */}
      <mesh position={[0.04, 1.15, 0]}>
        <boxGeometry args={[0.07, 0.16, 0.04]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[-0.05, 1.1, 0]}>
        <boxGeometry args={[0.03, 0.1, 0.03]} />
        <meshStandardMaterial color="#52525b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight
        ref={glowRef}
        position={[0, 1.35, 0]}
        color={colorHex}
        intensity={0}
        distance={5}
        decay={2}
      />

      {/* Labels */}
      {showLabels && (
        <>
          <Html position={[-0.1, 1.85, 0]} center distanceFactor={10}>
            <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1 py-0.5 rounded whitespace-nowrap">
              Anode (+)
            </div>
          </Html>
          <Html position={[0.1, 1.65, 0]} center distanceFactor={10}>
            <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1 py-0.5 rounded whitespace-nowrap">
              Cathode (−)
            </div>
          </Html>
        </>
      )}

      {/* Invisible hitbox */}
      <mesh visible={false} position={[0, 0.9, 0]}>
        <boxGeometry args={[0.7, 1.8, 0.6]} />
      </mesh>
    </group>
  );
}
