import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GlassCard, PageHeader, Section } from "@/components/GlassCard";
import { generateQuiz, saveQuizResult, listQuizzes, type QuizQuestion } from "@/lib/quiz.functions";
import { Brain, Sparkles, Timer, CheckCircle2, XCircle, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/quiz")({ component: QuizPage });

function QuizPage() {
  const gen = useServerFn(generateQuiz);
  const save = useServerFn(saveQuizResult);
  const list = useServerFn(listQuizzes);
  const qc = useQueryClient();

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(0);

  const history = useQuery({ queryKey: ["quizzes"], queryFn: () => list() });

  const generateMut = useMutation({
    mutationFn: () => gen({ data: { topic, difficulty, count } }),
    onSuccess: (res) => {
      setQuestions(res.questions);
      setAnswers([]);
      setIdx(0);
      setDone(false);
      setTime(0);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  useEffect(() => {
    if (!questions || done) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [questions, done]);

  const score = questions
    ? questions.reduce((s, q, i) => s + (answers[i]?.trim().toLowerCase() === q.answer.trim().toLowerCase() ? 1 : 0), 0)
    : 0;

  function submit(ans: string) {
    if (!questions) return;
    const next = [...answers];
    next[idx] = ans;
    setAnswers(next);
    if (idx < questions.length - 1) setIdx(idx + 1);
    else {
      setDone(true);
      const finalScore = questions.reduce((s, q, i) => s + ((next[i] ?? "").trim().toLowerCase() === q.answer.trim().toLowerCase() ? 1 : 0), 0);
      save({ data: { topic, difficulty, total: questions.length, score: finalScore, questions, answers: next } })
        .then(() => qc.invalidateQueries({ queryKey: ["quizzes"] }))
        .then(() => qc.invalidateQueries({ queryKey: ["profile"] }));
    }
  }

  const current = questions?.[idx];

  return (
    <Section>
      <PageHeader icon={<Brain className="h-5 w-5" />} title="Smart Quiz Generator" subtitle="AI-generated quizzes with instant scoring and explanations." />

      {!questions && (
        <GlassCard>
          <div className="grid gap-3 md:grid-cols-12">
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (e.g. SQL Joins)" className="md:col-span-6 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none" />
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as never)} className="md:col-span-3 rounded-xl border border-border bg-background/40 px-3 py-3 text-sm">
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="md:col-span-3 rounded-xl border border-border bg-background/40 px-3 py-3 text-sm">
              {[3, 5, 7, 10, 15].map((n) => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
          <button onClick={() => topic.trim() && generateMut.mutate()} disabled={generateMut.isPending || !topic.trim()} className="mt-4 inline-flex items-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-semibold text-primary-foreground glow-shadow disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {generateMut.isPending ? "Generating…" : "Generate quiz"}
          </button>
        </GlassCard>
      )}

      {questions && !done && current && (
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Question {idx + 1} of {questions.length}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs"><Timer className="h-3 w-3" /> {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}</span>
          </div>
          <div className="mb-4 h-1.5 rounded-full bg-secondary"><div className="h-1.5 rounded-full brand-gradient transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} /></div>

          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <h3 className="text-lg font-semibold">{current.question}</h3>
              <div className="mt-5 grid gap-2">
                {current.type === "mcq" && current.options?.map((opt) => (
                  <button key={opt} onClick={() => submit(opt)} className="rounded-xl border border-border bg-background/30 px-4 py-3 text-left text-sm hover:border-foreground/30">{opt}</button>
                ))}
                {current.type === "true_false" && ["True", "False"].map((opt) => (
                  <button key={opt} onClick={() => submit(opt)} className="rounded-xl border border-border bg-background/30 px-4 py-3 text-left text-sm hover:border-foreground/30">{opt}</button>
                ))}
                {current.type === "fill_blank" && (
                  <FillBlank onSubmit={submit} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      )}

      {done && questions && (
        <div className="space-y-4">
          <GlassCard>
            <div className="text-center">
              <p className="text-xs uppercase text-muted-foreground">Your score</p>
              <p className="brand-text mt-2 text-5xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{score} / {questions.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">{Math.round((score / questions.length) * 100)}% accuracy · {Math.floor(time / 60)}m {time % 60}s</p>
              <button onClick={() => { setQuestions(null); setDone(false); setTopic(""); }} className="mt-5 inline-flex rounded-xl brand-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground">New quiz</button>
            </div>
          </GlassCard>
          {questions.map((q, i) => {
            const ok = (answers[i] ?? "").trim().toLowerCase() === q.answer.trim().toLowerCase();
            return (
              <GlassCard key={i}>
                <div className="flex items-start gap-3">
                  {ok ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
                    <p className="mt-1 text-sm"><span className="text-muted-foreground">Your answer:</span> {answers[i] || "—"}</p>
                    {!ok && <p className="text-sm"><span className="text-muted-foreground">Correct:</span> {q.answer}</p>}
                    <p className="mt-2 rounded-lg bg-secondary/60 p-3 text-sm text-foreground/85">{q.explanation}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <GlassCard className="mt-8">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4" /> Past quizzes</h3>
        {history.data?.quizzes.length ? (
          <ul className="space-y-2">
            {history.data.quizzes.slice(0, 10).map((q) => (
              <li key={q.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/30 p-3 text-sm">
                <div>
                  <p className="font-medium">{q.topic}</p>
                  <p className="text-xs text-muted-foreground">{q.difficulty} · {new Date(q.created_at).toLocaleDateString()}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs">{q.score}/{q.total} · {Math.round((q.score / q.total) * 100)}%</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground">No quizzes yet.</p>}
      </GlassCard>
    </Section>
  );
}

function FillBlank({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) onSubmit(v.trim()); }} className="flex gap-2">
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Type your answer…" className="flex-1 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none" autoFocus />
      <button className="rounded-xl brand-gradient px-5 py-3 text-sm font-medium text-primary-foreground">Submit</button>
    </form>
  );
}
