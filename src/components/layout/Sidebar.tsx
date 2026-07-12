"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Box, GraduationCap, LayoutDashboard, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Electrical Lab",
      href: "/",
      icon: Zap,
      active: pathname === "/" || pathname?.startsWith("/electrical"),
      color: "text-teal-400 bg-teal-950/40 border-teal-500/30 hover:bg-teal-900/40",
      inactiveColor: "text-slate-400 hover:text-teal-300 hover:bg-slate-800/40 border-transparent",
      tooltip: "Circuit Simulation Studio"
    },
    {
      name: "Mechanical Studio",
      href: "/mechanical",
      icon: Box,
      active: pathname?.startsWith("/mechanical"),
      color: "text-amber-400 bg-amber-950/40 border-amber-500/30 hover:bg-amber-900/40",
      inactiveColor: "text-slate-400 hover:text-amber-300 hover:bg-slate-800/40 border-transparent",
      tooltip: "3D CAD & Drafting Studio"
    }
  ];

  return (
    <aside className="w-16 h-full flex flex-col items-center py-6 bg-slate-950 border-r border-slate-800 shrink-0 select-none z-30">
      {/* Brand Logo */}
      <Link href="/" className="group mb-10 flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 flex items-center justify-center shadow-lg group-hover:border-teal-500/50 group-hover:shadow-teal-500/10 transition-all duration-300">
          <GraduationCap className="w-6 h-6 text-slate-300 group-hover:text-teal-400 transition-colors" />
        </div>
        <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
          Graphite
        </span>
      </Link>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="relative group flex justify-center">
              <Link
                href={item.href}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                  item.active ? item.color : item.inactiveColor
                }`}
              >
                <Icon className="w-6 h-6" />
              </Link>
              
              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-xl whitespace-nowrap z-50">
                <div className="font-bold text-slate-100">{item.name}</div>
                <div className="text-[10px] text-slate-400">{item.tooltip}</div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4 w-full px-2 mt-auto">
        <div className="relative group flex justify-center">
          <button className="w-12 h-12 rounded-xl flex items-center justify-center border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all duration-200">
            <Settings className="w-6 h-6" />
          </button>
          
          <div className="absolute left-16 bottom-0 ml-2 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-xl whitespace-nowrap z-50">
            <div className="font-bold text-slate-100">Settings</div>
            <div className="text-[10px] text-slate-400">Configure Sandbox Options</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
