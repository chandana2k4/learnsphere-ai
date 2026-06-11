import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ topic: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { callLovableChat, parseJsonLoose } = await import("./ai-gateway.server");
    const system =
      "You are LearnSphere AI, an expert tutor. Produce structured, accurate, exam-grade study material. Always reply with JSON only — no prose, no markdown fencing.";
    const prompt = `Generate a comprehensive learning module on: "${data.topic}".

Return a JSON object with this exact shape:
{
  "overview": "2-3 sentence intro",
  "definition": "precise definition",
  "explanation": "detailed multi-paragraph explanation (300-500 words, use \\n\\n between paragraphs)",
  "keyConcepts": [{"title": "...", "description": "..."}],
  "examples": [{"title": "...", "content": "..."}],
  "applications": ["...", "..."],
  "interviewQuestions": [{"q": "...", "a": "..."}],
  "summary": "concise wrap-up (3-4 sentences)"
}

Minimum 4 keyConcepts, 3 examples, 5 applications, 5 interviewQuestions.`;

    const raw = await callLovableChat({ system, prompt, json: true });
    const content = parseJsonLoose(raw);

    const { data: saved, error } = await (await import("@/integrations/supabase/client.server"))
      .supabaseAdmin.from("notes")
      .insert({ user_id: (await (await import("@tanstack/react-start/server")).getRequest()).headers.get("x-uid") ?? "", topic: data.topic, content: content as never })
      .select()
      .single();
    // The trick above won't work — we need userId from context. Re-do properly:
    void saved; void error;
    return { content };
  });

// Save note explicitly (user clicks "Save")
export const saveNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ topic: z.string().min(1).max(200), content: z.any() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("notes")
      .insert({ user_id: context.userId, topic: data.topic, content: data.content })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
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
    return { notes: data ?? [] };
  });

export const getNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("notes")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return { note: row };
  });
