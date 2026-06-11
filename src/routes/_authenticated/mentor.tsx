import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { GlassCard, PageHeader, Section } from "@/components/GlassCard";
import { generateMentor, saveMentor, type MentorContent } from "@/lib/mentor.functions";
import { Compass, Sparkles, Save, Briefcase, GraduationCap, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/mentor")({ component: MentorPage });

function MentorPage() {
  const gen = useServerFn(generateMentor);
  const save = useServerFn(saveMentor);
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [content, setContent] = useState<MentorContent | null>(null);

  const genMut = useMutation({
    mutationFn: () => gen({ data: { skills, interests } }),
    onSuccess: (res) => setContent(res.content),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const saveMut = useMutation({
    mutationFn: () => save({ data: { input: { skills, interests }, content } }),
    onSuccess: () => toast.success("Saved"),
  });

  return (
    <Section>
      <PageHeader icon={<Compass className="h-5 w-5" />} title="Career Mentor" subtitle="AI-powered career suggestions tailored to your skills and interests." />

      <GlassCard>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Your skills</label>
            <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, SQL, statistics, ML basics…" rows={4} className="w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Your interests</label>
            <textarea value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Healthcare, finance, generative AI…" rows={4} className="w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none" />
          </div>
        </div>
        <button onClick={() => skills.trim() && interests.trim() && genMut.mutate()} disabled={genMut.isPending || !skills.trim() || !interests.trim()} className="mt-4 inline-flex items-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-semibold text-primary-foreground glow-shadow disabled:opacity-60">
          <Sparkles className="h-4 w-4" /> {genMut.isPending ? "Analyzing…" : "Get suggestions"}
        </button>
      </GlassCard>

      {content && (
        <div className="mt-6">
          <div className="mb-4 flex justify-end">
            <button onClick={() => saveMut.mutate()} className="inline-flex items-center gap-1.5 rounded-lg brand-gradient px-4 py-2 text-sm text-primary-foreground"><Save className="h-3.5 w-3.5" /> Save</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.careers.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <GlassCard>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl brand-gradient text-primary-foreground"><Briefcase className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{c.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm">
                    <Row icon={<GraduationCap className="h-3.5 w-3.5" />} label="Required Skills">{c.requiredSkills.join(" · ")}</Row>
                    <Row icon={<GraduationCap className="h-3.5 w-3.5" />} label="Certifications">{c.certifications.join(" · ")}</Row>
                    <Row icon={<DollarSign className="h-3.5 w-3.5" />} label="Salary">{c.salaryInsights}</Row>
                    <Row icon={<TrendingUp className="h-3.5 w-3.5" />} label="Future">{c.futureOpportunities}</Row>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/30 p-3">
      <p className="mb-0.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-accent">{icon} {label}</p>
      <p className="text-sm text-foreground/85">{children}</p>
    </div>
  );
}
