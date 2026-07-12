"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Square,
  ChevronDown,
  Undo2,
  Redo2,
  Trash2,
} from "lucide-react";
import { useSceneStore } from "@/store/useSceneStore";
import { TopBar } from "./TopBar";
import { toast } from "@/components/ui/toast";

function ProjectDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const projectName = useSceneStore((s) => s.projectName);
  const setProjectName = useSceneStore((s) => s.setProjectName);
  const undo = useSceneStore((s) => s.undo);
  const redo = useSceneStore((s) => s.redo);
  const undoStack = useSceneStore((s) => s.undoStack);
  const redoStack = useSceneStore((s) => s.redoStack);
  const clearCircuit = useSceneStore((s) => s.clearCircuit);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors text-sm font-mono text-slate-700"
      >
        {editing ? (
          <input
            className="bg-transparent border-b border-[#5EEAD4] outline-none text-sm font-mono text-slate-700 w-28"
            value={tempName}
            autoFocus
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => {
              setProjectName(tempName || "Untitled");
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setProjectName(tempName || "Untitled");
                setEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{projectName}</span>
        )}
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open && !editing && (
        <div className="dropdown-enter absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => {
              setEditing(true);
              setTempName(projectName);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-mono text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Rename
          </button>
          <div className="h-px bg-slate-100" />
          <button
            onClick={() => {
              undo();
              setOpen(false);
            }}
            disabled={undoStack.length === 0}
            className="w-full text-left px-4 py-2.5 text-sm font-mono text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between disabled:opacity-40"
          >
            <span className="flex items-center gap-2">
              <Undo2 size={14} /> Undo
            </span>
            <span className="flex items-center gap-0.5">
              <kbd>cmd</kbd>
              <span className="text-slate-300 text-xs">+</span>
              <kbd>z</kbd>
            </span>
          </button>
          <button
            onClick={() => {
              redo();
              setOpen(false);
            }}
            disabled={redoStack.length === 0}
            className="w-full text-left px-4 py-2.5 text-sm font-mono text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between disabled:opacity-40"
          >
            <span className="flex items-center gap-2">
              <Redo2 size={14} /> Redo
            </span>
            <span className="flex items-center gap-0.5">
              <kbd>cmd</kbd>
              <span className="text-slate-300 text-xs">+</span>
              <kbd>shift</kbd>
              <span className="text-slate-300 text-xs">+</span>
              <kbd>z</kbd>
            </span>
          </button>
          <div className="h-px bg-slate-100" />
          <button
            onClick={() => {
              clearCircuit();
              setOpen(false);
              toast("Circuit cleared — undo with Ctrl+Z");
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-mono text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} /> Clear Circuit
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const isSimulating = useSceneStore((s) => s.isSimulating);
  const toggleSimulation = useSceneStore((s) => s.toggleSimulation);
  const simulation = useSceneStore((s) => s.simulation);
  const pendingPin = useSceneStore((s) => s.pendingPin);
  const cancelWiring = useSceneStore((s) => s.cancelWiring);
  const undo = useSceneStore((s) => s.undo);
  const redo = useSceneStore((s) => s.redo);
  const deleteSelectedNode = useSceneStore((s) => s.deleteSelectedNode);
  const deleteSelectedWire = useSceneStore((s) => s.deleteSelectedWire);

  // Keyboard shortcuts
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (e.key === "Escape") {
        cancelWiring();
      } else if ((e.key === "Delete" || e.key === "Backspace") && !typing) {
        deleteSelectedNode();
        deleteSelectedWire();
      }
    },
    [undo, redo, deleteSelectedNode, deleteSelectedWire, cancelWiring]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  return (
    <TopBar>
      {/* Left: Brand + Navigation */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800 relative">
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-[2px] bg-slate-800" />
            </div>
          </div>
          <h1 className="font-mono font-bold text-slate-800 text-lg tracking-tight">
            Circuits
          </h1>
        </div>
      </div>

      {/* Center: Project name dropdown */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <ProjectDropdown />
        {pendingPin && (
          <div className="mt-0.5 bg-teal-600 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Click another pin to wire — Esc to cancel
          </div>
        )}
        {!pendingPin && isSimulating && simulation && (
          <div
            className={`mt-0.5 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 tracking-wider text-white ${
              simulation.status === "ok" && simulation.currentA > 0
                ? "bg-slate-900"
                : "bg-amber-600"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                simulation.status === "ok" && simulation.currentA > 0
                  ? "bg-teal-400"
                  : "bg-white"
              }`}
            />
            {simulation.message}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSimulation}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-200 shadow-sm font-mono tracking-wide ${
            isSimulating
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-200"
              : "bg-[#5EEAD4] hover:bg-[#2DD4BF] text-teal-900 shadow-teal-200"
          }`}
        >
          {isSimulating ? (
            <Square size={14} className="fill-current" />
          ) : (
            <Play size={14} className="fill-current" />
          )}
          {isSimulating ? "Stop" : "Simulate"}
        </button>
      </div>
    </TopBar>
  );
}
