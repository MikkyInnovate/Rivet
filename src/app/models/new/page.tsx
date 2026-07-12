"use client";
import dynamic from "next/dynamic";
import React from "react";

// Camera + getUserMedia: browser-only, so disable SSR.
const Scan = dynamic(
  () => import("@/modules/models/pages/Scan").then((m) => ({ default: m.Scan })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-stone-950 text-amber-50">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono text-stone-500 tracking-widest uppercase">
          Opening scanner…
        </span>
      </div>
    ),
  }
);

export default function ScanPage() {
  return <Scan />;
}
