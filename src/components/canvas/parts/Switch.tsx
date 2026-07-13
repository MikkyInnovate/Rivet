"use client";
import React, { useRef } from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BRASS = <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.3} />;
const LEAD_MAT = <meshStandardMaterial color="#b8bcc4" metalness={0.9} roughness={0.25} />;

// Knife switch on a bakelite base: two brass terminal posts one pitch either
// side of center, a blade that pivots on the left post and drops into the
// clip on the right. Click the blade to throw it.
export default function Switch({ node }: { node: SceneNode }) {
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const updateNodeProperty = useSceneStore((s) => s.updateNodeProperty);
  const showLabels = useSceneStore((s) => s.showLabels);
  const isSelected = selectedNodeId === node.id;

  const closed = (node.properties.state as string) === "closed";
  const bladeRef = useRef<THREE.Group>(null);

  // Smooth, satisfying throw animation toward the target angle.
  useFrame((_, delta) => {
    if (!bladeRef.current) return;
    const target = closed ? -0.04 : 0.85;
    bladeRef.current.rotation.z = THREE.MathUtils.lerp(
      bladeRef.current.rotation.z,
      target,
      delta * 10
    );
  });

  const toggle = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    updateNodeProperty(node.id, "state", closed ? "open" : "closed");
  };

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      {/* Legs down into the board (terminals at ±1 pitch) */}
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.1, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.2]} />
          {LEAD_MAT}
        </mesh>
      ))}

      {/* Bakelite base */}
      <mesh position={[0, 0.26, 0]} castShadow>
        <boxGeometry args={[1.05, 0.12, 0.55]} />
        <meshStandardMaterial color="#3b2420" roughness={0.55} />
        {isSelected && <Edges color="#2563EB" scale={1.05} />}
      </mesh>

      {/* Terminal posts */}
      <mesh position={[-0.35, 0.4, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.18, 14]} />
        {BRASS}
      </mesh>
      <mesh position={[0.35, 0.4, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.18, 14]} />
        {BRASS}
      </mesh>

      {/* Contact clip on the right post */}
      {[-0.055, 0.055].map((z) => (
        <mesh key={z} position={[0.35, 0.52, z]}>
          <boxGeometry args={[0.12, 0.14, 0.02]} />
          {BRASS}
        </mesh>
      ))}

      {/* Blade — pivots on the left post; click to throw */}
      <group ref={bladeRef} position={[-0.35, 0.5, 0]} rotation={[0, 0, closed ? -0.04 : 0.85]}>
        <mesh
          position={[0.36, 0, 0]}
          onClick={toggle}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <boxGeometry args={[0.72, 0.035, 0.07]} />
          {BRASS}
        </mesh>
        {/* Insulated handle at the tip */}
        <mesh position={[0.74, 0.05, 0]} onClick={toggle} onPointerDown={(e) => e.stopPropagation()}>
          <cylinderGeometry args={[0.045, 0.045, 0.16, 12]} />
          <meshStandardMaterial color="#1c1917" roughness={0.5} />
        </mesh>
      </group>

      {/* Pivot bolt */}
      <mesh position={[-0.35, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.12, 12]} />
        {BRASS}
      </mesh>

      {/* Label */}
      {showLabels && (
        <Html position={[0, 1.05, 0]} center distanceFactor={10}>
          <div className="bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
            {closed ? "Closed" : "Open"} — click blade
          </div>
        </Html>
      )}

      {/* Hitbox */}
      <mesh visible={false} position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.7]} />
      </mesh>
    </group>
  );
}
