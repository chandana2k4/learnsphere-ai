import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Btn } from "./StackViz";

export function LinkedListViz() {
  const [list, setList] = useState<number[]>([3, 7, 12, 19]);
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("");

  function insert() {
    const v = Number(value);
    if (Number.isNaN(v)) return;
    setList((l) => [...l, v]);
    setMsg(`insert(${v}) at tail`);
    setValue("");
  }
  function del() {
    const v = Number(value);
    if (Number.isNaN(v)) return;
    setList((l) => {
      const i = l.indexOf(v);
      if (i < 0) { setMsg(`${v} not found`); return l; }
      setMsg(`delete(${v})`);
      return l.filter((_, idx) => idx !== i);
    });
  }
  function search() {
    const v = Number(value);
    if (Number.isNaN(v)) return;
    setMsg(list.includes(v) ? `Found ${v} at index ${list.indexOf(v)}` : `${v} not found`);
  }

  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="w-32 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm outline-none" />
        <Btn onClick={insert}>Insert</Btn>
        <Btn onClick={del} variant="outline">Delete</Btn>
        <Btn onClick={search} variant="outline">Search</Btn>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background/30 p-4">
        <span className="text-xs text-muted-foreground">HEAD →</span>
        <AnimatePresence>
          {list.map((v, i) => (
            <motion.div key={i + "-" + v} layout initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} className="flex items-center gap-2">
              <div className="grid h-14 w-20 place-items-center rounded-xl brand-gradient text-sm font-semibold text-primary-foreground">
                {v}
              </div>
              {i < list.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="text-xs text-muted-foreground">→ NULL</span>
      </div>
      <p className="mt-3 text-center text-sm text-accent">{msg}</p>
    </GlassCard>
  );
}
