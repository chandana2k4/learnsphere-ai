import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GlassCard, PageHeader, Section } from "@/components/GlassCard";
import { generateNotes, saveNote, listNotes, getNote, type LearnContent } from "@/lib/learn.functions";
import { BookOpen, Sparkles, Save, Copy, Download, History, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/learn")({
  component: LearnPage,
});

const EXAMPLES = ["Stack", "Queue", "DBMS", "Machine Learning", "Photosynthesis", "Newton's Laws"];

function LearnPage() {
  const gen = useServerFn(generateNotes);
  const save = useServerFn(saveNote);
  const list = useServerFn(listNotes);
  const fetchNote = useServerFn(getNote);
  const qc = useQueryClient();

  const [topic, setTopic] = useState("");
  const [content, setContent] = useState<LearnContent | null>(null);
  const [activeTopic, setActiveTopic] = useState("");

  const generateMut = useMutation({
    mutationFn: (t: string) => gen({ data: { topic: t } }),
    onSuccess: (res, t) => {
      setContent(res.content);
      setActiveTopic(t);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to generate"),
  });

  const saveMut = useMutation({
    mutationFn: () => save({ data: { topic: activeTopic, content: content! } }),
    onSuccess: () => {
      toast.success("Saved to your notes");
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const history = useQuery({ queryKey: ["notes"], queryFn: () => list() });

  async function loadNote(id: string) {
    const { note } = await fetchNote({ data: { id } });
    setContent(note.content);
    setActiveTopic(note.topic);
    setTopic(note.topic);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Section>
      <PageHeader
        icon={<BookOpen className="h-5 w-5" />}
        title="AI Learning Studio"
        subtitle="Type any topic — get a structured, exam-grade learning module in seconds."
      />

      <GlassCard>
        <form onSubmit={(e) => { e.preventDefault(); if (topic.trim()) generateMut.mutate(topic.trim()); }} className="flex flex-col gap-3 md:flex-row">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Binary Search Trees, Krebs cycle, Bayes Theorem…"
            className="flex-1 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-foreground/25"
          />
          <button
            disabled={generateMut.isPending || !topic.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-medium text-primary-foreground glow-shadow disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" /> {generateMut.isPending ? "Generating…" : "Generate"}
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setTopic(ex); generateMut.mutate(ex); }}
              className="rounded-full border border-border bg-background/30 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      </GlassCard>

      {generateMut.isPending && (
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass h-24 animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {content && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{activeTopic}</h2>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(content, null, 2)); toast.success("Copied"); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs"><Copy className="h-3.5 w-3.5" /> Copy</button>
              <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="inline-flex items-center gap-1.5 rounded-lg brand-gradient px-3 py-1.5 text-xs font-medium text-primary-foreground"><Save className="h-3.5 w-3.5" /> Save</button>
              <button onClick={() => exportToPdf(activeTopic, content)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs"><Download className="h-3.5 w-3.5" /> Export</button>
            </div>
          </div>

          <Expandable title="Overview" open><p className="text-sm leading-relaxed text-foreground/90">{content.overview}</p></Expandable>
          <Expandable title="Definition"><p className="text-sm leading-relaxed">{content.definition}</p></Expandable>
          <Expandable title="Detailed Explanation"><div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{content.explanation}</div></Expandable>
          <Expandable title="Key Concepts">
            <div className="grid gap-3 md:grid-cols-2">
              {content.keyConcepts?.map((c, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-background/30 p-4">
                  <p className="font-semibold text-accent">{c.title}</p>
                  <p className="mt-1 text-sm text-foreground/80">{c.description}</p>
                </div>
              ))}
            </div>
          </Expandable>
          <Expandable title="Examples">
            <div className="space-y-3">
              {content.examples?.map((e, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-background/30 p-4">
                  <p className="font-semibold">{e.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{e.content}</p>
                </div>
              ))}
            </div>
          </Expandable>
          <Expandable title="Applications">
            <ul className="grid gap-2 text-sm md:grid-cols-2">
              {content.applications?.map((a, i) => (
                <li key={i} className="rounded-lg border border-border/60 bg-background/30 px-3 py-2">• {a}</li>
              ))}
            </ul>
          </Expandable>
          <Expandable title="Interview Questions">
            <div className="space-y-3">
              {content.interviewQuestions?.map((q, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-background/30 p-4">
                  <p className="font-semibold">Q{i + 1}. {q.q}</p>
                  <p className="mt-1 text-sm text-foreground/80">{q.a}</p>
                </div>
              ))}
            </div>
          </Expandable>
          <Expandable title="Summary"><p className="text-sm leading-relaxed">{content.summary}</p></Expandable>
        </div>
      )}

      <GlassCard className="mt-8">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4" /> History</h3>
        {history.data?.notes.length ? (
          <ul className="grid gap-2 md:grid-cols-2">
            {history.data.notes.map((n) => (
              <li key={n.id}>
                <button onClick={() => loadNote(n.id)} className="w-full rounded-xl border border-border/60 bg-background/30 p-3 text-left text-sm hover:border-foreground/20">
                  <p className="font-medium">{n.topic}</p>
                  <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Saved notes appear here.</p>
        )}
      </GlassCard>
    </Section>
  );
}

function Expandable({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(!!open);
  return (
    <GlassCard className="!p-0 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between p-5 text-left">
        <span className="font-semibold">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function exportToPdf(topic: string, c: LearnContent) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${topic}</title>
<style>body{font-family:system-ui;max-width:780px;margin:40px auto;padding:0 20px;color:#111;line-height:1.6} h1{color:#4f46e5} h2{margin-top:32px;border-bottom:1px solid #ddd;padding-bottom:6px} li{margin:4px 0} .card{border:1px solid #eee;padding:12px 16px;border-radius:8px;margin:8px 0}</style>
</head><body>
<h1>${topic}</h1>
<h2>Overview</h2><p>${c.overview}</p>
<h2>Definition</h2><p>${c.definition}</p>
<h2>Explanation</h2><p style="white-space:pre-wrap">${c.explanation}</p>
<h2>Key Concepts</h2>${c.keyConcepts?.map(k => `<div class="card"><b>${k.title}</b><p>${k.description}</p></div>`).join("") ?? ""}
<h2>Examples</h2>${c.examples?.map(e => `<div class="card"><b>${e.title}</b><p>${e.content}</p></div>`).join("") ?? ""}
<h2>Applications</h2><ul>${c.applications?.map(a => `<li>${a}</li>`).join("") ?? ""}</ul>
<h2>Interview Questions</h2>${c.interviewQuestions?.map(q => `<div class="card"><b>${q.q}</b><p>${q.a}</p></div>`).join("") ?? ""}
<h2>Summary</h2><p>${c.summary}</p>
<script>window.print()</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}
