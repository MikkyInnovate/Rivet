"use client";
import React, { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import dynamic from "next/dynamic";
import { useSceneStore } from "@/store/useSceneStore";

function CanvasContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {children}
    </div>
  );
}

const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#F8FAFC]">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-slate-200 rounded-xl flex items-center justify-center mb-4 bg-white shadow-sm">
          <div className="w-6 h-6 border-2 border-[#5EEAD4] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
      <span className="text-xs font-mono text-slate-400 tracking-widest uppercase animate-pulse">
        Initializing Canvas...
      </span>
    </div>
  ),
});

export default function EditorPage() {
  const hydrateFromStorage = useSceneStore((s) => s.hydrateFromStorage);

  // Restore the last-saved circuit once on mount.
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <div className="h-screen w-full flex flex-col bg-white text-slate-900 overflow-hidden font-sans selection:bg-[#5EEAD4]/30">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">
        <LeftSidebar />

        <main className="flex-1 relative flex items-center justify-center w-full h-full bg-[#F8FAFC]">
          <CanvasContainer>
            <Scene />
          </CanvasContainer>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
