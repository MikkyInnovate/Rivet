import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { solveCircuit, SolveResult } from '@/lib/circuit/solve';
import { getPins } from '@/lib/circuit/pins';
import { toast } from '@/components/ui/toast';

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
  simulation: SolveResult | null;
  showLabels: boolean;
  showVoltages: boolean;

  // Wiring (pin-to-pin)
  pendingPin: { nodeId: string; pinId: string } | null;
  connectPin: (nodeId: string, pinId: string) => void;
  cancelWiring: () => void;

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

  // Persistence
  hydrateFromStorage: () => void;
  clearCircuit: () => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const CIRCUIT_STORAGE_KEY = 'graphite_circuit_v1';

export interface SavedCircuit {
  nodes: SceneNode[];
  wires: WireConnection[];
  projectName: string;
  savedAt: number;
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
  simulation: null,
  showLabels: false,
  showVoltages: false,
  projectName: 'Untitled',
  undoStack: [],
  redoStack: [],
  pendingPin: null,

  connectPin: (nodeId, pinId) => {
    const { pendingPin, wires, nodes } = get();
    if (!pendingPin) {
      set({ pendingPin: { nodeId, pinId } });
      return;
    }
    // Clicking the armed pin again cancels.
    if (pendingPin.nodeId === nodeId && pendingPin.pinId === pinId) {
      set({ pendingPin: null });
      return;
    }
    if (pendingPin.nodeId === nodeId) {
      toast("Can't wire a part to itself", 'error');
      set({ pendingPin: null });
      return;
    }
    const duplicate = wires.some(
      (w) =>
        (w.sourceNodeId === pendingPin.nodeId && w.sourcePin === pendingPin.pinId &&
         w.targetNodeId === nodeId && w.targetPin === pinId) ||
        (w.targetNodeId === pendingPin.nodeId && w.targetPin === pendingPin.pinId &&
         w.sourceNodeId === nodeId && w.sourcePin === pinId)
    );
    if (duplicate) {
      toast('These pins are already connected', 'error');
      set({ pendingPin: null });
      return;
    }
    get().addWire({
      sourceNodeId: pendingPin.nodeId,
      sourcePin: pendingPin.pinId,
      targetNodeId: nodeId,
      targetPin: pinId,
      color: 'Red',
      height: 'Low',
      showCurrent: false,
    });
    set({ pendingPin: null });
    // Re-solve live if simulation is running.
    if (get().isSimulating) {
      set({ simulation: solveCircuit(get().nodes, get().wires) });
    }
    void nodes;
  },

  cancelWiring: () => set({ pendingPin: null }),

  hydrateFromStorage: () => {
    try {
      const raw = localStorage.getItem(CIRCUIT_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedCircuit;
      if (!Array.isArray(saved.nodes)) return;
      set({
        nodes: saved.nodes,
        wires: Array.isArray(saved.wires) ? saved.wires : [],
        projectName: saved.projectName || 'Untitled',
      });
    } catch {
      // Corrupt save — start fresh rather than crash.
    }
  },

  clearCircuit: () => {
    get().pushHistory();
    set({
      nodes: JSON.parse(JSON.stringify(INITIAL_NODES)),
      wires: [],
      selectedNodeId: null,
      selectedWireId: null,
      projectName: 'Untitled',
      isSimulating: false,
      simulationTime: 0,
    });
  },

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
    const spawnPos = position || [(Math.random() - 0.5) * 4, type === 'Breadboard' ? 0.25 : 0, (Math.random() - 0.5) * 4];
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
      const [bx, , bz] = breadboard.position;
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

  toggleSimulation: () => {
    const starting = !get().isSimulating;
    if (starting) {
      const result = solveCircuit(get().nodes, get().wires);
      set({ isSimulating: true, simulationTime: 0, simulation: result, pendingPin: null });
      if (result.status !== 'ok' || result.currentA === 0) {
        toast(result.message, 'error');
      } else {
        toast(result.message);
      }
    } else {
      set({ isSimulating: false, simulation: null });
    }
  },

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

// While the simulation is running, re-solve whenever the circuit itself
// changes (parts added/removed, wires changed, properties edited) so the
// readout is always truthful. Reference-compare to avoid feedback loops.
if (typeof window !== 'undefined') {
  let lastNodes = useSceneStore.getState().nodes;
  let lastWires = useSceneStore.getState().wires;
  useSceneStore.subscribe((state) => {
    if (state.nodes === lastNodes && state.wires === lastWires) return;
    lastNodes = state.nodes;
    lastWires = state.wires;
    if (state.isSimulating) {
      useSceneStore.setState({ simulation: solveCircuit(state.nodes, state.wires) });
    }
  });
}

// Auto-save the circuit (scene data only — not selection/undo) to localStorage,
// debounced so rapid edits don't thrash storage.
if (typeof window !== 'undefined') {
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  useSceneStore.subscribe((state) => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        const payload: SavedCircuit = {
          nodes: state.nodes,
          wires: state.wires,
          projectName: state.projectName,
          savedAt: Date.now(),
        };
        localStorage.setItem(CIRCUIT_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Storage full/unavailable — skip silently.
      }
    }, 400);
  });
}
