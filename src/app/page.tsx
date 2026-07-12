"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Box, ArrowRight, Plus, Clock, CircuitBoard } from "lucide-react";
import { useStore } from "@/modules/models/store";
import { CIRCUIT_STORAGE_KEY, SavedCircuit } from "@/store/useSceneStore";
import { DocumentPreview } from "@/modules/models/components/DocumentPreview";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export default function HomePage() {
  const models = useStore((s) => s.models);
  const loadModelsFromStorage = useStore((s) => s.loadModelsFromStorage);
  const [circuit, setCircuit] = useState<SavedCircuit | null>(null);

  useEffect(() => {
    loadModelsFromStorage();
    try {
      const raw = localStorage.getItem(CIRCUIT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedCircuit;
        if (Array.isArray(saved.nodes)) setCircuit(saved);
      }
    } catch {
      // Ignore corrupt save.
    }
  }, [loadModelsFromStorage]);

  const hasAnything = circuit !== null || models.length > 0;

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <h1 className="text-2xl font-bold text-slate-900">Welcome to Graphite</h1>
        <p className="text-slate-500 mt-1 mb-8">
          Your engineering sandbox — build circuits, scan drawings, learn by doing.
        </p>

        {/* Create actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link
            href="/circuits"
            className="group bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 hover:border-teal-400 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                Circuits
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Build and simulate circuits on a 3D breadboard.
              </p>
            </div>
          </Link>

          <Link
            href="/models/new"
            className="group bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 hover:border-amber-400 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                Models
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Turn a 2D engineering drawing into an interactive 3D model.
              </p>
            </div>
          </Link>
        </div>

        {/* Continue */}
        {circuit && (
          <section className="mb-10">
            <h2 className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-3">
              Continue where you left off
            </h2>
            <Link
              href="/circuits"
              className="group bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-teal-400 hover:shadow-md transition-all max-w-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <CircuitBoard className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">
                  {circuit.projectName || "Untitled circuit"}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                  <span>{circuit.nodes.length} parts · {circuit.wires.length} wires</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(circuit.savedAt)}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 shrink-0" />
            </Link>
          </section>
        )}

        {/* Recent models */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Recent models
            </h2>
            {models.length > 0 && (
              <Link
                href="/models"
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                View all
              </Link>
            )}
          </div>

          {models.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <Box className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-4">
                No models yet. Scan an engineering drawing to create your first 3D model.
              </p>
              <Link
                href="/models/new"
                className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> New model
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {models.slice(0, 4).map((m) => (
                <Link
                  key={m.id}
                  href={`/models/${m.id}`}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-amber-400 hover:shadow-md transition-all"
                >
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <DocumentPreview
                      src={m.originalImage}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-slate-900 truncate">{m.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{timeAgo(m.timestamp)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {!hasAnything && (
          <p className="text-xs text-slate-400 mt-10 text-center">
            Everything is stored locally in your browser — no account needed.
          </p>
        )}
      </div>
    </div>
  );
}
