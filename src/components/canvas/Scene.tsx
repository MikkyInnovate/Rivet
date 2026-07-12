"use client";
import React, { Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, PivotControls } from "@react-three/drei";
import { useSceneStore, SceneNode, PartType } from "@/store/useSceneStore";
import Battery from "./parts/Battery";
import Breadboard from "./parts/Breadboard";
import LED from "./parts/LED";
import Resistor from "./parts/Resistor";
import Capacitor from "./parts/Capacitor";
import Wire from "./parts/Wire";

function SimulationEngine() {
  const isSimulating = useSceneStore((s) => s.isSimulating);
  const tickSimulation = useSceneStore((s) => s.tickSimulation);

  useFrame((_, delta) => {
    if (isSimulating) {
      tickSimulation(delta);
    }
  });
  return null;
}

function PartRenderer({ node }: { node: SceneNode }) {
  const updateNodePosition = useSceneStore((s) => s.updateNodePosition);
  
  const renderItem = () => {
    switch (node.type) {
      case "Breadboard":
        return <Breadboard node={node} />;
      case "Battery":
        return <Battery node={node} />;
      case "Led":
        return <LED node={node} />;
      case "Resistor":
        return <Resistor node={node} />;
      case "Capacitor":
        return <Capacitor node={node} />;
      case "Fuse":
        return (
          <group>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.6]} />
              <meshStandardMaterial color="#A5F3FC" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.15]} />
              <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.15]} />
              <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  if (node.type === "Breadboard") return renderItem();

  return (
    <PivotControls
      activeAxes={[true, false, true]}
      depthTest={false}
      anchor={[0, 0, 0]}
      scale={2}
      onDragEnd={(m: THREE.Matrix4) => {
        // Extract translation from matrix
        const position = new THREE.Vector3();
        position.setFromMatrixPosition(m);
        // PivotControls relative translation + original position
        const newPos: [number, number, number] = [
          node.position[0] + position.x,
          node.position[1] + position.y,
          node.position[2] + position.z
        ];
        updateNodePosition(node.id, newPos);
      }}
    >
      <group position={node.position}>
        {renderItem()}
      </group>
    </PivotControls>
  ) as unknown as React.ReactNode;
}

function DefaultWires() {
  const nodes = useSceneStore((s) => s.nodes);

  // Find default battery and breadboard to draw wires between them
  const battery = nodes.find((n) => n.id === "default-battery");
  const breadboard = nodes.find((n) => n.id === "default-breadboard");

  if (!battery || !breadboard) return null;

  // Battery terminal positions (world space)
  const batteryX = battery.position[0];
  const batteryY = battery.position[1];
  const batteryZ = battery.position[2];

  // Breadboard world position
  const bbX = breadboard.position[0];
  const bbY = breadboard.position[1];
  const bbZ = breadboard.position[2];

  // Red wire: battery + terminal (left, -0.25) → breadboard top red rail
  const redWireStart: [number, number, number] = [
    batteryX - 0.25,
    batteryY + 2.825,
    batteryZ,
  ];
  const redWireEnd: [number, number, number] = [
    bbX + 4.5,
    bbY + 0.5,
    bbZ - 1.55,
  ];

  // Black wire: battery - terminal (right, +0.25) → breadboard top blue rail
  const blackWireStart: [number, number, number] = [
    batteryX + 0.25,
    batteryY + 2.825,
    batteryZ,
  ];
  const blackWireEnd: [number, number, number] = [
    bbX + 4.1,
    bbY + 0.5,
    bbZ - 1.25,
  ];

  return (
    <>
      <Wire 
        id="default-red"
        start={redWireStart} 
        end={redWireEnd} 
        color="#ef4444" 
        arcHeight={1.8} 
      />
      <Wire 
        id="default-black"
        start={blackWireStart} 
        end={blackWireEnd} 
        color="#1a1a1a" 
        arcHeight={2.2} 
      />
    </>
  );
}

export default function Scene() {
  const nodes = useSceneStore((s) => s.nodes);
  const wires = useSceneStore((s) => s.wires);
  const selectNode = useSceneStore((s) => s.selectNode);
  const selectWire = useSceneStore((s) => s.selectWire);
  const addNode = useSceneStore((s) => s.addNode);

  return (
    <Canvas
      camera={{ position: [0, 28, 8], fov: 35 }}
      onPointerMissed={() => {
        selectNode(null);
        selectWire(null);
      }}
      className="w-full h-full"
      shadows
      gl={{ antialias: true, alpha: false }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("application/nodal-part");
        if (!type) return;

        // Simple approximate placement based on mouse position
        // In a real app we'd use raycasting, but this gives the user
        // the "drag and drop" feel immediately.
        const spawnPos: [number, number, number] = [
          (e.clientX / window.innerWidth - 0.5) * 20, 
          type === 'Breadboard' ? 0.25 : 1, 
          (e.clientY / window.innerHeight - 0.5) * 20
        ];
        
        addNode(type as PartType, spawnPos);
      }}
    >
      <color attach="background" args={["#F8FAFC"]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 25, 10]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-8, 15, -5]}
        intensity={0.3}
        color="#e0f2fe"
      />

      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      {/* Engineering Grid */}
      <Grid
        infiniteGrid
        fadeDistance={50}
        fadeStrength={3}
        sectionColor="#cbd5e1"
        cellColor="#e2e8f0"
        cellSize={1}
        sectionSize={5}
      />

      {/* Render all scene nodes */}
      {nodes.map((node) => (
        <PartRenderer key={node.id} node={node} />
      ))}

      {/* Render all dynamic wires */}
      {wires.map((wire) => {
        const sourceNode = nodes.find((n) => n.id === wire.sourceNodeId);
        const targetNode = nodes.find((n) => n.id === wire.targetNodeId);
        if (!sourceNode || !targetNode) return null;

        const start: [number, number, number] = [
          sourceNode.position[0],
          sourceNode.position[1] + (sourceNode.type === 'Battery' ? 2.825 : 0.5),
          sourceNode.position[2]
        ];
        
        const end: [number, number, number] = [
          targetNode.position[0],
          targetNode.position[1] + (targetNode.type === 'Breadboard' ? 0.25 : 0.5),
          targetNode.position[2]
        ];

        const arcHt = wire.height === 'High' ? 6 : wire.height === 'Medium' ? 4 : 2;

        return (
          <Wire
            key={wire.id}
            id={wire.id}
            start={start}
            end={end}
            color={
              wire.color === 'Red' ? '#ef4444' : 
              wire.color === 'Blue' ? '#3b82f6' : 
              wire.color === 'Green' ? '#10b981' : 
              '#1a1a1a'
            }
            arcHeight={arcHt}
          />
        );
      })}

      {/* Default wires connecting battery to breadboard */}
      <DefaultWires />

      <OrbitControls
        makeDefault
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={5}
        maxDistance={60}
        enableDamping
        dampingFactor={0.05}
      />
      <SimulationEngine />
    </Canvas>
  );
}
