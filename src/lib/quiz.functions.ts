import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type QuizQuestion = {
  type: "mcq" | "true_false" | "fill_blank";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
};

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        topic: z.string().min(1).max(200),
        difficulty: z.enum(["easy", "medium", "hard"]),
        count: z.number().int().min(3).max(15),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ questions: QuizQuestion[] }> => {
    const { callLovableChat, parseJsonLoose } = await import("./ai-gateway.server");
    const system =
      "You are a quiz generator. Always reply with JSON only. Mix question types fairly.";
    const prompt = `Create ${data.count} ${data.difficulty} questions about "${data.topic}".
Mix types: mcq, true_false, fill_blank.
Return JSON: { "questions": [ { "type": "mcq"|"true_false"|"fill_blank", "question": "...", "options": ["A","B","C","D"] (only for mcq, exactly 4), "answer": "exact option text for mcq, 'True' or 'False' for true_false, single phrase for fill_blank", "explanation": "1-3 sentence explanation" } ] }`;
    const raw = await callLovableChat({ system, prompt, json: true });
    const parsed = parseJsonLoose<{ questions: QuizQuestion[] }>(raw);
    return { questions: parsed.questions };
  });

export const saveQuizResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        topic: z.string(),
        difficulty: z.string(),
        total: z.number(),
        score: z.number(),
        questions: z.any(),
        answers: z.any(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("quizzes").insert({
      user_id: context.userId,
      topic: data.topic,
      difficulty: data.difficulty,
      total: data.total,
      score: data.score,
      questions: data.questions,
      answers: data.answers,
    });
    if (error) throw new Error(error.message);
    // Award XP
    const xpGain = data.score * 10;
    const { data: prof } = await context.supabase
      .from("profiles")
      .select("xp, level, streak, last_active_date")
      .eq("id", context.userId)
      .single();
    if (prof) {
      const newXp = (prof.xp ?? 0) + xpGain;
      const newLevel = Math.max(1, Math.floor(newXp / 200) + 1);
      const today = new Date().toISOString().slice(0, 10);
      const last = prof.last_active_date;
      let newStreak = prof.streak ?? 0;
      if (last !== today) {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        newStreak = last === y.toISOString().slice(0, 10) ? newStreak + 1 : 1;
      }
      await context.supabase
        .from("profiles")
        .update({ xp: newXp, level: newLevel, streak: newStreak, last_active_date: today })
        .eq("id", context.userId);
    }
    return { ok: true, xpGain };
  });

export const listQuizzes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("quizzes")
      .select("id, topic, difficulty, total, score, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return {
      quizzes: (data ?? []) as {
        id: string;
        topic: string;
        difficulty: string;
        total: number;
        score: number;
        created_at: string;
      }[],
    };
  });
