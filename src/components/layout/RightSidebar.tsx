"use client";
import React from "react";
import { Trash2, Cuboid } from "lucide-react";
import { useSceneStore } from "@/store/useSceneStore";
import Toggle from "@/components/ui/Toggle";

export default function RightSidebar() {
  const nodes = useSceneStore((s) => s.nodes);
  const wires = useSceneStore((s) => s.wires);
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectedWireId = useSceneStore((s) => s.selectedWireId);
  const updateNodeProperty = useSceneStore((s) => s.updateNodeProperty);
  const updateWireProperty = useSceneStore((s) => s.updateWireProperty);
  const deleteSelectedNode = useSceneStore((s) => s.deleteSelectedNode);
  const deleteSelectedWire = useSceneStore((s) => s.deleteSelectedWire);
  const showLabels = useSceneStore((s) => s.showLabels);
  const showVoltages = useSceneStore((s) => s.showVoltages);
  const toggleShowLabels = useSceneStore((s) => s.toggleShowLabels);
  const toggleShowVoltages = useSceneStore((s) => s.toggleShowVoltages);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedWire = wires.find((w) => w.id === selectedWireId);

  return (
    <aside className="w-[240px] border-l border-slate-200 bg-white flex flex-col h-full shrink-0 z-10 relative overflow-y-auto">
      {/* Inspect Toggles */}
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-[11px] font-bold text-slate-800 font-mono uppercase tracking-widest mb-3">
          Inspect
        </h3>
        <div className="flex flex-col gap-3">
          <Toggle
            label="Show Labels"
            active={showLabels}
            onToggle={toggleShowLabels}
          />
          <Toggle
            label="Show Voltages"
            active={showVoltages}
            onToggle={toggleShowVoltages}
          />
        </div>
      </div>

      {/* Dynamic Component Properties or Wire Properties */}
      <div className="p-5 flex-1 flex flex-col">
        {selectedNode ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-slate-800 font-mono uppercase tracking-widest">
                {selectedNode.type} Properties
              </h3>
              <button
                onClick={deleteSelectedNode}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                title="Delete Part"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Battery, LED, Resistor, Capacitor checks... (keeping existing) */}
            {selectedNode.type === "Battery" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono text-slate-600">Voltage</label>
                <div className="flex shadow-sm rounded-md overflow-hidden">
                  <input
                    type="number"
                    step="0.5"
                    value={(selectedNode.properties.voltage as number) || 0}
                    onChange={(e) => updateNodeProperty(selectedNode.id, "voltage", Number(e.target.value))}
                    className="flex-1 border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] text-sm font-mono rounded-l-md"
                  />
                  <div className="bg-slate-50 border-y border-r border-slate-200 px-3 py-1.5 text-sm font-mono text-slate-400 flex items-center rounded-r-md">V</div>
                </div>
              </div>
            )}
            {selectedNode.type === "Led" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono text-slate-600">Color</label>
                <select
                  value={(selectedNode.properties.color as string) || "Red"}
                  onChange={(e) => updateNodeProperty(selectedNode.id, "color", e.target.value)}
                  className="w-full border border-slate-200 rounded-md shadow-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] text-sm bg-white font-mono cursor-pointer"
                >
                  <option value="Red">Red</option>
                  <option value="Blue">Blue</option>
                  <option value="Green">Green</option>
                  <option value="Yellow">Yellow</option>
                  <option value="White">White</option>
                </select>
              </div>
            )}
            {selectedNode.type === "Resistor" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono text-slate-600">Resistance</label>
                <div className="flex shadow-sm rounded-md overflow-hidden">
                  <input
                    type="number"
                    value={(selectedNode.properties.resistance as number) || 0}
                    onChange={(e) => updateNodeProperty(selectedNode.id, "resistance", Number(e.target.value))}
                    className="flex-1 border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] text-sm font-mono rounded-l-md"
                  />
                  <div className="bg-slate-50 border-y border-r border-slate-200 px-3 py-1.5 text-sm font-mono text-slate-400 flex items-center rounded-r-md">Ω</div>
                </div>
              </div>
            )}
            {selectedNode.type === "Capacitor" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono text-slate-600">Capacitance</label>
                <div className="flex shadow-sm rounded-md overflow-hidden">
                  <input
                    type="number"
                    value={(selectedNode.properties.capacitance as number) || 0}
                    onChange={(e) => updateNodeProperty(selectedNode.id, "capacitance", Number(e.target.value))}
                    className="flex-1 border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] text-sm font-mono rounded-l-md"
                  />
                  <div className="bg-slate-50 border-y border-r border-slate-200 px-3 py-1.5 text-sm font-mono text-slate-400 flex items-center rounded-r-md">µF</div>
                </div>
              </div>
            )}
          </>
        ) : selectedWire ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-slate-800 font-mono uppercase tracking-widest">
                Wire Properties
              </h3>
              <button
                onClick={deleteSelectedWire}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                title="Delete Wire"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <Toggle
                label="Show Current"
                active={selectedWire.showCurrent}
                onToggle={(val) => updateWireProperty(selectedWire.id, "showCurrent", val)}
              />

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-mono text-slate-600">Color</label>
                  <select
                    value={selectedWire.color}
                    onChange={(e) => updateWireProperty(selectedWire.id, "color", e.target.value)}
                    className="w-[120px] border border-slate-200 rounded-md shadow-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] text-sm bg-white font-mono cursor-pointer"
                  >
                    <option value="Red">Red</option>
                    <option value="Black">Black</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-mono text-slate-600">Height</label>
                  <select
                    value={selectedWire.height}
                    onChange={(e) => updateWireProperty(selectedWire.id, "height", e.target.value as 'Low' | 'Medium' | 'High')}
                    className="w-[120px] border border-slate-200 rounded-md shadow-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] text-sm bg-white font-mono cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 text-xs text-center font-mono pb-10">
            <Cuboid size={28} className="mb-3 opacity-30" />
            <span className="leading-relaxed">
              Select a part on the
              <br />
              canvas to inspect it
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
