"use client";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { useSceneStore, SceneNode, PartType } from "@/store/useSceneStore";
import Battery from "./parts/Battery";
import Breadboard from "./parts/Breadboard";
import LED from "./parts/LED";
import Resistor from "./parts/Resistor";
import Capacitor from "./parts/Capacitor";
import Wire from "./parts/Wire";
import Switch from "./parts/Switch";
import Pins from "./Pins";
import { pinWorldPosition } from "@/lib/circuit/pins";

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

/** Intersect the pointer ray with the horizontal plane y=0. */
function rayToGround(e: ThreeEvent<PointerEvent>): [number, number] {
  const t = -e.ray.origin.y / e.ray.direction.y;
  return [
    e.ray.origin.x + e.ray.direction.x * t,
    e.ray.origin.z + e.ray.direction.z * t,
  ];
}

function PartRenderer({ node }: { node: SceneNode }) {
  const updateNodePosition = useSceneStore((s) => s.updateNodePosition);
  const selectNode = useSceneStore((s) => s.selectNode);
  const pushHistory = useSceneStore((s) => s.pushHistory);
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;
  const [dragging, setDragging] = useState(false);
  const grabOffset = useRef<[number, number]>([0, 0]);
  
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
      case "Tactile Switch":
        return <Switch node={node} />;
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

  // Direct manipulation: grab the part anywhere and drag it across the bench.
  // The store snaps it into breadboard holes when it's over the board.
  return (
    <group
      position={node.position}
      rotation={node.rotation}
      onPointerDown={(e) => {
        e.stopPropagation();
        selectNode(node.id);
        pushHistory(); // one undo step per drag
        const [gx, gz] = rayToGround(e);
        grabOffset.current = [node.position[0] - gx, node.position[2] - gz];
        setDragging(true);
        (e.target as Element).setPointerCapture(e.pointerId);
        if (controls) controls.enabled = false;
        document.body.style.cursor = "grabbing";
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        e.stopPropagation();
        const [gx, gz] = rayToGround(e);
        updateNodePosition(node.id, [
          gx + grabOffset.current[0],
          0,
          gz + grabOffset.current[1],
        ]);
      }}
      onPointerUp={(e) => {
        if (!dragging) return;
        e.stopPropagation();
        setDragging(false);
        (e.target as Element).releasePointerCapture(e.pointerId);
        if (controls) controls.enabled = true;
        document.body.style.cursor = "auto";
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!dragging) document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        if (!dragging) document.body.style.cursor = "auto";
      }}
    >
      {renderItem()}
      <Pins node={node} />
    </group>
  );
}

/** Teal ghost wire from the armed pin to the cursor while wiring. */
function GhostWire({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const geometry = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().lerpVectors(a, b, 0.5);
    mid.y += Math.min(0.3 + a.distanceTo(b) * 0.12, 1.2);
    const curve = new THREE.CatmullRomCurve3([a, mid, b]);
    return new THREE.TubeGeometry(curve, 20, 0.035, 8, false);
  }, [from, to]);
  return (
    <mesh geometry={geometry} raycast={() => null}>
      <meshBasicMaterial color="#2DD4BF" transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}

export default function Scene() {
  const nodes = useSceneStore((s) => s.nodes);
  const wires = useSceneStore((s) => s.wires);
  const selectNode = useSceneStore((s) => s.selectNode);
  const selectWire = useSceneStore((s) => s.selectWire);
  const addNode = useSceneStore((s) => s.addNode);
  const pendingPin = useSceneStore((s) => s.pendingPin);

  // Rubber-band wiring preview: track the cursor on the ground plane while a
  // pin is armed.
  const [wireCursor, setWireCursor] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (!pendingPin) setWireCursor(null);
  }, [pendingPin]);
  const pendingSource = pendingPin ? nodes.find((n) => n.id === pendingPin.nodeId) : null;
  const ghostFrom = pendingSource && pendingPin ? pinWorldPosition(pendingSource, pendingPin.pinId) : null;

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
          type === 'Breadboard' ? 0.25 : 0, 
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

      {/* Wiring preview: cursor tracker plane + ghost wire */}
      {pendingPin && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.02, 0]}
          onPointerMove={(e) => {
            const [gx, gz] = rayToGround(e);
            setWireCursor([gx, gz]);
          }}
        >
          <planeGeometry args={[300, 300]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {ghostFrom && wireCursor && (
        <GhostWire from={ghostFrom} to={[wireCursor[0], 0.12, wireCursor[1]]} />
      )}

      {/* Render all scene nodes */}
      {nodes.map((node) => (
        <PartRenderer key={node.id} node={node} />
      ))}

      {/* Render all dynamic wires */}
      {wires.map((wire) => {
        const sourceNode = nodes.find((n) => n.id === wire.sourceNodeId);
        const targetNode = nodes.find((n) => n.id === wire.targetNodeId);
        if (!sourceNode || !targetNode) return null;

        const start: [number, number, number] =
          pinWorldPosition(sourceNode, wire.sourcePin) ?? [
            sourceNode.position[0],
            sourceNode.position[1] + 0.5,
            sourceNode.position[2],
          ];

        const end: [number, number, number] =
          pinWorldPosition(targetNode, wire.targetPin) ?? [
            targetNode.position[0],
            targetNode.position[1] + 0.5,
            targetNode.position[2],
          ];

        // Natural jumper arc: scales with span instead of the old fixed
        // rainbow heights; the height setting is a subtle multiplier.
        const span = Math.hypot(start[0] - end[0], start[2] - end[2]);
        const mult = wire.height === 'High' ? 1.6 : wire.height === 'Medium' ? 1 : 0.55;
        const arcHt = Math.min(0.35 + span * 0.16, 2.0) * mult;

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
