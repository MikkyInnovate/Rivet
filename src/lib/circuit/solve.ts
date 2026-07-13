/**
 * DC circuit solver v2 — Modified Nodal Analysis (conductance form).
 *
 * Handles ANY resistive DC topology: series, parallel, bridges, multiple
 * batteries. Elements:
 * - Wires: ideal (union pins into nets), plus breadboard strip junctions.
 * - Battery: EMF with 0.5 Ω internal resistance (stamped as its Norton
 *   equivalent: G = 1/R, I = V/R).
 * - Resistor: conductance between its nets.
 * - LED: ideal diode with per-circuit forward drop, solved by state
 *   iteration — assumed conducting (Vf source + tiny series R) or open;
 *   assumptions are corrected until consistent.
 * - Capacitor: open at DC steady state.
 *
 * A tiny leak conductance to ground keeps the matrix non-singular for
 * floating/unconnected nets (they simply read 0).
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
  /** Current through the (first) battery, amperes. */
  currentA: number;
  ledStates: Record<string, LedState>;
  message: string;
}

const BATTERY_INTERNAL_OHMS = 0.5;
const LED_FORWARD_V = 2.0;
const LED_SERIES_OHMS = 1e-4; // companion-model series resistance
const LEAK_G = 1e-9;
const LED_ON_AMPS = 0.001;
const LED_OVER_AMPS = 0.025;
const SHORT_AMPS = 1.0;

/** Gaussian elimination with partial pivoting. */
function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    }
    if (Math.abs(A[pivot][col]) < 1e-15) return null;
    [A[col], A[pivot]] = [A[pivot], A[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    for (let r = col + 1; r < n; r++) {
      const f = A[r][col] / A[col][col];
      if (f === 0) continue;
      for (let c = col; c < n; c++) A[r][c] -= f * A[col][c];
      b[r] -= f * b[col];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let c = r + 1; c < n; c++) s -= A[r][c] * x[c];
    x[r] = s / A[r][r];
  }
  return x;
}

export function solveCircuit(
  nodes: SolveNode[],
  wires: SolveWire[],
  junctions: string[][] = []
): SolveResult {
  const leds = nodes.filter((n) => n.type === "Led");
  const allLeds = (state: LedState = "off"): Record<string, LedState> =>
    Object.fromEntries(leds.map((n) => [n.id, state]));

  const batteries = nodes.filter((n) => n.type === "Battery");
  if (batteries.length === 0) {
    return { status: "no-battery", currentA: 0, ledStates: allLeds(), message: "Add a battery to power the circuit." };
  }

  // ---- Union pins into nets ----
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

  for (const w of wires) union(key(w.sourceNodeId, w.sourcePin), key(w.targetNodeId, w.targetPin));
  for (const group of junctions) for (let i = 1; i < group.length; i++) union(group[0], group[i]);

  // ---- Index nets (ground = first battery's negative net) ----
  const netIndex = new Map<string, number>();
  const netOf = (nodeId: string, pin: string): number => {
    const root = find(key(nodeId, pin));
    if (!netIndex.has(root)) netIndex.set(root, netIndex.size);
    return netIndex.get(root)!;
  };
  const ground = netOf(batteries[0].id, "neg");

  interface Branch {
    nodeId: string;
    kind: "battery" | "resistor" | "led";
    a: number; // battery: pos | led: anode
    b: number;
    g: number;
    volts: number;
    conducting?: boolean; // led state assumption
    current?: number;
    vab?: number;
  }
  const branches: Branch[] = [];

  for (const n of nodes) {
    if (n.type === "Battery") {
      branches.push({
        nodeId: n.id, kind: "battery",
        a: netOf(n.id, "pos"), b: netOf(n.id, "neg"),
        g: 1 / BATTERY_INTERNAL_OHMS,
        volts: Number(n.properties.voltage) || 9,
      });
    } else if (n.type === "Resistor") {
      const ohms = Math.max(1e-6, Number(n.properties.resistance) || 0);
      branches.push({ nodeId: n.id, kind: "resistor", a: netOf(n.id, "a"), b: netOf(n.id, "b"), g: 1 / ohms, volts: 0 });
    } else if (n.type === "Led") {
      branches.push({
        nodeId: n.id, kind: "led",
        a: netOf(n.id, "anode"), b: netOf(n.id, "cathode"),
        g: 1 / LED_SERIES_OHMS, volts: LED_FORWARD_V, conducting: true,
      });
    } else if (n.type === "Tactile Switch") {
      // Closed: near-ideal conductor. Open: no branch at all.
      if ((n.properties.state as string) === "closed") {
        branches.push({
          nodeId: n.id, kind: "resistor",
          a: netOf(n.id, "a"), b: netOf(n.id, "b"),
          g: 1 / 1e-4, volts: 0,
        });
      }
    }
    // Capacitors and non-electrical parts: open at DC — no branch.
  }

  const N = netIndex.size;

  // ---- Iterate LED conducting assumptions until consistent ----
  let voltages: number[] | null = null;
  for (let iter = 0; iter < 12; iter++) {
    const A: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
    const rhs = new Array(N).fill(0);
    for (let i = 0; i < N; i++) A[i][i] += LEAK_G;

    for (const br of branches) {
      if (br.kind === "led" && !br.conducting) continue;
      const { a, b, g } = br;
      if (a === b) {
        // Element shorted onto one net: battery still drives V/R through it.
        continue;
      }
      A[a][a] += g; A[b][b] += g; A[a][b] -= g; A[b][a] -= g;
      if (br.kind === "battery") {
        rhs[a] += br.volts * g;
        rhs[b] -= br.volts * g;
      } else if (br.kind === "led") {
        rhs[a] += br.volts * g;
        rhs[b] -= br.volts * g;
      }
    }

    // Pin the ground reference hard.
    A[ground][ground] += 1;

    voltages = solveLinear(A, rhs);
    if (!voltages) {
      return { status: "unsupported", currentA: 0, ledStates: allLeds(), message: "Couldn't solve this circuit — try simplifying it." };
    }

    // Check diode assumptions.
    let changed = false;
    for (const br of branches) {
      if (br.kind !== "led") continue;
      const vab = voltages[br.a] - voltages[br.b];
      br.vab = vab;
      if (br.conducting) {
        const i = br.g * (vab - br.volts);
        br.current = i;
        if (i < -1e-9) { br.conducting = false; changed = true; }
      } else {
        br.current = 0;
        if (vab > br.volts) { br.conducting = true; changed = true; }
      }
    }
    if (!changed) break;
  }

  // ---- Extract results ----
  const v = voltages!;
  const clamp = (x: number) => (Math.abs(x) < 1e-6 ? 0 : x);

  const batteryBr = branches.find((br) => br.kind === "battery")!;
  const vBat = v[batteryBr.a] - v[batteryBr.b];
  const currentA = clamp(batteryBr.volts * batteryBr.g - batteryBr.g * vBat);

  const ledStates = allLeds();
  let anyReversed = false;
  let anyOver = false;
  for (const br of branches) {
    if (br.kind !== "led") continue;
    const i = clamp(br.current ?? 0);
    if (!br.conducting && (br.vab ?? 0) < -0.5) {
      ledStates[br.nodeId] = "reversed";
      anyReversed = true;
    } else if (i >= LED_OVER_AMPS) {
      ledStates[br.nodeId] = "over";
      anyOver = true;
    } else if (i >= LED_ON_AMPS) {
      ledStates[br.nodeId] = "on";
    }
  }

  const mA = currentA * 1000;
  let status: SolveResult["status"] = "ok";
  let message: string;
  if (anyReversed && currentA < LED_ON_AMPS) {
    message = "An LED is reversed — flip it so current enters the anode (+).";
  } else if (currentA === 0) {
    status = "open";
    message = "Open circuit — complete the loop back to the battery.";
  } else if (anyOver) {
    message = `${formatMilliamps(mA)} — too much current! Add a resistor before you fry the LED.`;
  } else if (currentA >= SHORT_AMPS) {
    message = `Short circuit — ${formatMilliamps(mA)} through the battery! Add resistance.`;
  } else {
    message = `Current: ${formatMilliamps(mA)}`;
  }

  return { status, currentA, ledStates, message };
}

export function formatMilliamps(mA: number): string {
  if (mA >= 1000) return `${(mA / 1000).toFixed(2)} A`;
  if (mA >= 10) return `${mA.toFixed(1)} mA`;
  return `${mA.toFixed(2)} mA`;
}
