import { GlassCard } from "@/components/GlassCard";
import { useState } from "react";

type El = { z: number; sym: string; name: string; cat: string };

const ELS: El[] = [
  { z: 1, sym: "H", name: "Hydrogen", cat: "nonmetal" },
  { z: 2, sym: "He", name: "Helium", cat: "noble" },
  { z: 3, sym: "Li", name: "Lithium", cat: "alkali" },
  { z: 4, sym: "Be", name: "Beryllium", cat: "alkaline" },
  { z: 5, sym: "B", name: "Boron", cat: "metalloid" },
  { z: 6, sym: "C", name: "Carbon", cat: "nonmetal" },
  { z: 7, sym: "N", name: "Nitrogen", cat: "nonmetal" },
  { z: 8, sym: "O", name: "Oxygen", cat: "nonmetal" },
  { z: 9, sym: "F", name: "Fluorine", cat: "halogen" },
  { z: 10, sym: "Ne", name: "Neon", cat: "noble" },
  { z: 11, sym: "Na", name: "Sodium", cat: "alkali" },
  { z: 12, sym: "Mg", name: "Magnesium", cat: "alkaline" },
  { z: 13, sym: "Al", name: "Aluminium", cat: "metal" },
  { z: 14, sym: "Si", name: "Silicon", cat: "metalloid" },
  { z: 15, sym: "P", name: "Phosphorus", cat: "nonmetal" },
  { z: 16, sym: "S", name: "Sulfur", cat: "nonmetal" },
  { z: 17, sym: "Cl", name: "Chlorine", cat: "halogen" },
  { z: 18, sym: "Ar", name: "Argon", cat: "noble" },
  { z: 19, sym: "K", name: "Potassium", cat: "alkali" },
  { z: 20, sym: "Ca", name: "Calcium", cat: "alkaline" },
];

const CAT_COLOR: Record<string, string> = {
  alkali: "oklch(0.7 0.18 30)",
  alkaline: "oklch(0.72 0.16 80)",
  metal: "oklch(0.7 0.14 220)",
  metalloid: "oklch(0.72 0.14 160)",
  nonmetal: "oklch(0.78 0.16 200)",
  halogen: "oklch(0.7 0.2 330)",
  noble: "oklch(0.66 0.25 310)",
};

export function PeriodicTable() {
  const [sel, setSel] = useState<El | null>(ELS[5]);
  return (
    <GlassCard>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
        {ELS.map((e) => (
          <button key={e.z} onClick={() => setSel(e)} className={`aspect-square rounded-lg p-1.5 text-left transition ${sel?.z === e.z ? "ring-2 ring-accent" : ""}`} style={{ background: CAT_COLOR[e.cat] }}>
            <p className="text-[10px] opacity-80">{e.z}</p>
            <p className="text-lg font-bold text-black">{e.sym}</p>
            <p className="truncate text-[9px] text-black/70">{e.name}</p>
          </button>
        ))}
      </div>
      {sel && (
        <div className="mt-4 rounded-xl border border-border bg-background/30 p-4">
          <p className="text-xs uppercase text-muted-foreground">Element {sel.z}</p>
          <p className="mt-1 text-xl font-semibold">{sel.name} ({sel.sym})</p>
          <p className="text-sm text-muted-foreground">Category: {sel.cat}</p>
        </div>
      )}
    </GlassCard>
  );
}
