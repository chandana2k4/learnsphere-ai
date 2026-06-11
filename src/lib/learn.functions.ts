import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LearnContent = {
  overview: string;
  definition: string;
  explanation: string;
  keyConcepts: { title: string; description: string }[];
  examples: { title: string; content: string }[];
  applications: string[];
  interviewQuestions: { q: string; a: string }[];
  summary: string;
};

export const generateNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ topic: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }): Promise<{ content: LearnContent }> => {
    const { callLovableChat, parseJsonLoose } = await import("./ai-gateway.server");
    const system =
      "You are LearnSphere AI, an expert tutor. Produce structured, accurate, exam-grade study material. Always reply with JSON only.";
    const prompt = `Generate a comprehensive learning module on: "${data.topic}".

Return JSON with this exact shape:
{
  "overview": "2-3 sentence intro",
  "definition": "precise definition",
  "explanation": "300-500 words explanation (use \\n\\n between paragraphs)",
  "keyConcepts": [{"title":"...","description":"..."}],
  "examples": [{"title":"...","content":"..."}],
  "applications": ["..."],
  "interviewQuestions": [{"q":"...","a":"..."}],
  "summary": "3-4 sentence wrap-up"
}

Include at minimum: 4 keyConcepts, 3 examples, 5 applications, 5 interviewQuestions.`;

    const raw = await callLovableChat({ system, prompt, json: true });
    const content = parseJsonLoose<LearnContent>(raw);
    return { content };
  });

export const saveNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ topic: z.string().min(1).max(200), content: z.any() }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { error, data: row } = await context.supabase
      .from("notes")
      .insert({ user_id: context.userId, topic: data.topic, content: data.content })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const listNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notes")
      .select("id, topic, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { notes: (data ?? []) as { id: string; topic: string; created_at: string }[] };
  });

export const getNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("notes")
      .select("id, topic, content, created_at")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return {
      note: row as {
        id: string;
        topic: string;
        content: LearnContent;
        created_at: string;
      },
    };
  });
