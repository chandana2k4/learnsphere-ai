import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, BookOpen, Brain, MessageCircle, Eye, Compass,
  GraduationCap, Trophy, BarChart3, ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearnSphere AI — Learn smarter. Visualize better. Grow faster." },
      { name: "description", content: "AI-powered notes, quizzes, tutoring, visualizers, roadmaps and revision in one premium learning workspace." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: BookOpen, title: "AI Learning Studio", desc: "Generate exam-grade notes on any topic in seconds." },
  { icon: Brain, title: "Smart Quiz Generator", desc: "MCQs, true/false, fill-in-the-blank with instant explanations." },
  { icon: MessageCircle, title: "AI Tutor", desc: "Conversational tutoring with context-aware follow-ups." },
  { icon: Eye, title: "Visual Learning Lab", desc: "Interactive visualizers for DSA, physics & more." },
  { icon: Compass, title: "Career Mentor", desc: "Personalized career suggestions from your skills." },
  { icon: GraduationCap, title: "Revision Center", desc: "Flashcards, one-pagers, exam prep on demand." },
  { icon: BarChart3, title: "Learning Analytics", desc: "Track accuracy, mastery, streaks and time studied." },
  { icon: Trophy, title: "Achievement System", desc: "XP, levels, badges and streak-based gamification." },
];

const STATS = [
  { label: "Students Learning", value: 24830 },
  { label: "Quizzes Generated", value: 138420 },
  { label: "Topics Learned", value: 56120 },
  { label: "AI Conversations", value: 412800 },
];

function Counter({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(Math.floor(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{val.toLocaleString()}</span>;
}

function Landing() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="aurora pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-accent" /> Powered by frontier AI
            </div>
            <h1
              className="text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your Personal{" "}
              <span className="brand-text">AI Learning Companion</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
              Learn any concept, generate quizzes, visualize topics, build roadmaps, and get AI-powered tutoring — all in one place.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth"
                search={{ redirect: undefined }}
                className="group inline-flex items-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-medium text-primary-foreground glow-shadow transition-transform hover:scale-[1.02]"
              >
                Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center rounded-xl border border-border bg-card/40 px-6 py-3 text-sm font-medium backdrop-blur hover:bg-card"
              >
                Explore Features
              </a>
            </div>
          </motion.div>

          {/* Floating preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="glass card-shadow rounded-2xl p-2">
              <div className="rounded-xl bg-background/60 p-6 md:p-10">
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    { k: "Today's XP", v: "+ 240" },
                    { k: "Quiz Accuracy", v: "92%" },
                    { k: "Streak", v: "7 days" },
                  ].map((c) => (
                    <div key={c.k} className="rounded-xl border border-border/60 p-5">
                      <p className="text-xs text-muted-foreground">{c.k}</p>
                      <p className="brand-text mt-2 text-3xl font-semibold">{c.v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-border/60 p-5">
                  <p className="text-xs text-muted-foreground">AI Tutor</p>
                  <p className="mt-2 text-sm text-foreground/90">
                    "Explain the difference between BFS and DFS with a concrete example."
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Thinking…
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            A complete <span className="brand-text">learning ecosystem</span>
          </h2>
          <p className="mt-3 text-muted-foreground">Every tool a serious learner needs, beautifully integrated.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass card-shadow group rounded-2xl p-5 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg brand-gradient text-primary-foreground">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="brand-text text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                <Counter to={s.value} />+
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="glass card-shadow relative overflow-hidden rounded-3xl p-10 text-center md:p-16">
          <div className="aurora pointer-events-none absolute inset-0 -z-10 opacity-60" />
          <h2 className="text-3xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            Ready to <span className="brand-text">learn smarter</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Join thousands using LearnSphere AI to master new topics every day.
          </p>
          <Link
            to="/auth"
            search={{ redirect: undefined }}
            className="mt-7 inline-flex items-center gap-2 rounded-xl brand-gradient px-7 py-3 text-sm font-medium text-primary-foreground glow-shadow"
          >
            Create your free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LearnSphere AI · Learn smarter. Visualize better. Grow faster.
      </footer>
    </main>
  );
}
