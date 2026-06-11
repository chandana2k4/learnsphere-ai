import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GlassCard, PageHeader, Section } from "@/components/GlassCard";
import { getMyProfile, updateProfile } from "@/lib/profile.functions";
import { User as UserIcon, Trophy, Flame, BookOpen, Brain, MessageCircle, Award } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });

const BADGES = [
  { id: "first_steps", label: "First Steps", desc: "Take your first quiz" },
  { id: "streak_7", label: "7 Day Streak", desc: "Learn 7 days in a row" },
  { id: "quiz_master", label: "Quiz Master", desc: "Score 100% on a quiz" },
  { id: "ai_explorer", label: "AI Explorer", desc: "Chat with the AI Tutor" },
  { id: "fast_learner", label: "Fast Learner", desc: "Reach Level 5" },
];

function ProfilePage() {
  const fetchFn = useServerFn(getMyProfile);
  const updateFn = useServerFn(updateProfile);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["profile"], queryFn: () => fetchFn() });
  const [name, setName] = useState("");

  useEffect(() => { if (data?.profile.name) setName(data.profile.name); }, [data]);

  const saveMut = useMutation({
    mutationFn: () => updateFn({ data: { name } }),
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["profile"] }); },
  });

  const earned = new Set(data?.achievements.map((a) => a.badge) ?? []);
  const auto = computeAuto(data);
  auto.forEach((b) => earned.add(b));

  return (
    <Section>
      <PageHeader icon={<UserIcon className="h-5 w-5" />} title="Your Profile" subtitle="Track your XP, level, badges and learning history." />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 place-items-center rounded-2xl brand-gradient text-2xl font-bold text-primary-foreground">
              {(name?.[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-background/40 px-3 py-1.5 text-base font-semibold outline-none" />
              <p className="mt-1 text-xs text-muted-foreground">Level {data?.profile.level ?? 1} · {data?.profile.xp ?? 0} XP</p>
            </div>
          </div>
          <button onClick={() => saveMut.mutate()} className="mt-4 w-full rounded-lg brand-gradient py-2 text-sm font-medium text-primary-foreground">Save</button>

          <div className="mt-6 space-y-3">
            <Stat icon={<Flame className="h-4 w-4 text-orange-400" />} label="Streak" value={`${data?.profile.streak ?? 0} days`} />
            <Stat icon={<BookOpen className="h-4 w-4 text-accent" />} label="Notes saved" value={data?.stats.notes ?? 0} />
            <Stat icon={<Brain className="h-4 w-4 text-purple-400" />} label="Quizzes taken" value={data?.stats.quizzes ?? 0} />
            <Stat icon={<MessageCircle className="h-4 w-4" />} label="Tutor chats" value={data?.stats.sessions ?? 0} />
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-yellow-400" /> Achievements</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {BADGES.map((b) => {
              const got = earned.has(b.id);
              return (
                <div key={b.id} className={`rounded-xl border p-4 text-center transition ${got ? "border-accent bg-accent/10" : "border-border bg-background/20 opacity-60"}`}>
                  <div className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${got ? "brand-gradient text-primary-foreground" : "bg-secondary"}`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <p className="mt-2 font-medium">{b.label}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-4">
        <h3 className="mb-3 text-sm font-semibold">Recent quiz history</h3>
        {data?.stats.recentQuizzes.length ? (
          <ul className="space-y-2 text-sm">
            {data.stats.recentQuizzes.slice(0, 10).map((q, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/30 p-3">
                <div>
                  <p className="font-medium">{q.topic}</p>
                  <p className="text-xs text-muted-foreground">{q.difficulty} · {new Date(q.created_at).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs">{q.score}/{q.total}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground">Nothing yet.</p>}
      </GlassCard>
    </Section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-3 py-2">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">{icon} {label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

type ProfileData = Awaited<ReturnType<ReturnType<typeof useServerFn<typeof getMyProfile>>>>;
function computeAuto(d?: ProfileData) {
  if (!d) return [] as string[];
  const out: string[] = [];
  if (d.stats.quizzes > 0) out.push("first_steps");
  if ((d.profile.streak ?? 0) >= 7) out.push("streak_7");
  if (d.stats.recentQuizzes.some((q) => q.score === q.total && q.total > 0)) out.push("quiz_master");
  if (d.stats.sessions > 0) out.push("ai_explorer");
  if ((d.profile.level ?? 1) >= 5) out.push("fast_learner");
  return out;
}
