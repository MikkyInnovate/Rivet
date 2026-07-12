import { redirect } from "next/navigation";

// Mechanical opens straight into the studio hub (your models + New Scan),
// not the marketing landing.
export default function MechanicalIndex() {
  redirect("/mechanical/history");
}
