import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard, PageHeader, Section } from "@/components/GlassCard";
import { Eye, Layers, ArrowRightLeft, Link2, BarChart2, Atom, Sun, Activity } from "lucide-react";
import { StackViz } from "@/components/visual-lab/StackViz";
import { QueueViz } from "@/components/visual-lab/QueueViz";
import { LinkedListViz } from "@/components/visual-lab/LinkedListViz";
import { SortingViz } from "@/components/visual-lab/SortingViz";
import { PendulumViz } from "@/components/visual-lab/PendulumViz";
import { SolarSystemViz } from "@/components/visual-lab/SolarSystemViz";
import { PeriodicTable } from "@/components/visual-lab/PeriodicTable";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/visual-lab")({ component: VisualLab });

const TOOLS = [
  { id: "stack", label: "Stack", group: "DSA", icon: Layers, comp: StackViz },
  { id: "queue", label: "Queue", group: "DSA", icon: ArrowRightLeft, comp: QueueViz },
  { id: "linked", label: "Linked List", group: "DSA", icon: Link2, comp: LinkedListViz },
  { id: "sorting", label: "Sorting", group: "DSA", icon: BarChart2, comp: SortingViz },
  { id: "pendulum", label: "Pendulum", group: "Physics", icon: Activity, comp: PendulumViz },
  { id: "periodic", label: "Periodic Table", group: "Chemistry", icon: Atom, comp: PeriodicTable },
  { id: "solar", label: "Solar System", group: "Astronomy", icon: Sun, comp: SolarSystemViz },
] as const;

function VisualLab() {
  const [active, setActive] = useState<typeof TOOLS[number]["id"]>("stack");
  const Active = TOOLS.find((t) => t.id === active)!.comp;

  const groups = Array.from(new Set(TOOLS.map((t) => t.group)));

  return (
    <Section>
      <PageHeader icon={<Eye className="h-5 w-5" />} title="Visual Learning Lab" subtitle="Interactive visualizers that make abstract topics click." />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <GlassCard className="!p-3">
          {groups.map((g) => (
            <div key={g} className="mb-3">
              <p className="px-2 py-1 text-xs uppercase tracking-wider text-muted-foreground">{g}</p>
              <div className="mt-1 space-y-1">
                {TOOLS.filter((t) => t.group === g).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${active === t.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}
                  >
                    <t.icon className="h-4 w-4" /> {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </GlassCard>

        <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Active />
        </motion.div>
      </div>
    </Section>
  );
}
