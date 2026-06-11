import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_sessions")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { sessions: (data ?? []) as { id: string; title: string; updated_at: string }[] };
  });

export const createSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_sessions")
      .insert({ user_id: context.userId, title: "New chat" })
      .select("id, title, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return { session: data as { id: string; title: string; updated_at: string } };
  });

export const getMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return {
      messages: (rows ?? []) as {
        id: string;
        role: "user" | "assistant" | "system";
        content: string;
        created_at: string;
      }[],
    };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        sessionId: z.string().uuid(),
        content: z.string().min(1).max(4000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ reply: string }> => {
    // Load history
    const { data: history } = await context.supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true })
      .limit(40);

    // Save user message
    await context.supabase.from("chat_messages").insert({
      session_id: data.sessionId,
      user_id: context.userId,
      role: "user",
      content: data.content,
    });

    // If first user message, set title
    if (!history?.length) {
      await context.supabase
        .from("chat_sessions")
        .update({ title: data.content.slice(0, 60) })
        .eq("id", data.sessionId);
    } else {
      await context.supabase
        .from("chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", data.sessionId);
    }

    const { callLovableChat } = await import("./ai-gateway.server");
    const system = `You are the LearnSphere AI Tutor — friendly, deeply knowledgeable. For every learning question, structure your response with markdown using these sections:

## Explanation
Clear, intuitive explanation.

## Example
A concrete worked example.

## Practical Use Case
Where this matters in the real world.

## Practice Question
One short question for the user to try (don't include the answer).

Use code blocks for code. Keep it concise but complete.`;

    const messages = [
      { role: "system" as const, content: system },
      ...(history ?? []).map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content as string,
      })),
      { role: "user" as const, content: data.content },
    ];

    const reply = await callLovableChat({ messages });

    await context.supabase.from("chat_messages").insert({
      session_id: data.sessionId,
      user_id: context.userId,
      role: "assistant",
      content: reply,
    });

    return { reply };
  });

export const deleteSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("chat_sessions")
      .delete()
      .eq("id", data.sessionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
