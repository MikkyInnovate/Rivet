"use client";
import dynamic from "next/dynamic";
import React from "react";

// History reads local IndexedDB, so keep it client-only. Navigation is owned by
// the global studio sidebar, so no per-page top bar here.
const History = dynamic(
  () => import("@/modules/models/pages/History").then((m) => ({ default: m.History })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-32 w-full bg-stone-50">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function HistoryPage() {
  return <History />;
}
