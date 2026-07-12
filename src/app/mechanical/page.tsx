import React from "react";
import MechanicalTopBar from "@/components/layout/MechanicalTopBar";
import { Landing } from "@/modules/mechanical/pages/Landing";

// /mechanical — drafting landing. Static-friendly (no browser-only deps).
export default function MechanicalHome() {
  return (
    <>
      <MechanicalTopBar />
      <Landing />
    </>
  );
}
