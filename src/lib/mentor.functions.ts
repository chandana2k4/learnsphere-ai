import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MentorContent = {
  careers: {
    title: string;
    description: string;
    requiredSkills: string[];
    certifications: string[];
    salaryInsights: string;
    futureOpportunities: string;
  }[];
};

export const generateMentor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        skills: z.string().min(1).max(500),
        interests: z.string().min(1).max(500),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ content: MentorContent }> => {
    const { callLovableChat, parseJsonLoose } = await import("./ai-gateway.server");
    const prompt = `Given a person's skills and interests, suggest 4 strong career paths. JSON only.
Skills: ${data.skills}
Interests: ${data.interests}

Return: { "careers": [ { "title":"...", "description":"2-3 sentences", "requiredSkills":["..."], "certifications":["..."], "salaryInsights":"realistic global range and growth", "futureOpportunities":"where this is headed" } ] }`;
    const raw = await callLovableChat({
      system: "You are a senior career mentor. Reply with JSON only.",
      prompt,
      json: true,
    });
    const content = parseJsonLoose<MentorContent>(raw);
    return { content };
  });

export const saveMentor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ input: z.any(), content: z.any() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("mentor_results")
      .insert({ user_id: context.userId, input: data.input, content: data.content });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
