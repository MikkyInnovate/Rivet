"use client";
import React, { useMemo } from "react";
import { useSceneStore, SceneNode } from "@/store/useSceneStore";
import { Edges } from "@react-three/drei";

export default function Breadboard({ node }: { node: SceneNode }) {
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const isSelected = selectedNodeId === node.id;

  // Generate pin holes — dark visible dots
  const pins = useMemo(() => {
    const result: { x: number; z: number }[] = [];
    const cols = 30;
    const rows = 5;
    const spacing = 0.35;
    const startX = -(cols * spacing) / 2;

    // Top power rail row 1
    for (let c = 0; c < cols; c++) {
      result.push({ x: startX + c * spacing, z: -1.55 });
    }
    // Top power rail row 2
    for (let c = 0; c < cols; c++) {
      result.push({ x: startX + c * spacing, z: -1.25 });
    }

    // Main section top (5 rows)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({
          x: startX + c * spacing,
          z: -0.7 + r * spacing,
        });
      }
    }

    // Main section bottom (5 rows)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({
          x: startX + c * spacing,
          z: 0.55 + r * spacing,
        });
      }
    }

    // Bottom power rail row 1
    for (let c = 0; c < cols; c++) {
      result.push({ x: startX + c * spacing, z: 1.25 });
    }
    // Bottom power rail row 2
    for (let c = 0; c < cols; c++) {
      result.push({ x: startX + c * spacing, z: 1.55 });
    }

    return result;
  }, []);

  return (
    <group
      position={node.position}
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[14, 0.5, 4.2]} />
        <meshStandardMaterial
          color="#f0f0f0"
          roughness={0.2}
          metalness={0.05}
        />
        {isSelected && <Edges color="#2563EB" scale={1.01} />}
      </mesh>

      {/* Raised edge - top */}
      <mesh position={[0, 0.15, -2.0]}>
        <boxGeometry args={[14.2, 0.3, 0.2]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.3} />
      </mesh>
      {/* Raised edge - bottom */}
      <mesh position={[0, 0.15, 2.0]}>
        <boxGeometry args={[14.2, 0.3, 0.2]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.3} />
      </mesh>
      {/* Raised edge - left */}
      <mesh position={[-7.0, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.3, 4.2]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.3} />
      </mesh>
      {/* Raised edge - right */}
      <mesh position={[7.0, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.3, 4.2]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.3} />
      </mesh>

      {/* Side clips */}
      {[-5, -2, 2, 5].map((xPos) => (
        <mesh key={`clip-top-${xPos}`} position={[xPos, 0.05, -2.2]}>
          <boxGeometry args={[0.6, 0.2, 0.25]} />
          <meshStandardMaterial color="#d4d4d4" roughness={0.3} />
        </mesh>
      ))}
      {[-5, -2, 2, 5].map((xPos) => (
        <mesh key={`clip-bot-${xPos}`} position={[xPos, 0.05, 2.2]}>
          <boxGeometry args={[0.6, 0.2, 0.25]} />
          <meshStandardMaterial color="#d4d4d4" roughness={0.3} />
        </mesh>
      ))}

      {/* Center divider groove */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[12.5, 0.02, 0.2]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>

      {/* Power rail color stripes */}
      {/* Top red line */}
      <mesh position={[0, 0.262, -1.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.04]} />
        <meshBasicMaterial color="#ef4444" opacity={0.7} transparent />
      </mesh>
      {/* Top blue line */}
      <mesh position={[0, 0.262, -1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.04]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.7} transparent />
      </mesh>
      {/* Bottom red line */}
      <mesh position={[0, 0.262, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.04]} />
        <meshBasicMaterial color="#ef4444" opacity={0.7} transparent />
      </mesh>
      {/* Bottom blue line */}
      <mesh position={[0, 0.262, 1.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.04]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.7} transparent />
      </mesh>

      {/* + symbols at power rail edges */}
      {[-6.2, 6.2].map((xPos) => (
        <React.Fragment key={`plus-top-${xPos}`}>
          <mesh position={[xPos, 0.27, -1.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 0.04]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[xPos, 0.27, -1.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.04, 0.15]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </React.Fragment>
      ))}
      {[-6.2, 6.2].map((xPos) => (
        <React.Fragment key={`minus-top-${xPos}`}>
          <mesh position={[xPos, 0.27, -1.25]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 0.04]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </React.Fragment>
      ))}
      {[-6.2, 6.2].map((xPos) => (
        <React.Fragment key={`plus-bot-${xPos}`}>
          <mesh position={[xPos, 0.27, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 0.04]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[xPos, 0.27, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.04, 0.15]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </React.Fragment>
      ))}
      {[-6.2, 6.2].map((xPos) => (
        <React.Fragment key={`minus-bot-${xPos}`}>
          <mesh position={[xPos, 0.27, 1.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 0.04]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </React.Fragment>
      ))}

      {/* Pin holes — dark circles visible from top */}
      {pins.map((pin, i) => (
        <mesh
          key={i}
          position={[pin.x, 0.265, pin.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.07, 8]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}
