"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, FileClock, Scan } from "lucide-react";
import { TopBar } from "./TopBar";

/**
 * Top bar for the Mechanical (drafting) browsing pages — Landing and History.
 * Replaces the old floating module NavBar. Immersive routes (Scan, Studio) omit
 * it and rely on the global rail + their own in-canvas controls.
 */
export default function MechanicalTopBar() {
  const pathname = usePathname();
  const isActive = (p: string) => pathname === p;

  const link = (active: boolean) =>
    `flex items-center gap-1.5 text-sm font-medium transition-colors ${
      active ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
    }`;

  return (
    <TopBar>
      <Link
        href="/mechanical"
        className="flex items-center gap-2 font-bold text-slate-900 text-lg"
      >
        <Box className="w-6 h-6 text-blue-600" />
        <span>Graphite</span>
      </Link>

      <div className="flex gap-6">
        <Link href="/mechanical/scan" className={link(isActive("/mechanical/scan"))}>
          <Scan className="w-4 h-4" /> Scan
        </Link>
        <Link href="/mechanical/history" className={link(isActive("/mechanical/history"))}>
          <FileClock className="w-4 h-4" /> History
        </Link>
      </div>
    </TopBar>
  );
}
