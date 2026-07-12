"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Box, Settings, GraduationCap } from "lucide-react";

type Accent = "teal" | "amber";

type NavItem = {
  name: string;
  sub: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (p: string) => boolean;
  accent: Accent;
};

const NAV: NavItem[] = [
  {
    name: "Electrical",
    sub: "Circuit Lab",
    href: "/",
    icon: Zap,
    isActive: (p) => p === "/" || p.startsWith("/electrical"),
    accent: "teal",
  },
  {
    name: "Mechanical",
    sub: "3D Studio",
    href: "/mechanical/history",
    icon: Box,
    isActive: (p) => p.startsWith("/mechanical"),
    accent: "amber",
  },
];

const ACTIVE: Record<Accent, string> = {
  teal: "text-teal-300 bg-teal-500/10 border-teal-500/30",
  amber: "text-amber-300 bg-amber-500/10 border-amber-500/30",
};

export default function Sidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="w-20 h-full flex flex-col items-center py-4 bg-slate-950 border-r border-slate-800 shrink-0 select-none z-30">
      {/* Brand */}
      <Link href="/" className="group mb-6 flex flex-col items-center gap-1.5" aria-label="Graphite home">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg group-hover:border-teal-500/40 transition-colors">
          <GraduationCap className="w-5 h-5 text-slate-200 group-hover:text-teal-400 transition-colors" />
        </div>
        <span className="text-[9px] font-bold tracking-[0.15em] text-slate-500 uppercase">
          Graphite
        </span>
      </Link>

      {/* Modes */}
      <nav className="flex-1 w-full flex flex-col items-center gap-2 px-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`w-full flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 ${
                active
                  ? ACTIVE[item.accent]
                  : "text-slate-400 border-transparent hover:text-slate-100 hover:bg-slate-800/60"
              }`}
              title={`${item.name} — ${item.sub}`}
            >
              <Icon className="w-[22px] h-[22px]" />
              <span className="text-[10px] font-semibold leading-none">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <button
        type="button"
        className="w-full flex flex-col items-center gap-1.5 py-3 rounded-xl text-slate-400 border border-transparent hover:text-slate-100 hover:bg-slate-800/60 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60"
        title="Settings"
      >
        <Settings className="w-[22px] h-[22px]" />
        <span className="text-[10px] font-semibold leading-none">Settings</span>
      </button>
    </aside>
  );
}
