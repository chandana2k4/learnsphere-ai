import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  last_active_date: string | null;
};

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .single();
    if (error) throw new Error(error.message);

    const [{ count: noteCount }, { count: quizCount }, { count: sessionCount }] =
      await Promise.all([
        context.supabase.from("notes").select("id", { count: "exact", head: true }),
        context.supabase.from("quizzes").select("id", { count: "exact", head: true }),
        context.supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
      ]);

    const { data: quizzes } = await context.supabase
      .from("quizzes")
      .select("score, total, created_at, topic, difficulty")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: achievements } = await context.supabase
      .from("achievements")
      .select("badge, earned_at");

    return {
      profile: data as Profile,
      stats: {
        notes: noteCount ?? 0,
        quizzes: quizCount ?? 0,
        sessions: sessionCount ?? 0,
        recentQuizzes: quizzes ?? [],
      },
      achievements: achievements ?? [],
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ name: z.string().min(1).max(80).optional(), avatar_url: z.string().url().nullable().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
