"use client";
import React from "react";

interface ToggleProps {
  active: boolean;
  onToggle: (active: boolean) => void;
  label: string;
}

export default function Toggle({ active, onToggle, label }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-mono text-slate-600">{label}</span>
      <button
        onClick={() => onToggle(!active)}
        className={`toggle-switch ${active ? "active" : "inactive"}`}
        aria-label={label}
        role="switch"
        aria-checked={active}
      >
        <div className="toggle-knob" />
      </button>
    </div>
  );
}
