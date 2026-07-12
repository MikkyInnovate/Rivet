"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Square,
  ChevronDown,
  Undo2,
  Redo2,
  Trash2,
  Code2,
  GitFork,
  Copy,
  Check,
} from "lucide-react";
import { useSceneStore } from "@/store/useSceneStore";

function ProjectDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const projectName = useSceneStore((s) => s.projectName);
  const setProjectName = useSceneStore((s) => s.setProjectName);
  const undo = useSceneStore((s) => s.undo);
  const redo = useSceneStore((s) => s.redo);
  const undoStack = useSceneStore((s) => s.undoStack);
  const redoStack = useSceneStore((s) => s.redoStack);
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
          <button className="w-full text-left px-4 py-2.5 text-sm font-mono text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
            <Trash2 size={14} /> Delete Project
          </button>
        </div>
      )}
    </div>
  );
}

function EmbedPopover() {
  const [open, setOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const embedUrl = "https://nodal.app/embed/project-abc123";
  const embedCode = `<iframe src="${embedUrl}" width="800" height="600" frameborder="0"></iframe>`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const copyToClipboard = async (text: string, type: "url" | "code") => {
    await navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5 font-mono uppercase tracking-wider"
      >
        <Code2 size={14} />
        Embed
      </button>

      {open && (
        <div className="popover-content absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4">
          <div className="mb-3">
            <label className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wide mb-1.5 block">
              Embed URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={embedUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono text-slate-600 outline-none"
              />
              <button
                onClick={() => copyToClipboard(embedUrl, "url")}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors text-slate-500"
              >
                {copiedUrl ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wide mb-1.5 block">
              Embed Code
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={embedCode}
                className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono text-slate-600 outline-none"
              />
              <button
                onClick={() => copyToClipboard(embedCode, "code")}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors text-slate-500"
              >
                {copiedCode ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const isSimulating = useSceneStore((s) => s.isSimulating);
  const toggleSimulation = useSceneStore((s) => s.toggleSimulation);
  const simulationTime = useSceneStore((s) => s.simulationTime);
  const undo = useSceneStore((s) => s.undo);
  const redo = useSceneStore((s) => s.redo);

  // Keyboard shortcuts
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    },
    [undo, redo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  return (
    <nav className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 z-20 shrink-0 relative">
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
            Nodal
          </h1>
        </div>

        <span className="text-sm text-slate-500 font-mono hover:text-slate-800 cursor-pointer transition-colors hidden md:inline">
          Explore
        </span>
      </div>

      {/* Center: Project name dropdown */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <ProjectDropdown />
        {isSimulating && (
          <div className="mt-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Clock: {simulationTime.toFixed(2)}s
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <EmbedPopover />

        <button className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5 font-mono uppercase tracking-wider">
          <GitFork size={14} />
          Fork
        </button>

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

        <div className="w-8 h-8 rounded-full bg-slate-200 ml-1 overflow-hidden border border-slate-300 cursor-pointer hover:ring-2 hover:ring-[#5EEAD4] transition-all">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=NodalUser"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
}
