import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GlassCard, PageHeader, Section } from "@/components/GlassCard";
import { generateRevision, saveRevision, listRevision, type RevisionContent, type RevisionKind } from "@/lib/revision.functions";
import { GraduationCap, Sparkles, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/revision")({ component: RevisionPage });

const KINDS: { id: RevisionKind; label: string; desc: string }[] = [
  { id: "flashcards", label: "Flashcards", desc: "Active recall cards" },
  { id: "quick_notes", label: "Quick Notes", desc: "Bullet revision notes" },
  { id: "one_pager", label: "One-Pager", desc: "Single-page summary" },
  { id: "exam_prep", label: "Exam Prep", desc: "Must-know outline" },
];

function RevisionPage() {
  const gen = useServerFn(generateRevision);
  const save = useServerFn(saveRevision);
  const list = useServerFn(listRevision);
  const qc = useQueryClient();

  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState<RevisionKind>("flashcards");
  const [content, setContent] = useState<RevisionContent | null>(null);
  const [active, setActive] = useState({ topic: "", kind: "flashcards" as RevisionKind });

  const history = useQuery({ queryKey: ["revision"], queryFn: () => list() });
  const genMut = useMutation({
    mutationFn: () => gen({ data: { topic, kind } }),
    onSuccess: (res) => { setContent(res.content); setActive({ topic, kind }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const saveMut = useMutation({
    mutationFn: () => save({ data: { topic: active.topic, kind: active.kind, content } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["revision"] }); },
  });

  return (
    <Section>
      <PageHeader icon={<GraduationCap className="h-5 w-5" />} title="Revision Center" subtitle="Generate flashcards, quick notes, one-pagers and exam prep on demand." />

      <GlassCard>
        <div className="flex flex-col gap-3 md:flex-row">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic to revise" className="flex-1 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none" />
          <button onClick={() => topic.trim() && genMut.mutate()} disabled={genMut.isPending || !topic.trim()} className="inline-flex items-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-medium text-primary-foreground glow-shadow disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {genMut.isPending ? "Generating…" : "Generate"}
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {KINDS.map((k) => (
            <button key={k.id} onClick={() => setKind(k.id)} className={`rounded-xl border p-3 text-left transition ${kind === k.id ? "border-accent bg-accent/10" : "border-border bg-background/30"}`}>
              <p className="text-sm font-semibold">{k.label}</p>
              <p className="text-xs text-muted-foreground">{k.desc}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {content && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{active.topic}</h2>
            <button onClick={() => saveMut.mutate()} className="inline-flex items-center gap-1.5 rounded-lg brand-gradient px-4 py-2 text-sm text-primary-foreground"><Save className="h-3.5 w-3.5" /> Save</button>
          </div>
          <RenderContent content={content} />
        </div>
      )}

      <GlassCard className="mt-8">
        <h3 className="mb-3 text-sm font-semibold">Saved revision</h3>
        {history.data?.items.length ? (
          <ul className="grid gap-2 md:grid-cols-2">
            {history.data.items.map((it) => (
              <li key={it.id} className="rounded-xl border border-border/60 bg-background/30 p-3 text-sm">
                <p className="font-medium">{it.topic}</p>
                <p className="text-xs text-muted-foreground">{KINDS.find((k) => k.id === it.kind)?.label} · {new Date(it.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground">No saved revision yet.</p>}
      </GlassCard>
    </Section>
  );
}

function RenderContent({ content }: { content: RevisionContent }) {
  if (content.kind === "flashcards") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {content.cards.map((c, i) => <Flashcard key={i} front={c.front} back={c.back} />)}
      </div>
    );
  }
  if (content.kind === "quick_notes") {
    return (
      <GlassCard>
        <ul className="space-y-2 text-sm">
          {content.bullets.map((b, i) => <li key={i} className="rounded-lg border border-border/60 bg-background/30 px-3 py-2">• {b}</li>)}
        </ul>
      </GlassCard>
    );
  }
  if (content.kind === "one_pager") {
    return (
      <div className="space-y-3">
        {content.sections.map((s, i) => (
          <GlassCard key={i}>
            <h3 className="text-base font-semibold text-accent">{s.heading}</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/85">{s.body}</p>
          </GlassCard>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {content.topics.map((t, i) => (
        <GlassCard key={i}>
          <p className="font-semibold">{t.topic}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {t.mustKnow.map((m, j) => <li key={j} className="rounded-md border border-border/40 bg-background/30 px-2 py-1">{m}</li>)}
          </ul>
        </GlassCard>
      ))}
    </div>
  );
}

function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.button onClick={() => setFlipped(!flipped)} className="relative h-44 w-full perspective-[1000px]">
      <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5 }} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl brand-gradient p-4 text-center text-sm font-medium text-primary-foreground glow-shadow [backface-visibility:hidden]">
          {front}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center text-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-foreground/90">{back}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><RotateCcw className="h-3 w-3" /> flip back</p>
        </div>
      </motion.div>
    </motion.button>
  );
}
