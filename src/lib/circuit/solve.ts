/**
 * Series-circuit DC solver (v1).
 *
 * Model:
 * - Wires are ideal conductors (0 Ω) joining pins into electrical nets.
 * - Battery: EMF from its `voltage` property with 0.5 Ω internal resistance.
 * - Resistor: its `resistance` property in ohms.
 * - LED: ideal diode with a 2.0 V forward drop; blocks entirely when reversed.
 * - Capacitor: open circuit at DC steady state (blocks current).
 * - Exactly one battery and a single series loop are supported. Parallel
 *   topologies and multiple batteries return status "unsupported" rather than
 *   fake numbers.
 *
 * I = max(0, V_batt − ΣV_led_forward) / (ΣR + R_internal)
 */

export interface SolveNode {
  id: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface SolveWire {
  sourceNodeId: string;
  sourcePin: string;
  targetNodeId: string;
  targetPin: string;
}

export type LedState = "off" | "on" | "over" | "reversed";

export interface SolveResult {
  status: "ok" | "open" | "no-battery" | "unsupported";
  /** Loop current in amperes (0 unless status is "ok"). */
  currentA: number;
  /** Per-LED visual state keyed by node id. */
  ledStates: Record<string, LedState>;
  /** Human-readable summary for the UI. */
  message: string;
}

const BATTERY_INTERNAL_OHMS = 0.5;
const LED_FORWARD_V = 2.0;
const LED_ON_AMPS = 0.001; // 1 mA
const LED_OVER_AMPS = 0.025; // 25 mA

interface ElementEdge {
  nodeId: string;
  kind: "battery" | "resistor" | "led";
  netA: string; // battery: pos / led: anode / resistor: a
  netB: string;
  ohms: number;
  volts: number;
}

/**
 * @param junctions Extra pin groups that are electrically common without a
 * wire — e.g. legs seated in the same breadboard strip. Each entry is a list
 * of "nodeId:pinId" keys.
 */
export function solveCircuit(
  nodes: SolveNode[],
  wires: SolveWire[],
  junctions: string[][] = []
): SolveResult {
  const allLedsOff = (state: LedState = "off") =>
    Object.fromEntries(nodes.filter((n) => n.type === "Led").map((n) => [n.id, state]));

  const batteries = nodes.filter((n) => n.type === "Battery");
  if (batteries.length === 0) {
    return { status: "no-battery", currentA: 0, ledStates: allLedsOff(), message: "Add a battery to power the circuit." };
  }
  if (batteries.length > 1) {
    return { status: "unsupported", currentA: 0, ledStates: allLedsOff(), message: "Multiple batteries aren't supported yet." };
  }
  const battery = batteries[0];

  // --- Union pins into nets via wires ---
  const parent = new Map<string, string>();
  const key = (nodeId: string, pin: string) => `${nodeId}:${pin}`;
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    const p = parent.get(x)!;
    if (p === x) return x;
    const root = find(p);
    parent.set(x, root);
    return root;
  };
  const union = (a: string, b: string) => parent.set(find(a), find(b));

  for (const w of wires) {
    union(key(w.sourceNodeId, w.sourcePin), key(w.targetNodeId, w.targetPin));
  }
  // Breadboard strips: every pin in a group shares one net.
  for (const group of junctions) {
    for (let i = 1; i < group.length; i++) union(group[0], group[i]);
  }

  // --- Element edges between nets ---
  const edges: ElementEdge[] = [];
  for (const n of nodes) {
    if (n.type === "Battery") {
      edges.push({
        nodeId: n.id, kind: "battery",
        netA: find(key(n.id, "pos")), netB: find(key(n.id, "neg")),
        ohms: BATTERY_INTERNAL_OHMS, volts: Number(n.properties.voltage) || 9,
      });
    } else if (n.type === "Resistor") {
      edges.push({
        nodeId: n.id, kind: "resistor",
        netA: find(key(n.id, "a")), netB: find(key(n.id, "b")),
        ohms: Math.max(0, Number(n.properties.resistance) || 0), volts: 0,
      });
    } else if (n.type === "Led") {
      edges.push({
        nodeId: n.id, kind: "led",
        netA: find(key(n.id, "anode")), netB: find(key(n.id, "cathode")),
        ohms: 0, volts: LED_FORWARD_V,
      });
    }
    // Capacitors block DC; other parts aren't electrical yet — no edge.
  }

  const batteryEdge = edges.find((e) => e.kind === "battery")!;
  const others = edges.filter((e) => e.kind !== "battery");

  // --- Find simple paths pos-net -> neg-net over element edges ---
  const startNet = batteryEdge.netA;
  const endNet = batteryEdge.netB;

  interface Step { edge: ElementEdge; forward: boolean }
  const paths: Step[][] = [];

  const dfs = (net: string, used: Set<string>, trail: Step[]) => {
    if (paths.length >= 2) return; // enough to know it's not a single loop
    if (net === endNet && trail.length > 0) {
      paths.push([...trail]);
      return;
    }
    for (const e of others) {
      if (used.has(e.nodeId)) continue;
      let next: string | null = null;
      let forward = true;
      if (e.netA === net) { next = e.netB; forward = true; }
      else if (e.netB === net) { next = e.netA; forward = false; }
      if (next === null) continue;
      used.add(e.nodeId);
      trail.push({ edge: e, forward });
      dfs(next, used, trail);
      trail.pop();
      used.delete(e.nodeId);
    }
  };
  dfs(startNet, new Set(), []);

  if (startNet === endNet) {
    // Battery terminals shorted directly together by wires.
    return { status: "unsupported", currentA: 0, ledStates: allLedsOff(), message: "Battery terminals are shorted — remove the direct wire." };
  }
  if (paths.length === 0) {
    return { status: "open", currentA: 0, ledStates: allLedsOff(), message: "Open circuit — complete the loop back to the battery." };
  }
  if (paths.length > 1) {
    return { status: "unsupported", currentA: 0, ledStates: allLedsOff(), message: "Parallel branches aren't supported yet — keep one series loop." };
  }

  // --- Single series loop: walk it ---
  const path = paths[0];
  let totalOhms = BATTERY_INTERNAL_OHMS;
  let forwardDropV = 0;
  const ledStates: Record<string, LedState> = allLedsOff();
  let reversed = false;

  for (const { edge, forward } of path) {
    if (edge.kind === "resistor") totalOhms += edge.ohms;
    if (edge.kind === "led") {
      // Conventional current leaves battery "+": entering the LED at its
      // anode means forward-biased.
      if (forward) {
        forwardDropV += edge.volts;
      } else {
        reversed = true;
        ledStates[edge.nodeId] = "reversed";
      }
    }
  }

  if (reversed) {
    return { status: "ok", currentA: 0, ledStates, message: "An LED is reversed — flip it so current enters the anode (+)." };
  }

  const netV = batteryEdge.volts - forwardDropV;
  const currentA = netV > 0 ? netV / totalOhms : 0;

  for (const { edge } of path) {
    if (edge.kind === "led") {
      ledStates[edge.nodeId] =
        currentA >= LED_OVER_AMPS ? "over" : currentA >= LED_ON_AMPS ? "on" : "off";
    }
  }

  const mA = currentA * 1000;
  let message: string;
  if (currentA === 0) {
    message = "Not enough voltage to drive the LEDs.";
  } else if (currentA >= LED_OVER_AMPS && path.some((s) => s.edge.kind === "led")) {
    message = `${formatMilliamps(mA)} — too much current! Add a resistor before you fry the LED.`;
  } else {
    message = `Current: ${formatMilliamps(mA)}`;
  }

  return { status: "ok", currentA, ledStates, message };
}

export function formatMilliamps(mA: number): string {
  if (mA >= 1000) return `${(mA / 1000).toFixed(2)} A`;
  if (mA >= 10) return `${mA.toFixed(1)} mA`;
  return `${mA.toFixed(2)} mA`;
}
