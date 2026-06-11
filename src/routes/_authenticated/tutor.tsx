import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { GlassCard, PageHeader, Section } from "@/components/GlassCard";
import { listSessions, createSession, getMessages, sendMessage, deleteSession } from "@/lib/tutor.functions";
import { MessageCircle, Plus, Send, Trash2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tutor")({ component: TutorPage });

function TutorPage() {
  const listFn = useServerFn(listSessions);
  const createFn = useServerFn(createSession);
  const getFn = useServerFn(getMessages);
  const sendFn = useServerFn(sendMessage);
  const delFn = useServerFn(deleteSession);
  const qc = useQueryClient();

  const sessions = useQuery({ queryKey: ["tutor-sessions"], queryFn: () => listFn() });
  const [active, setActive] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active && sessions.data?.sessions[0]) setActive(sessions.data.sessions[0].id);
  }, [sessions.data, active]);

  const messages = useQuery({
    queryKey: ["tutor-msgs", active],
    queryFn: () => getFn({ data: { sessionId: active! } }),
    enabled: !!active,
  });

  const createMut = useMutation({
    mutationFn: () => createFn(),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["tutor-sessions"] });
      setActive(res.session.id);
    },
  });

  const sendMut = useMutation({
    mutationFn: (content: string) => sendFn({ data: { sessionId: active!, content } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tutor-msgs", active] });
      qc.invalidateQueries({ queryKey: ["tutor-sessions"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { sessionId: id } }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["tutor-sessions"] });
      if (active === id) setActive(null);
    },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.data, sendMut.isPending]);

  async function ensureSessionAndSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    let sid = active;
    if (!sid) {
      const res = await createFn();
      sid = res.session.id;
      setActive(sid);
      qc.invalidateQueries({ queryKey: ["tutor-sessions"] });
    }
    // optimistic append
    qc.setQueryData(["tutor-msgs", sid], (old: { messages: { id: string; role: string; content: string; created_at: string }[] } | undefined) => ({
      messages: [
        ...(old?.messages ?? []),
        { id: "tmp-" + Date.now(), role: "user", content: text, created_at: new Date().toISOString() },
      ],
    }));
    sendMut.mutate(text);
  }

  return (
    <Section className="!py-6">
      <PageHeader icon={<MessageCircle className="h-5 w-5" />} title="AI Tutor" subtitle="Conversational tutoring with memory across messages." />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <GlassCard className="!p-3">
          <button onClick={() => createMut.mutate()} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl brand-gradient px-3 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" /> New chat
          </button>
          <div className="max-h-[60vh] space-y-1 overflow-y-auto">
            {sessions.data?.sessions.map((s) => (
              <div key={s.id} className="group flex items-center gap-1">
                <button
                  onClick={() => setActive(s.id)}
                  className={`flex-1 truncate rounded-lg px-3 py-2 text-left text-sm ${active === s.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}
                >{s.title}</button>
                <button onClick={() => delMut.mutate(s.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" /></button>
              </div>
            ))}
            {!sessions.data?.sessions.length && <p className="px-3 py-6 text-center text-xs text-muted-foreground">No chats yet</p>}
          </div>
        </GlassCard>

        <GlassCard className="!p-0 flex h-[72vh] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {!messages.data?.messages.length && !sendMut.isPending && (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl brand-gradient text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
                  <p className="text-lg font-semibold">Ask me anything</p>
                  <p className="text-sm text-muted-foreground">Concepts, code, explanations — I'm here.</p>
                </div>
              </div>
            )}
            {messages.data?.messages.map((m) => (
              <Message key={m.id} role={m.role} content={m.content} />
            ))}
            {sendMut.isPending && (
              <Message role="assistant" content="" thinking />
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ensureSessionAndSend(); }} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the tutor anything…"
              className="flex-1 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-foreground/25"
            />
            <button disabled={sendMut.isPending} className="grid h-11 w-11 place-items-center rounded-xl brand-gradient text-primary-foreground disabled:opacity-60">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </GlassCard>
      </div>
    </Section>
  );
}

function Message({ role, content, thinking }: { role: string; content: string; thinking?: boolean }) {
  const isUser = role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${isUser ? "brand-gradient text-primary-foreground" : "bg-secondary text-foreground"}`}>
        {thinking ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span className="text-muted-foreground">Thinking…</span>
          </span>
        ) : isUser ? (
          <p>{content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_pre]:bg-background/60 [&_pre]:rounded-lg [&_code]:text-accent">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
