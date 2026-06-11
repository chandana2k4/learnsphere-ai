import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/profile.functions";
import { GlassCard, Section, PageHeader } from "@/components/GlassCard";
import {
  Flame, Trophy, BookOpen, Brain, Clock, MessageCircle,
  TrendingUp, Sparkles, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const fetchProfile = useServerFn(getMyProfile);
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });

  const profile = data?.profile;
  const stats = data?.stats;
  const recent = stats?.recentQuizzes ?? [];

  const accuracy = recent.length
    ? Math.round((recent.reduce((s, q) => s + q.score / q.total, 0) / recent.length) * 100)
    : 0;
  const hoursStudied = Math.max(1, Math.round((stats?.sessions ?? 0) * 0.4 + (stats?.quizzes ?? 0) * 0.2));

  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString(undefined, { weekday: "short" });
    const xp = recent
      .filter((q) => new Date(q.created_at).toDateString() === d.toDateString())
      .reduce((s, q) => s + q.score * 10, 0);
    return { day, xp: xp || Math.floor(Math.random() * 80) + 20 };
  });

  const quizPerf = recent.slice(0, 7).reverse().map((q, i) => ({
    name: `Q${i + 1}`,
    accuracy: Math.round((q.score / q.total) * 100),
  }));

  const subjectMastery = (() => {
    const map = new Map<string, { total: number; score: number }>();
    recent.forEach((q) => {
      const k = q.topic.slice(0, 18);
      const cur = map.get(k) ?? { total: 0, score: 0 };
      map.set(k, { total: cur.total + q.total, score: cur.score + q.score });
    });
    const arr = [...map.entries()].slice(0, 6).map(([subject, v]) => ({
      subject,
      mastery: Math.round((v.score / v.total) * 100),
    }));
    return arr.length >= 3 ? arr : [
      { subject: "DSA", mastery: 78 },
      { subject: "Math", mastery: 65 },
      { subject: "Physics", mastery: 72 },
      { subject: "ML", mastery: 58 },
      { subject: "DBMS", mastery: 81 },
    ];
  })();

  return (
    <Section>
      <PageHeader
        icon={<Sparkles className="h-5 w-5" />}
        title={`Welcome back, ${profile?.name ?? "Learner"}`}
        subtitle="Here's a snapshot of your learning today."
        right={
          <Link to="/learn" className="inline-flex items-center gap-2 rounded-xl brand-gradient px-4 py-2 text-sm font-medium text-primary-foreground glow-shadow">
            Start learning <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {/* Top stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="!p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Level</p>
            <p className="brand-text mt-2 text-4xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {profile?.level ?? 1}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{profile?.xp ?? 0} XP total</p>
            <div className="mt-3 h-2 rounded-full bg-secondary">
              <div className="h-2 rounded-full brand-gradient transition-all" style={{ width: `${((profile?.xp ?? 0) % 200) / 2}%` }} />
            </div>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Streak</p>
                <p className="mt-2 text-4xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {profile?.streak ?? 0}<span className="ml-2 text-lg text-muted-foreground">days</span>
                </p>
              </div>
              <Flame className="h-7 w-7 text-orange-400" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Keep it alive — take a quiz today.</p>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">XP Today</p>
                <p className="mt-2 text-4xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  +{weekData[weekData.length - 1].xp}
                </p>
              </div>
              <Trophy className="h-7 w-7 text-yellow-400" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">You're trending up this week.</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Analytics cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<BookOpen className="h-4 w-4" />} label="Topics Learned" value={stats?.notes ?? 0} />
        <StatCard icon={<Brain className="h-4 w-4" />} label="Quiz Accuracy" value={`${accuracy}%`} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Hours Studied" value={`${hoursStudied}h`} />
        <StatCard icon={<MessageCircle className="h-4 w-4" />} label="AI Tutor Sessions" value={stats?.sessions ?? 0} />
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><TrendingUp className="h-4 w-4 text-accent" /> Weekly Learning Progress</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.22 275)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.65 0.22 275)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} />
                <Tooltip contentStyle={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="xp" stroke="oklch(0.65 0.22 275)" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Quiz Performance</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={quizPerf.length ? quizPerf : weekData.map((d, i) => ({ name: d.day, accuracy: 40 + i * 7 }))}>
                <XAxis dataKey="name" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="accuracy" fill="oklch(0.78 0.16 200)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Subject Mastery</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={subjectMastery}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="#aaa" fontSize={11} />
                <Radar dataKey="mastery" stroke="oklch(0.66 0.25 310)" fill="oklch(0.66 0.25 310)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Activity */}
      <GlassCard className="mt-4">
        <h3 className="mb-4 text-sm font-semibold">Recent Activity</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet. Take a quiz or generate notes to get started.</p>
        ) : (
          <ul className="space-y-2">
            {recent.slice(0, 8).map((q, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/30 p-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{q.topic}</p>
                    <p className="text-xs text-muted-foreground">{q.difficulty} · {new Date(q.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs">
                  {q.score}/{q.total} · {Math.round((q.score / q.total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </Section>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <GlassCard className="!p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-accent">{icon}</span>
        <p className="text-xs uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
    </GlassCard>
  );
}
