import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GlassCard, PageHeader, Section } from "@/components/GlassCard";
import { generateRoadmap, saveRoadmap, listRoadmaps, type RoadmapContent } from "@/lib/roadmap.functions";
import { Compass, Sparkles, Save, GraduationCap, Wrench, BookMarked, Award } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/roadmaps")({ component: RoadmapsPage });

const PRESETS = ["AI Engineer", "Web Developer", "Data Analyst", "Cyber Security"];

function RoadmapsPage() {
  const gen = useServerFn(generateRoadmap);
  const save = useServerFn(saveRoadmap);
  const list = useServerFn(listRoadmaps);
  const qc = useQueryClient();
  const [goal, setGoal] = useState("");
  const [content, setContent] = useState<RoadmapContent | null>(null);
  const [active, setActive] = useState("");

  const history = useQuery({ queryKey: ["roadmaps"], queryFn: () => list() });
  const genMut = useMutation({
    mutationFn: (g: string) => gen({ data: { goal: g } }),
    onSuccess: (res, g) => { setContent(res.content); setActive(g); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const saveMut = useMutation({
    mutationFn: () => save({ data: { goal: active, content } }),
    onSuccess: () => { toast.success("Roadmap saved"); qc.invalidateQueries({ queryKey: ["roadmaps"] }); },
  });

  return (
    <Section>
      <PageHeader icon={<Compass className="h-5 w-5" />} title="AI Roadmap Generator" subtitle="Get a complete, structured roadmap from beginner to advanced." />

      <GlassCard>
        <form onSubmit={(e) => { e.preventDefault(); if (goal.trim()) genMut.mutate(goal.trim()); }} className="flex flex-col gap-3 md:flex-row">
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What do you want to become?" className="flex-1 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none" />
          <button disabled={genMut.isPending || !goal.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-medium text-primary-foreground glow-shadow disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {genMut.isPending ? "Generating…" : "Generate roadmap"}
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => { setGoal(p); genMut.mutate(p); }} className="rounded-full border border-border bg-background/30 px-3 py-1 text-xs text-muted-foreground hover:text-foreground">{p}</button>
          ))}
        </div>
      </GlassCard>

      {content && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{active} Roadmap</h2>
            <button onClick={() => saveMut.mutate()} className="inline-flex items-center gap-1.5 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-primary-foreground"><Save className="h-3.5 w-3.5" /> Save</button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {content.levels?.map((lvl, i) => (
              <motion.div key={lvl.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <GlassCard>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs uppercase tracking-wider">
                    Level {i + 1} · {lvl.name}
                  </div>
                  <Group icon={<GraduationCap className="h-3.5 w-3.5" />} title="Skills" items={lvl.skills} />
                  <Group icon={<Wrench className="h-3.5 w-3.5" />} title="Projects" items={lvl.projects} />
                  <Group icon={<BookMarked className="h-3.5 w-3.5" />} title="Resources" items={lvl.resources} />
                  <Group icon={<Award className="h-3.5 w-3.5" />} title="Certifications" items={lvl.certifications} />
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <GlassCard className="mt-8">
        <h3 className="mb-3 text-sm font-semibold">Saved roadmaps</h3>
        {history.data?.roadmaps.length ? (
          <ul className="grid gap-2 md:grid-cols-2">
            {history.data.roadmaps.map((r) => (
              <li key={r.id} className="rounded-xl border border-border/60 bg-background/30 p-3 text-sm">
                <p className="font-medium">{r.goal}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground">No saved roadmaps yet.</p>}
      </GlassCard>
    </Section>
  );
}

function Group({ icon, title, items }: { icon: React.ReactNode; title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-accent">{icon} {title}</p>
      <ul className="space-y-1 text-sm">
        {items.map((s, i) => <li key={i} className="rounded-md border border-border/40 bg-background/30 px-2 py-1">{s}</li>)}
      </ul>
    </div>
  );
}
