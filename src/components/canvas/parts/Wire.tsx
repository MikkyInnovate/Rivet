"use client";
import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import { useSceneStore } from "@/store/useSceneStore";

interface WireProps {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  arcHeight?: number;
}

function Connector({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.2, 0.4, 0.2]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
    </mesh>
  );
}

export default function Wire({ id, start, end, color, arcHeight = 3 }: WireProps) {
  const selectedWireId = useSceneStore((s) => s.selectedWireId);
  const selectWire = useSceneStore((s) => s.selectWire);
  const isSelected = selectedWireId === id;
  const [hovered, setHovered] = useState(false);

  const curve = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const dist = startVec.distanceTo(endVec);

    // Midpoint with arc
    const mid = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);
    mid.y += arcHeight;

    // Control points for a smoother, shallow-start arc
    // Move CP1/CP2 horizontally towards the mid, but keep Y low initially
    const cp1 = new THREE.Vector3().lerpVectors(startVec, endVec, 0.2);
    cp1.y = startVec.y + arcHeight * 0.4;

    const cp2 = new THREE.Vector3().lerpVectors(startVec, endVec, 0.8);
    cp2.y = endVec.y + arcHeight * 0.4;

    return new THREE.CatmullRomCurve3(
      [startVec, cp1, mid, cp2, endVec],
      false,
      "catmullrom",
      0.5
    );
  }, [start, end, arcHeight]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.05, 8, false);
  }, [curve]);

  return (
    <group 
      onClick={(e) => {
        e.stopPropagation();
        selectWire(id);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial 
          color={color} 
          roughness={0.4} 
          metalness={0.2} 
          emissive={isSelected || hovered ? color : "black"}
          emissiveIntensity={isSelected ? 0.5 : hovered ? 0.2 : 0}
        />
        {isSelected && <Edges color="#2563EB" scale={1.1} />}
      </mesh>
      <Connector position={start} />
      <Connector position={end} />
    </group>
  );
}
