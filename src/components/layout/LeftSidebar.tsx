"use client";
import React from "react";
import { useSceneStore, PartType } from "@/store/useSceneStore";
import { toast } from "@/components/ui/toast";

interface PartEntry {
  name: string;
  type: PartType;
  icon: React.ReactNode;
  implemented: boolean;
}

const parts: PartEntry[] = [
  {
    name: "Arduino Uno",
    type: "Battery" as PartType,
    icon: <img src="/images/parts/arduino.png" alt="Arduino Uno" className="w-7 h-7 object-contain" />,
    implemented: false,
  },
  {
    name: "Resistor",
    type: "Resistor",
    icon: <img src="/images/parts/resistor.png" alt="Resistor" className="w-7 h-7 object-contain" />,
    implemented: true,
  },
  {
    name: "Led",
    type: "Led",
    icon: <img src="/images/parts/led.png" alt="Led" className="w-7 h-7 object-contain" />,
    implemented: true,
  },
  {
    name: "Motor",
    type: "Motor",
    icon: <img src="/images/parts/motor.png" alt="Motor" className="w-7 h-7 object-contain" />,
    implemented: false,
  },
  {
    name: "555 Timer",
    type: "Battery" as PartType,
    icon: <img src="/images/parts/timer555.png" alt="555 Timer" className="w-7 h-7 object-contain" />,
    implemented: false,
  },
  {
    name: "8 Pin Custom Chip",
    type: "Battery" as PartType,
    icon: <img src="/images/parts/chip.png" alt="8 Pin Chip" className="w-7 h-7 object-contain" />,
    implemented: false,
  },
  {
    name: "Switch",
    type: "Tactile Switch",
    icon: <img src="/images/parts/switch.png" alt="Switch" className="w-7 h-7 object-contain" />,
    implemented: true,
  },
  {
    name: "Capacitor",
    type: "Capacitor",
    icon: <img src="/images/parts/capacitor.png" alt="Capacitor" className="w-7 h-7 object-contain" />,
    implemented: true,
  },
  {
    name: "Fuse",
    type: "Fuse",
    icon: <img src="/images/parts/fuse.png" alt="Fuse" className="w-7 h-7 object-contain" />,
    implemented: false,
  },
  {
    name: "NPN Transistor",
    type: "NPN Transistor",
    icon: <img src="/images/parts/transistor.png" alt="Transistor" className="w-7 h-7 object-contain" />,
    implemented: false,
  },
  {
    name: "Breadboard",
    type: "Breadboard",
    icon: <img src="/images/parts/breadboard.png" alt="Breadboard" className="w-7 h-7 object-contain" />,
    implemented: true,
  },
  {
    name: "Battery",
    type: "Battery",
    icon: <img src="/images/parts/battery.png" alt="Battery" className="w-7 h-7 object-contain" />,
    implemented: true,
  },
];

export default function LeftSidebar() {
  const addNode = useSceneStore((s) => s.addNode);
  const projectName = useSceneStore((s) => s.projectName);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <aside className="w-[200px] border-r border-slate-200 bg-white flex flex-col h-full shrink-0 overflow-hidden z-10 relative">
      {/* Project Info */}
      <div className="p-4 pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 font-mono tracking-wide truncate">
            {projectName}
          </h2>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-mono mt-1">
          <span>📅</span>
          <span>{dateStr}</span>
        </div>
      </div>

      {/* Parts Catalog */}
      <div className="flex-1 overflow-y-auto p-3 pt-3">
        <h3 className="text-[11px] font-bold text-slate-800 font-mono uppercase tracking-widest mb-3">
          Insert Part
        </h3>
        <p className="text-[10px] text-slate-400 font-mono mb-3 leading-relaxed">
          Wires: click a pin on one part, then a pin on another.
        </p>
        <div className="flex flex-col gap-0.5">
          {parts.filter((p) => p.implemented).map((p) => (
            <button
              key={p.name}
              draggable={p.implemented}
              onDragStart={(e) => {
                if (p.implemented) {
                  e.dataTransfer.setData("application/nodal-part", p.type);
                  e.dataTransfer.effectAllowed = "move";
                }
              }}
              onClick={() => {
                if (p.implemented) {
                  addNode(p.type);
                } else {
                  toast(`${p.name} is coming soon`, "error");
                }
              }}
              className={`part-item flex items-center gap-3 px-2 py-2 rounded-md border border-transparent text-left group focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] ${
                p.implemented ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed opacity-80"
              }`}
            >
              <div className="w-9 h-9 rounded bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white border border-slate-100 group-hover:border-slate-200 transition-all shadow-sm">
                {p.icon}
              </div>
              <span
                className={`text-[13px] font-mono ${
                  p.implemented
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {p.name}
              </span>
            </button>
          ))}

          <h3 className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-widest mt-5 mb-2">
            Coming soon
          </h3>
          {parts.filter((p) => !p.implemented).map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 px-2 py-1.5 rounded-md opacity-50 select-none"
              title="Not available yet"
            >
              <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 grayscale">
                {p.icon}
              </div>
              <span className="text-[12px] font-mono text-slate-400">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
