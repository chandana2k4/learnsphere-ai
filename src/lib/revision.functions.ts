import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type RevisionKind = "flashcards" | "quick_notes" | "one_pager" | "exam_prep";

export type RevisionContent =
  | { kind: "flashcards"; cards: { front: string; back: string }[] }
  | { kind: "quick_notes"; bullets: string[] }
  | { kind: "one_pager"; sections: { heading: string; body: string }[] }
  | { kind: "exam_prep"; topics: { topic: string; mustKnow: string[] }[] };

export const generateRevision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        topic: z.string().min(1).max(200),
        kind: z.enum(["flashcards", "quick_notes", "one_pager", "exam_prep"]),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ content: RevisionContent }> => {
    const { callLovableChat, parseJsonLoose } = await import("./ai-gateway.server");
    let prompt = "";
    if (data.kind === "flashcards")
      prompt = `Make 10 high-quality flashcards on "${data.topic}". JSON: { "cards": [{"front":"...","back":"..."}] }`;
    else if (data.kind === "quick_notes")
      prompt = `Quick revision notes for "${data.topic}". JSON: { "bullets": ["...","..."] } (10-15 bullets)`;
    else if (data.kind === "one_pager")
      prompt = `One-page summary of "${data.topic}". JSON: { "sections": [{"heading":"...","body":"..."}] } (5-7 sections)`;
    else
      prompt = `Exam preparation outline for "${data.topic}". JSON: { "topics": [{"topic":"...","mustKnow":["..."]}] } (6-8 topics, 4-6 must-knows each)`;

    const raw = await callLovableChat({
      system: "You produce concise, accurate study materials. Reply with JSON only.",
      prompt,
      json: true,
    });
    const parsed = parseJsonLoose<Record<string, unknown>>(raw);
    return { content: { kind: data.kind, ...(parsed as object) } as RevisionContent };
  });

export const saveRevision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        topic: z.string(),
        kind: z.enum(["flashcards", "quick_notes", "one_pager", "exam_prep"]),
        content: z.any(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("revision_items")
      .insert({ user_id: context.userId, topic: data.topic, kind: data.kind, content: data.content });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listRevision = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("revision_items")
      .select("id, topic, kind, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return {
      items: (data ?? []) as {
        id: string;
        topic: string;
        kind: RevisionKind;
        created_at: string;
      }[],
    };
  });
