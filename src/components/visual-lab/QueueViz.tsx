import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { Btn } from "./StackViz";

export function QueueViz() {
  const [q, setQ] = useState<number[]>([5, 9, 2, 14]);
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("");

  function enqueue() {
    const v = Number(value);
    if (Number.isNaN(v)) return;
    setQ((s) => [...s, v]);
    setMsg(`enqueue(${v})`);
    setValue("");
  }
  function dequeue() {
    setQ((s) => {
      if (!s.length) return s;
      setMsg(`dequeue() → ${s[0]}`);
      return s.slice(1);
    });
  }

  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="w-32 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm outline-none" />
        <Btn onClick={enqueue}>Enqueue</Btn>
        <Btn onClick={dequeue} variant="outline">Dequeue</Btn>
        <span className="ml-auto text-xs text-muted-foreground">FIFO · first in, first out</span>
      </div>

      <div className="relative flex min-h-32 items-center gap-2 overflow-x-auto rounded-xl border-y-2 border-border bg-background/30 p-4">
        <span className="text-xs text-muted-foreground">front →</span>
        <AnimatePresence>
          {q.map((v, i) => (
            <motion.div key={i + "-" + v} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="grid h-14 w-14 shrink-0 place-items-center rounded-xl brand-gradient text-sm font-semibold text-primary-foreground">
              {v}
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="ml-auto text-xs text-muted-foreground">← rear</span>
      </div>
      <p className="mt-3 text-center text-sm text-accent">{msg}</p>
    </GlassCard>
  );
}
