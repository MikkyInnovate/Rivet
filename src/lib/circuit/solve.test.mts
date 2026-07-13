/**
 * Physics verification for the series-circuit solver.
 * Every expected value below is hand-calculated from
 *   I = (V_batt − ΣV_led) / (ΣR + 0.5Ω internal)
 * Run: node src/lib/circuit/solve.test.mts   (Node 24 strips types natively)
 */
import { solveCircuit } from "./solve.ts";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const a = typeof actual === "number" ? actual.toPrecision(4) : actual;
  const e = typeof expected === "number" ? expected.toPrecision(4) : expected;
  if (a === e) {
    console.log(`  PASS  ${name}  (${a})`);
  } else {
    failures++;
    console.error(`  FAIL  ${name}  expected ${e}, got ${a}`);
  }
}

const battery = (v = 9) => ({ id: "bat", type: "Battery", properties: { voltage: v } });
const resistor = (id: string, ohms: number) => ({ id, type: "Resistor", properties: { resistance: ohms } });
const led = (id = "led1") => ({ id, type: "Led", properties: { color: "Red" } });
const wire = (a: string, ap: string, b: string, bp: string) => ({
  sourceNodeId: a, sourcePin: ap, targetNodeId: b, targetPin: bp,
});

console.log("1) 9V battery + 470Ω + LED (closed loop)");
console.log("   hand calc: I = (9 − 2) / (470 + 0.5) = 7 / 470.5 = 14.878 mA → LED on");
{
  const r = solveCircuit(
    [battery(), resistor("r1", 470), led()],
    [
      wire("bat", "pos", "r1", "a"),
      wire("r1", "b", "led1", "anode"),
      wire("led1", "cathode", "bat", "neg"),
    ]
  );
  check("status", r.status, "ok");
  check("current (A)", r.currentA, 7 / 470.5);
  check("LED state", r.ledStates["led1"], "on");
}

console.log("2) Same loop with the LED flipped (reverse-biased)");
console.log("   hand calc: diode blocks → I = 0, LED 'reversed'");
{
  const r = solveCircuit(
    [battery(), resistor("r1", 470), led()],
    [
      wire("bat", "pos", "r1", "a"),
      wire("r1", "b", "led1", "cathode"),
      wire("led1", "anode", "bat", "neg"),
    ]
  );
  check("status", r.status, "ok");
  check("current (A)", r.currentA, 0);
  check("LED state", r.ledStates["led1"], "reversed");
}

console.log("3) Open circuit (last wire missing)");
{
  const r = solveCircuit(
    [battery(), resistor("r1", 470), led()],
    [wire("bat", "pos", "r1", "a"), wire("r1", "b", "led1", "anode")]
  );
  check("status", r.status, "open");
  check("current (A)", r.currentA, 0);
  check("LED state", r.ledStates["led1"], "off");
}

console.log("4) LED with NO resistor (over-current)");
console.log("   hand calc: I = (9 − 2) / 0.5 = 14 A → LED 'over'");
{
  const r = solveCircuit(
    [battery(), led()],
    [wire("bat", "pos", "led1", "anode"), wire("led1", "cathode", "bat", "neg")]
  );
  check("status", r.status, "ok");
  check("current (A)", r.currentA, 14);
  check("LED state", r.ledStates["led1"], "over");
}

console.log("5) Two resistors in series (470Ω + 220Ω)");
console.log("   hand calc: I = 7 / 690.5 = 10.138 mA → LED on");
{
  const r = solveCircuit(
    [battery(), resistor("r1", 470), resistor("r2", 220), led()],
    [
      wire("bat", "pos", "r1", "a"),
      wire("r1", "b", "r2", "a"),
      wire("r2", "b", "led1", "anode"),
      wire("led1", "cathode", "bat", "neg"),
    ]
  );
  check("status", r.status, "ok");
  check("current (A)", r.currentA, 7 / 690.5);
}

console.log("6) PARALLEL resistors (470Ω ∥ 220Ω) — MNA v2");
console.log("   hand calc: Req = 470·220/690 = 149.855Ω; I = 9/(149.855+0.5) = 59.86 mA");
{
  const r = solveCircuit(
    [battery(), resistor("r1", 470), resistor("r2", 220)],
    [
      wire("bat", "pos", "r1", "a"),
      wire("bat", "pos", "r2", "a"),
      wire("r1", "b", "bat", "neg"),
      wire("r2", "b", "bat", "neg"),
    ]
  );
  check("status", r.status, "ok");
  check("current (A)", r.currentA, 9 / (470 * 220 / 690 + 0.5));
}

console.log("7) 3V battery + LED + 470Ω: barely conducts");
console.log("   hand calc: I = (3 − 2) / 470.5 = 2.125 mA → LED on (dim but ≥1mA)");
{
  const r = solveCircuit(
    [battery(3), resistor("r1", 470), led()],
    [
      wire("bat", "pos", "r1", "a"),
      wire("r1", "b", "led1", "anode"),
      wire("led1", "cathode", "bat", "neg"),
    ]
  );
  check("current (A)", r.currentA, 1 / 470.5);
  check("LED state", r.ledStates["led1"], "on");
}

console.log("8) 1.5V battery + LED: below forward voltage → no conduction");
{
  const r = solveCircuit(
    [battery(1.5), resistor("r1", 100), led()],
    [
      wire("bat", "pos", "r1", "a"),
      wire("r1", "b", "led1", "anode"),
      wire("led1", "cathode", "bat", "neg"),
    ]
  );
  check("current (A)", r.currentA, 0);
  check("LED state", r.ledStates["led1"], "off");
}

console.log("9) No battery");
{
  const r = solveCircuit([resistor("r1", 470), led()], [wire("r1", "b", "led1", "anode")]);
  check("status", r.status, "no-battery");
}

console.log("10) Battery terminals wired directly together — honest short circuit");
console.log("    hand calc: I = 9 / 0.5Ω internal = 18 A");
{
  const r = solveCircuit([battery()], [wire("bat", "pos", "bat", "neg")]);
  check("status", r.status, "ok");
  check("current (A)", r.currentA, 18);
  check("warns", r.message.includes("Short circuit"), true);
}

console.log("12) Series + parallel mix: 100Ω in series with (470Ω ∥ 220Ω)");
console.log("    hand calc: Req = 100 + 149.855 = 249.855; I = 9/250.355 = 35.95 mA");
{
  const r = solveCircuit(
    [battery(), resistor("r1", 470), resistor("r2", 220), resistor("r3", 100)],
    [
      wire("bat", "pos", "r3", "a"),
      wire("r3", "b", "r1", "a"),
      wire("r3", "b", "r2", "a"),
      wire("r1", "b", "bat", "neg"),
      wire("r2", "b", "bat", "neg"),
    ]
  );
  check("status", r.status, "ok");
  check("current (A)", r.currentA, 9 / (100 + 470 * 220 / 690 + 0.5));
}

console.log("11) Breadboard strip junction: resistor and LED share a column — NO wire between them");
console.log("    battery wired to each end; the shared strip completes the loop → 14.878 mA");
{
  const r = solveCircuit(
    [battery(), resistor("r1", 470), led()],
    [
      wire("bat", "pos", "r1", "a"),
      wire("led1", "cathode", "bat", "neg"),
      // note: NO wire between r1.b and led1.anode
    ],
    [["r1:b", "led1:anode"]] // same breadboard column strip
  );
  check("status", r.status, "ok");
  check("current (A)", r.currentA, 7 / 470.5);
  check("LED state", r.ledStates["led1"], "on");
}

console.log("13) Switch in series: open → no current; closed → 14.878 mA");
{
  const sw = (state: string) => ({ id: "sw1", type: "Tactile Switch", properties: { state } });
  const circuitWires = [
    wire("bat", "pos", "sw1", "a"),
    wire("sw1", "b", "r1", "a"),
    wire("r1", "b", "led1", "anode"),
    wire("led1", "cathode", "bat", "neg"),
  ];
  const open = solveCircuit([battery(), sw("open"), resistor("r1", 470), led()], circuitWires);
  check("open: status", open.status, "open");
  check("open: current", open.currentA, 0);
  check("open: LED", open.ledStates["led1"], "off");

  const closed = solveCircuit([battery(), sw("closed"), resistor("r1", 470), led()], circuitWires);
  check("closed: status", closed.status, "ok");
  check("closed: current (A)", closed.currentA, 7 / 470.5);
  check("closed: LED", closed.ledStates["led1"], "on");
}

if (failures > 0) {
  console.error(`\n${failures} FAILURE(S)`);
  process.exit(1);
}
console.log("\nALL PHYSICS TESTS PASSED");
