"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Box, Settings, GraduationCap, Boxes, User, Home } from "lucide-react";
import { useStore } from "@/modules/mechanical/store";

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const models = useStore((s) => s.models);
  const loadModelsFromStorage = useStore((s) => s.loadModelsFromStorage);

  useEffect(() => {
    loadModelsFromStorage();
  }, [loadModelsFromStorage]);

  const homeActive = pathname === "/";
  const electricalActive = pathname.startsWith("/electrical");
  const mechanicalActive = pathname.startsWith("/mechanical");

  return (
    <aside className="w-60 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-slate-900 leading-tight">Graphite</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Engineering Sandbox
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 mb-2">
          Workspaces
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            aria-current={homeActive ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              homeActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Home className="w-[18px] h-[18px]" />
            Home
          </Link>

          <Link
            href="/electrical"
            aria-current={electricalActive ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              electricalActive
                ? "bg-teal-50 text-teal-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Zap className="w-[18px] h-[18px]" />
            Electrical Lab
          </Link>

          <Link
            href="/mechanical/history"
            aria-current={mechanicalActive ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mechanicalActive
                ? "bg-amber-50 text-amber-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Box className="w-[18px] h-[18px]" />
            Mechanical Studio
            {models.length > 0 && (
              <span
                className={`ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded ${
                  mechanicalActive
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {models.length}
              </span>
            )}
          </Link>
        </div>

        {models.length > 0 && (
          <>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 mt-6 mb-2">
              Recent models
            </div>
            <div className="flex flex-col gap-0.5">
              {models.slice(0, 6).map((m) => {
                const active = pathname === `/mechanical/studio/${m.id}`;
                return (
                  <Link
                    key={m.id}
                    href={`/mechanical/studio/${m.id}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      active
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Boxes className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{m.name}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-slate-700 truncate">My workspace</div>
          <div className="text-[11px] text-slate-400">Local storage</div>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>
      </div>
    </aside>
  );
}
