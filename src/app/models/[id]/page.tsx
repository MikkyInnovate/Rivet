"use client";
import dynamic from "next/dynamic";
import React from "react";

// three.js + jsPDF: browser-only, so disable SSR. Studio reads the [id] param
// via next/navigation's useParams internally.
const Studio = dynamic(
  () => import("@/modules/models/pages/Studio").then((m) => ({ default: m.Studio })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-stone-950 text-amber-50">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono text-stone-500 tracking-widest uppercase">
          Loading studio…
        </span>
      </div>
    ),
  }
);

export default function StudioPage() {
  return <Studio />;
}
