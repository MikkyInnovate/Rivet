import React from "react";

// Scroll container for all Mechanical routes. Immersive routes (Scan, Studio)
// paint their own full-screen background over this; browsing routes (Landing,
// History) scroll within it.
export default function MechanicalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full overflow-y-auto bg-stone-950 text-slate-100 font-sans">
      {children}
    </div>
  );
}
