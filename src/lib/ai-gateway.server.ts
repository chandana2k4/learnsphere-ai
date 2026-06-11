import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function getLovableGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/** Direct fetch helper for non-AI-SDK JSON calls (faster, smaller bundle). */
export async function callLovableChat(opts: {
  model?: string;
  system?: string;
  messages?: { role: "system" | "user" | "assistant"; content: string }[];
  prompt?: string;
  json?: boolean;
}) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const model = opts.model ?? "google/gemini-3-flash-preview";
  const messages = opts.messages ?? [
    ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
    { role: "user" as const, content: opts.prompt ?? "" },
  ];
  const body: Record<string, unknown> = { model, messages };
  if (opts.json) body.response_format = { type: "json_object" };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "lovable-direct",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please retry in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in your workspace billing.");
    throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

export function parseJsonLoose<T = unknown>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    const aStart = cleaned.indexOf("[");
    const aEnd = cleaned.lastIndexOf("]");
    if (aStart >= 0 && aEnd > aStart) {
      return JSON.parse(cleaned.slice(aStart, aEnd + 1)) as T;
    }
    throw new Error("Could not parse JSON from AI response");
  }
}
