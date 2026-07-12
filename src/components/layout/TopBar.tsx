"use client";
import React from "react";

/**
 * Shared top command-bar frame used by every mode. Owns the chrome (height,
 * border, background, padding, stacking) so Electrical and Mechanical render a
 * consistent bar with their own contents. Colors intentionally match the
 * current light bars — the dark-theme pass is deferred.
 */
export function TopBar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0 relative z-20 ${className}`}
    >
      {children}
    </header>
  );
}

export default TopBar;
