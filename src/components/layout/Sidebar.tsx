"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Box,
  Settings,
  GraduationCap,
  Boxes,
  User,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useStore } from "@/modules/mechanical/store";

const COLLAPSED_KEY = "graphite_sidebar_collapsed";

type Item = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  activeClass: string;
  collapsedActiveClass: string;
};

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const models = useStore((s) => s.models);
  const loadModelsFromStorage = useStore((s) => s.loadModelsFromStorage);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    loadModelsFromStorage();
    try {
      if (localStorage.getItem(COLLAPSED_KEY) === "1") setCollapsed(true);
    } catch {}
  }, [loadModelsFromStorage]);

  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  };

  const items: Item[] = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      active: pathname === "/",
      activeClass: "bg-slate-100 text-slate-900",
      collapsedActiveClass: "bg-slate-100 text-slate-900",
    },
    {
      name: "Electrical Lab",
      href: "/electrical",
      icon: Zap,
      active: pathname.startsWith("/electrical"),
      activeClass: "bg-teal-50 text-teal-700",
      collapsedActiveClass: "bg-teal-50 text-teal-600",
    },
    {
      name: "Mechanical Studio",
      href: "/mechanical/history",
      icon: Box,
      active: pathname.startsWith("/mechanical"),
      activeClass: "bg-amber-50 text-amber-700",
      collapsedActiveClass: "bg-amber-50 text-amber-600",
    },
  ];

  /* ---------- Collapsed: slim icon rail ---------- */
  if (collapsed) {
    return (
      <aside className="w-[68px] h-full bg-white border-r border-slate-200 flex flex-col items-center shrink-0 z-30 transition-all duration-200">
        {/* Brand mark */}
        <Link
          href="/"
          className="mt-4 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0"
          aria-label="Graphite home"
          title="Graphite"
        >
          <GraduationCap className="w-5 h-5" />
        </Link>

        {/* Expand */}
        <button
          type="button"
          onClick={toggle}
          className="mt-3 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="w-[18px] h-[18px]" />
        </button>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-2 mt-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                title={item.name}
                className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                  item.active
                    ? item.collapsedActiveClass
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-[20px] h-[20px]" />
                <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 pb-4">
          <button
            type="button"
            className="group relative w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-[20px] h-[20px]" />
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
              Settings
            </span>
          </button>
          <div
            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400"
            title="My workspace"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </aside>
    );
  }

  /* ---------- Expanded: studio sidebar ---------- */
  return (
    <aside className="w-60 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 z-30 transition-all duration-200">
      {/* Brand + collapse */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-slate-900 leading-tight">Graphite</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Engineering Sandbox
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 mb-2">
          Workspaces
        </div>
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? item.activeClass
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.name}
                {item.name === "Mechanical Studio" && models.length > 0 && (
                  <span
                    className={`ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded ${
                      item.active
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {models.length}
                  </span>
                )}
              </Link>
            );
          })}
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
