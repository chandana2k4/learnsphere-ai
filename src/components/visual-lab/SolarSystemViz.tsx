import { GlassCard } from "@/components/GlassCard";
import { motion } from "framer-motion";
import { useState } from "react";

const PLANETS = [
  { name: "Mercury", r: 6, dist: 70, color: "#b1b1b1", period: 6, fact: "Smallest planet — closest to the Sun." },
  { name: "Venus", r: 9, dist: 100, color: "#d6a368", period: 10, fact: "Hottest planet due to runaway greenhouse." },
  { name: "Earth", r: 10, dist: 140, color: "#3b82f6", period: 14, fact: "Our home — only known planet with life." },
  { name: "Mars", r: 7, dist: 180, color: "#c1440e", period: 20, fact: "The red planet, target of human exploration." },
  { name: "Jupiter", r: 22, dist: 240, color: "#d8a05a", period: 30, fact: "Largest planet — a gas giant with 95+ moons." },
  { name: "Saturn", r: 18, dist: 300, color: "#e8c87a", period: 38, fact: "Famous for its spectacular ring system." },
];

export function SolarSystemViz() {
  const [selected, setSelected] = useState(PLANETS[2]);
  return (
    <div className="space-y-4">
      <GlassCard className="!p-0 overflow-hidden">
        <div className="relative grid h-[420px] place-items-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_70%)]">
          {/* Sun */}
          <div className="absolute h-12 w-12 rounded-full" style={{ background: "radial-gradient(circle, #fef08a, #f59e0b)", boxShadow: "0 0 60px 20px rgba(245,158,11,0.5)" }} />
          {PLANETS.map((p) => (
            <div key={p.name} className="pointer-events-none absolute rounded-full border border-white/10" style={{ width: p.dist * 2, height: p.dist * 2 }}>
              <motion.button
                onClick={() => setSelected(p)}
                className="pointer-events-auto absolute"
                style={{ left: "50%", top: 0, transformOrigin: `0 ${p.dist}px`, width: p.r * 2, height: p.r * 2, marginLeft: -p.r, marginTop: -p.r }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: p.period, ease: "linear" }}
              >
                <div className="h-full w-full rounded-full" style={{ background: p.color, boxShadow: `0 0 12px ${p.color}` }} />
              </motion.button>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-3 md:grid-cols-3">
        {PLANETS.map((p) => (
          <button key={p.name} onClick={() => setSelected(p)} className={`rounded-xl border bg-background/30 p-4 text-left ${selected.name === p.name ? "border-accent" : "border-border"}`}>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
              <p className="font-semibold">{p.name}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{p.fact}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
