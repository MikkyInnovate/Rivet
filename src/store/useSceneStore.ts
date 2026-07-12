import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type PartType =
  | 'Battery'
  | 'Led'
  | 'Breadboard'
  | 'Wire'
  | 'Resistor'
  | 'Capacitor'
  | 'Fuse'
  | 'NPN Transistor'
  | 'PNP Transistor'
  | 'Motor'
  | 'Tactile Switch';

export interface SceneNode {
  id: string;
  type: PartType;
  position: [number, number, number];
  rotation: [number, number, number];
  properties: Record<string, unknown>;
}

export interface WireConnection {
  id: string;
  sourceNodeId: string;
  sourcePin: string;
  targetNodeId: string;
  targetPin: string;
  color: string;
  height: 'Low' | 'Medium' | 'High';
  showCurrent: boolean;
}

interface HistorySnapshot {
  nodes: SceneNode[];
  wires: WireConnection[];
}

interface SceneState {
  // Scene data
  nodes: SceneNode[];
  wires: WireConnection[];
  selectedNodeId: string | null;
  selectedWireId: string | null;

  // Simulation
  isSimulating: boolean;
  simulationTime: number;
  showLabels: boolean;
  showVoltages: boolean;

  // Project info
  projectName: string;

  // History
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];

  // Actions
  addNode: (type: PartType, position?: [number, number, number]) => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, position: [number, number, number]) => void;
  updateNodeProperty: (id: string, key: string, value: unknown) => void;
  selectNode: (id: string | null) => void;
  selectWire: (id: string | null) => void;
  deleteSelectedNode: () => void;
  deleteSelectedWire: () => void;

  // Wire actions
  addWire: (wire: Omit<WireConnection, 'id'>) => void;
  updateWireProperty: (id: string, key: string, value: unknown) => void;

  // Simulation
  toggleSimulation: () => void;
  tickSimulation: (deltaTime: number) => void;
  toggleShowLabels: () => void;
  toggleShowVoltages: () => void;

  // Project
  setProjectName: (name: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const DEFAULT_PROPS: Record<string, Record<string, unknown>> = {
  Battery: { voltage: 9 },
  Led: { color: 'Red' },
  Resistor: { resistance: 220, unit: 'Ω' },
  Capacitor: { capacitance: 100, unit: 'µF' },
  Fuse: { currentLimit: 1, state: 'intact' },
  Wire: { color: 'Red', height: 'Medium', showCurrent: false },
  Breadboard: {},
  'NPN Transistor': { gain: 100 },
  'PNP Transistor': { gain: 100 },
  Motor: { ratedVoltage: 5 },
  'Tactile Switch': { state: 'open' },
};

const INITIAL_NODES: SceneNode[] = [
  {
    id: 'default-breadboard',
    type: 'Breadboard',
    position: [-2, 0.25, 0],
    rotation: [0, 0, 0],
    properties: {},
  },
  {
    id: 'default-battery',
    type: 'Battery',
    position: [9, 0, 0],
    rotation: [0, 0, 0],
    properties: { voltage: 9 },
  },
];

export const useSceneStore = create<SceneState>((set, get) => ({
  nodes: INITIAL_NODES,
  wires: [],
  selectedNodeId: null,
  selectedWireId: null,
  isSimulating: false,
  simulationTime: 0,
  showLabels: false,
  showVoltages: false,
  projectName: 'Untitled',
  undoStack: [],
  redoStack: [],

  pushHistory: () => {
    const { nodes, wires, undoStack } = get();
    const snapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      wires: JSON.parse(JSON.stringify(wires)),
    };
    set({
      undoStack: [...undoStack.slice(-49), snapshot],
      redoStack: [],
    });
  },

  addNode: (type, position) => {
    const state = get();
    state.pushHistory();
    const spawnPos = position || [(Math.random() - 0.5) * 4, type === 'Breadboard' ? 0.25 : 1, (Math.random() - 0.5) * 4];
    const newNode: SceneNode = {
      id: uuidv4(),
      type,
      position: spawnPos as [number, number, number],
      rotation: [0, 0, 0],
      properties: { ...(DEFAULT_PROPS[type] || {}) },
    };
    set({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
      selectedWireId: null,
    });
  },

  removeNode: (id) => {
    const state = get();
    state.pushHistory();
    set({
      nodes: state.nodes.filter((n) => n.id !== id),
      wires: state.wires.filter(
        (w) => w.sourceNodeId !== id && w.targetNodeId !== id
      ),
      selectedNodeId:
        state.selectedNodeId === id ? null : state.selectedNodeId,
    });
  },

  updateNodePosition: (id, position) => {
    // Snapping logic if near breadboard
    const { nodes } = get();
    const breadboard = nodes.find(n => n.type === 'Breadboard');
    let finalPos = position;

    if (breadboard) {
      const [bx, by, bz] = breadboard.position;
      const [nx, ny, nz] = position;
      
      // If within breadboard bounds (approx 14x4.2)
      if (Math.abs(nx - bx) < 7 && Math.abs(nz - bz) < 2.1) {
        // Snap to 0.35 spacing starting from center
        const snapX = Math.round((nx - bx) / 0.35) * 0.35 + bx;
        const snapZ = Math.round((nz - bz) / 0.35) * 0.35 + bz;
        finalPos = [snapX, ny, snapZ];
      }
    }

    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, position: finalPos } : n
      ),
    }));
  },

  updateNodeProperty: (id, key, value) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id
          ? { ...n, properties: { ...n.properties, [key]: value } }
          : n
      ),
    })),

  selectNode: (id) => set({ selectedNodeId: id, selectedWireId: null }),
  selectWire: (id) => set({ selectedWireId: id, selectedNodeId: null }),

  deleteSelectedNode: () => {
    const state = get();
    if (!state.selectedNodeId) return;
    state.pushHistory();
    set({
      nodes: state.nodes.filter((n) => n.id !== state.selectedNodeId),
      wires: state.wires.filter(
        (w) =>
          w.sourceNodeId !== state.selectedNodeId &&
          w.targetNodeId !== state.selectedNodeId
      ),
      selectedNodeId: null,
    });
  },

  deleteSelectedWire: () => {
    const state = get();
    if (!state.selectedWireId) return;
    state.pushHistory();
    set({
      wires: state.wires.filter((w) => w.id !== state.selectedWireId),
      selectedWireId: null,
    });
  },

  addWire: (wire) => {
    const state = get();
    state.pushHistory();
    const newWire = { ...wire, id: uuidv4() };
    set({
      wires: [...state.wires, newWire],
      selectedWireId: newWire.id,
      selectedNodeId: null,
    });
  },

  updateWireProperty: (id, key, value) =>
    set((state) => ({
      wires: state.wires.map((w) =>
        w.id === id ? { ...w, [key]: value } : w
      ),
    })),

  toggleSimulation: () =>
    set((state) => ({
      isSimulating: !state.isSimulating,
      simulationTime: state.isSimulating ? state.simulationTime : 0,
    })),

  tickSimulation: (deltaTime) =>
    set((state) => {
      if (!state.isSimulating) return state;
      return { simulationTime: state.simulationTime + deltaTime };
    }),

  toggleShowLabels: () =>
    set((state) => ({ showLabels: !state.showLabels })),

  toggleShowVoltages: () =>
    set((state) => ({ showVoltages: !state.showVoltages })),

  setProjectName: (name) => set({ projectName: name }),

  undo: () => {
    const { undoStack, nodes, wires } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    const currentSnapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      wires: JSON.parse(JSON.stringify(wires)),
    };
    set({
      nodes: prev.nodes,
      wires: prev.wires,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, currentSnapshot],
      selectedNodeId: null,
      selectedWireId: null,
    });
  },

  redo: () => {
    const { redoStack, nodes, wires } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const currentSnapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      wires: JSON.parse(JSON.stringify(wires)),
    };
    set({
      nodes: next.nodes,
      wires: next.wires,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, currentSnapshot],
      selectedNodeId: null,
      selectedWireId: null,
    });
  },
}));
