"use client";
import dynamic from "next/dynamic";
import React from "react";
import MechanicalTopBar from "@/components/layout/MechanicalTopBar";

// History reads local IndexedDB, so keep it client-only.
const History = dynamic(
  () => import("@/modules/mechanical/pages/History").then((m) => ({ default: m.History })),
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
  return (
    <>
      <MechanicalTopBar />
      <History />
    </>
  );
}
