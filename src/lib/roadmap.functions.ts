import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type RoadmapContent = {
  levels: {
    name: "Beginner" | "Intermediate" | "Advanced";
    skills: string[];
    projects: string[];
    resources: string[];
    certifications: string[];
  }[];
};

export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ goal: z.string().min(1).max(150) }).parse(d))
  .handler(async ({ data }): Promise<{ content: RoadmapContent }> => {
    const { callLovableChat, parseJsonLoose } = await import("./ai-gateway.server");
    const prompt = `Build a 2026 career roadmap for becoming a "${data.goal}". JSON only:
{ "levels": [
  { "name": "Beginner", "skills": ["..."], "projects": ["..."], "resources": ["..."], "certifications": ["..."] },
  { "name": "Intermediate", ... },
  { "name": "Advanced", ... }
] }
Each level: 6-8 skills, 3-4 projects, 4-5 resources, 2-3 certifications. Concrete and modern.`;
    const raw = await callLovableChat({
      system: "You generate concrete, modern career roadmaps. Reply with JSON only.",
      prompt,
      json: true,
    });
    return { content: parseJsonLoose<RoadmapContent>(raw) };
  });

export const saveRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ goal: z.string(), content: z.any() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("roadmaps")
      .insert({ user_id: context.userId, goal: data.goal, content: data.content });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listRoadmaps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("roadmaps")
      .select("id, goal, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { roadmaps: (data ?? []) as { id: string; goal: string; created_at: string }[] };
  });
