"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the Mechanical App router with SSR disabled
// to support browser-only three.js & PDF packages.
const MechanicalApp = dynamic(() => import("@/modules/mechanical/App"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-stone-950 text-amber-50">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-stone-800 rounded-xl flex items-center justify-center mb-4 bg-stone-900 shadow-sm">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
      <span className="text-xs font-mono text-stone-500 tracking-widest uppercase animate-pulse">
        Initializing Mechanical Drafting Studio...
      </span>
    </div>
  ),
});

export default function MechanicalPage() {
  return (
    <div className="w-full h-full overflow-y-auto bg-stone-950 text-slate-100 font-sans">
      <MechanicalApp />
    </div>
  );
}
